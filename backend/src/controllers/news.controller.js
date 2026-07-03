const News = require("../models/news.model");
const { fetchTopHeadlines, isGNewsRateLimited, activateRateLimitBackoff } = require("../service/newsProvider.service");

// ─── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  /** Articles per page when no limit is provided. */
  DEFAULT_PAGE_LIMIT: 10,

  /** Category/country/language defaults. */
  DEFAULT_CATEGORY: "general",
  DEFAULT_COUNTRY: "in",
  DEFAULT_LANGUAGE: "en",

  /**
   * In-process deduplication window (ms).
   * Prevents duplicate calls for the same combination within 15 minutes.
   */
  DEDUP_WINDOW_MS: 15 * 60 * 1000,
};

// ─── Request deduplication map ────────────────────────────────────────────────
// Key: "category:country:language"  Value: timestamp of last successful fetch
const recentFetches = new Map();

/**
 * Returns true if a provider API call is allowed for this combination.
 * Returns false if the same combination was fetched within the last 15 minutes.
 */
function canCallGNews(category, country, language) {
  const now = Date.now();

  // Per-combination deduplication
  const key = `${category}:${country}:${language}`;
  const lastFetch = recentFetches.get(key);
  if (lastFetch && now - lastFetch < CONFIG.DEDUP_WINDOW_MS) {
    const secAgo = Math.floor((now - lastFetch) / 1000);
    console.log(`[News] ⏭️ Dedup hit for "${key}" — fetched ${secAgo}s ago, skipping`);
    return false;
  }

  return true;
}

/** Mark a combination as just-fetched so the dedup window starts. */
function markFetched(category, country, language) {
  recentFetches.set(`${category}:${country}:${language}`, Date.now());
}


// Periodic cleanup of the dedup map to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, ts] of recentFetches.entries()) {
    if (now - ts > CONFIG.DEDUP_WINDOW_MS) {
      recentFetches.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[GNews Dedup] 🧹 Removed ${cleaned} stale entries`);
  }
}, 5 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Bulk-upsert articles into MongoDB using articleUrl as the unique key.
 * Prevents duplicates; updates metadata if a field changed.
 * @param {object[]} articles — normalised article objects from gnews.service
 */
async function upsertArticles(articles) {
  if (!articles.length) return;
  const ops = articles.map((article) => ({
    updateOne: {
      filter: { articleUrl: article.articleUrl },
      update: { $set: article },
      upsert: true,
    },
  }));
  await News.bulkWrite(ops, { ordered: false });
  console.log(`[DB] ✅ Upserted ${articles.length} articles`);
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/news
 *
 * Database-first strategy:
 *   1. Count matching documents in MongoDB.
 *   2. If DB has enough articles for the requested page → serve directly.
 *   3. If DB is short AND GNews is allowed → fetch page 1 from GNews, upsert, re-query.
 *   4. On 429 → activate backoff, serve whatever is in the DB.
 *   5. On any other GNews failure → serve from DB (graceful degradation).
 *
 * GNews is ALWAYS called with page=1 only.
 * MongoDB handles all pagination — GNews page > 1 is not used on the free tier.
 */
const getNews = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || CONFIG.DEFAULT_PAGE_LIMIT);
    const category = req.query.category || CONFIG.DEFAULT_CATEGORY;
    const country = req.query.country || CONFIG.DEFAULT_COUNTRY;
    const language = req.query.language || CONFIG.DEFAULT_LANGUAGE;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Build filter
    const filter = { category, country, language };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // ── Step 1: How many articles does MongoDB already have? ──────────────────
    const requiredCount = page * limit;
    console.log(`[News] 🔍 ${category}/${country}/${language} page=${page} limit=${limit} — need ${requiredCount} docs`);

    let cachedCount = await News.countDocuments(filter);
    console.log(`[News] 💾 MongoDB has ${cachedCount} matching articles`);

    // ── Step 2: Fetch from GNews only when genuinely needed ───────────────────
    // Condition: DB is short AND we haven't recently fetched AND not rate-limited
    if (cachedCount < requiredCount && !search && canCallGNews(category, country, language)) {
      console.log(`[News] 📡 DB short by ${requiredCount - cachedCount} — calling News Provider (page=1 only)...`);

      try {
        const fetched = await fetchTopHeadlines({
          page: 1,       // Always page 1 — free tier only
          limit: 10,     // Max the free tier reliably returns
          category,
          country,
          language,
        });

        markFetched(category, country, language);

        if (fetched.length > 0) {
          await upsertArticles(fetched);
          // Re-count after upsert
          cachedCount = await News.countDocuments(filter);
          console.log(`[News] ✅ After upsert — MongoDB now has ${cachedCount} matching articles`);
        } else {
          console.log("[News] ⚠️ News Provider returned 0 articles");
        }
      } catch (apiErr) {
        console.error("[News] ❌ News Provider API error:", apiErr.message);
        // Graceful degradation — fall through and serve from DB
      }
    } else if (cachedCount >= requiredCount) {
      console.log("[News] ✅ Cache hit — serving from MongoDB, no GNews call needed");
    } else if (search) {
      console.log("[News] 🔍 Search query active — skipping GNews, serving DB results only");
    }

    // ── Step 3: Serve from MongoDB ─────────────────────────────────────────────
    const [articles, total] = await Promise.all([
      News.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),          // lean(): plain JS objects, ~2-3x faster for read-only
      News.countDocuments(filter),
    ]);

    console.log(`[News] 📤 Returning ${articles.length} articles (total: ${total})`);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      data: articles,
    });

  } catch (err) {
    console.error("[News] ❌ Unhandled error in getNews:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/news/:id
 * Returns a single article by MongoDB _id.
 */
const getNewsById = async (req, res) => {
  try {
    const article = await News.findById(req.params.id).lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getNews,
  getNewsById,
};