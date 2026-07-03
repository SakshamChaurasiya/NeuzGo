const mongoose = require("mongoose");
const News = require("../models/news.model");
const { fetchTopHeadlines, isGNewsRateLimited, activateRateLimitBackoff } = require("../service/newsProvider.service");
const newsDataService = require("../service/newsdata.service");
const NewsCursor = mongoose.model("NewsCursor");


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
function canCallGNews(category, country, language, page = 1) {
  const now = Date.now();

  // Per-combination and per-page deduplication
  const key = `${category}:${country}:${language}:${page}`;
  const lastFetch = recentFetches.get(key);
  if (lastFetch && now - lastFetch < CONFIG.DEDUP_WINDOW_MS) {
    const secAgo = Math.floor((now - lastFetch) / 1000);
    console.log(`[News] ⏭️ Dedup hit for "${key}" — fetched ${secAgo}s ago, skipping`);
    return false;
  }

  return true;
}

/** Mark a combination as just-fetched so the dedup window starts. */
function markFetched(category, country, language, page = 1) {
  recentFetches.set(`${category}:${country}:${language}:${page}`, Date.now());
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

    // ── Step 2: Fetch from Providers only when genuinely needed ───────────────────
    if (cachedCount < requiredCount && !search) {
      console.log(`[News] 📡 DB short by ${requiredCount - cachedCount} — calling News Provider...`);

      let currentProviderPage = Math.floor(cachedCount / 10) + 1;
      let fetchedCount = cachedCount;
      let newsDataCursor = null;
      let iterations = 0;
      const MAX_ITERATIONS = 5; // Prevent runaway requests

      while (fetchedCount < requiredCount && iterations < MAX_ITERATIONS) {
        // Look up newsDataCursor from DB if it is null and currentProviderPage > 1
        if (!newsDataCursor && currentProviderPage > 1) {
          const cursorDoc = await NewsCursor.findOne({
            key: `${category}:${country}:${language}:${currentProviderPage - 1}`
          }).lean();
          if (cursorDoc) {
            newsDataCursor = cursorDoc.cursor;
            console.log(`[News] 💾 Found NewsData.io cursor in DB for page ${currentProviderPage - 1}: ${newsDataCursor}`);
          }
        }

        // Only fetch if GNews isn't rate-limited, OR we're doing NewsData.io cursor stream, OR we haven't fetched this page recently
        const canFetch = newsDataCursor || canCallGNews(category, country, language, currentProviderPage);
        if (!canFetch) {
          console.log(`[News] ⏭️ Page ${currentProviderPage} recently fetched, incrementing page to check next...`);
          currentProviderPage++;
          iterations++;
          continue;
        }

        iterations++;
        try {
          let fetched = null;
          let usedNewsData = false;

          // Try GNews first if not rate limited and we don't have a NewsData cursor
          if (!isGNewsRateLimited() && !newsDataCursor) {
            try {
              console.log(`[News] 📡 Fetching GNews page ${currentProviderPage}...`);
              fetched = await fetchTopHeadlines({
                page: currentProviderPage,
                limit: 10,
                category,
                country,
                language,
              });
            } catch (apiErr) {
              console.error("[News] ❌ GNews API error:", apiErr.message);
            }
          }

          // Fallback to NewsData.io if GNews failed, returned 0 articles, or was skipped
          if (!fetched || fetched.length === 0) {
            console.log(`[News] 🔄 Using NewsData.io fallback for page ${currentProviderPage}...`);
            try {
              fetched = await newsDataService.fetchTopHeadlines({
                page: newsDataCursor || currentProviderPage,
                limit: 10,
                category,
                country,
                language,
              });
              usedNewsData = true;
            } catch (apiErr) {
              console.error("[News] ❌ NewsData.io API error:", apiErr.message);
            }
          }

          if (fetched && fetched.nextPage) {
            newsDataCursor = fetched.nextPage;
            if (usedNewsData) {
              await NewsCursor.updateOne(
                { key: `${category}:${country}:${language}:${currentProviderPage}` },
                { cursor: newsDataCursor },
                { upsert: true }
              );
              console.log(`[News] 💾 Saved NewsData.io cursor for page ${currentProviderPage}`);
            }
          } else {
            newsDataCursor = null;
          }

          markFetched(category, country, language, currentProviderPage);

          if (fetched && fetched.length > 0) {
            await upsertArticles(fetched);
            // Re-count available articles
            const newCount = await News.countDocuments(filter);
            console.log(`[News] 💾 After upsert — MongoDB now has ${newCount} articles (was ${fetchedCount})`);

            // If no new unique articles were added, and we didn't use NewsData.io yet, try NewsData.io!
            if (newCount <= fetchedCount && !usedNewsData) {
              console.log("[News] ⏹️ GNews returned duplicates. Trying fallback to NewsData.io...");
              try {
                fetched = await newsDataService.fetchTopHeadlines({
                  page: newsDataCursor || currentProviderPage,
                  limit: 10,
                  category,
                  country,
                  language,
                });
                if (fetched && fetched.length > 0) {
                  if (fetched.nextPage) {
                    newsDataCursor = fetched.nextPage;
                    await NewsCursor.updateOne(
                      { key: `${category}:${country}:${language}:${currentProviderPage}` },
                      { cursor: newsDataCursor },
                      { upsert: true }
                    );
                    console.log(`[News] 💾 Saved NewsData.io cursor for page ${currentProviderPage}`);
                  }
                  await upsertArticles(fetched);
                  const afterNewsDataCount = await News.countDocuments(filter);
                  if (afterNewsDataCount > fetchedCount) {
                    fetchedCount = afterNewsDataCount;
                    currentProviderPage++;
                    continue; // successfully got new articles from NewsData.io
                  }
                }
              } catch (err) {
                console.error("[News] ❌ NewsData.io fallback after GNews duplicates failed:", err.message);
              }
            }

            if (newCount <= fetchedCount) {
              console.log("[News] ⏹️ No new unique articles were added after all attempts. Stopping.");
              break;
            }
            fetchedCount = newCount;
          } else {
            console.log(`[News] ⏹️ Provider returned 0 articles at page ${currentProviderPage}`);
            break;
          }

          currentProviderPage++;
        } catch (apiErr) {
          console.error("[News] ❌ News Provider API error in loop:", apiErr.message);
          break;
        }
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

    const hasNext = articles.length === limit;
    const totalPages = hasNext ? Math.max(Math.ceil(total / limit), page + 1) : Math.ceil(total / limit);

    console.log(`[News] 📤 Returning ${articles.length} articles (total: ${total}, hasNext: ${hasNext}, totalPages: ${totalPages})`);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrevious: page > 1,
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