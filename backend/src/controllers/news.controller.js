const mongoose = require("mongoose");
const News = require("../models/news.model");
const { fetchArticles } = require("../service/providerManager.service");
const translationService = require("../service/translation.service");
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
/**
 * Lazily translates an article card (title and description).
 */
async function translateArticleCard(article, readingLanguage) {
  let origLang = article.originalLanguage || article.language || "en";
  // Normalise invalid stored codes (e.g., "al" from old "all" fetch key) to "en"
  if (!origLang || origLang.length !== 2 || origLang === "al") origLang = "en";

  // Force translation to English if title contains Hindi (Devanagari) characters
  const hasDevanagari = /[\u0900-\u097F]/.test(article.title || "");
  if (hasDevanagari && readingLanguage === "en" && origLang === "en") {
    origLang = "hi";
  }

  if (readingLanguage === origLang) {
    return article;
  }

  // Check if translation is cached
  const cached = article.translations?.find((t) => t.language === readingLanguage);
  if (cached) {
    return {
      ...article,
      title: cached.title,
      description: cached.description,
      language: readingLanguage,
    };
  }

  const origTitle = article.originalTitle || article.title;
  const origDesc = article.originalDescription || article.description || "";

  const translated = await translationService.translateFields(
    origTitle,
    origDesc,
    readingLanguage,
    origLang
  );

  // Cache in DB
  try {
    await News.updateOne(
      { _id: article._id },
      {
        $push: {
          translations: {
            language: readingLanguage,
            title: translated.title,
            description: translated.description,
            content: "",
          },
        },
      }
    );
  } catch (err) {
    console.error(`[News] ❌ Failed to cache card translation for ${article._id}:`, err.message);
  }

  return {
    ...article,
    title: translated.title,
    description: translated.description,
    language: readingLanguage,
  };
}

/**
 * Lazily translates the full article details (title, description, content).
 */
async function translateArticleDetails(article, readingLanguage) {
  let origLang = article.originalLanguage || article.language || "en";
  // Normalise invalid stored codes (e.g., "al" from old "all" fetch key) to "en"
  if (!origLang || origLang.length !== 2 || origLang === "al") origLang = "en";

  // Force translation to English if title contains Hindi (Devanagari) characters
  const hasDevanagari = /[\u0900-\u097F]/.test(article.title || "");
  if (hasDevanagari && readingLanguage === "en" && origLang === "en") {
    origLang = "hi";
  }

  if (readingLanguage === origLang) {
    return article;
  }

  const cached = article.translations?.find((t) => t.language === readingLanguage);
  if (cached && cached.content) {
    return {
      ...article,
      title: cached.title,
      description: cached.description,
      content: cached.content,
      language: readingLanguage,
    };
  }

  const origTitle = article.originalTitle || article.title;
  const origDesc = article.originalDescription || article.description || "";
  const origContent = article.originalContent || article.content || "";

  const translated = await translationService.translateFullArticle(
    origTitle,
    origDesc,
    origContent,
    readingLanguage,
    origLang
  );

  try {
    const hasLang = article.translations?.some((t) => t.language === readingLanguage);
    if (hasLang) {
      await News.updateOne(
        { _id: article._id, "translations.language": readingLanguage },
        {
          $set: {
            "translations.$.title": translated.title,
            "translations.$.description": translated.description,
            "translations.$.content": translated.content,
          },
        }
      );
    } else {
      await News.updateOne(
        { _id: article._id },
        {
          $push: {
            translations: {
              language: readingLanguage,
              title: translated.title,
              description: translated.description,
              content: translated.content,
            },
          },
        }
      );
    }
  } catch (err) {
    console.error(`[News] ❌ Failed to cache full translation for ${article._id}:`, err.message);
  }

  return {
    ...article,
    title: translated.title,
    description: translated.description,
    content: translated.content,
    language: readingLanguage,
  };
}

const getNews = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || CONFIG.DEFAULT_PAGE_LIMIT);
    const category = req.query.category || CONFIG.DEFAULT_CATEGORY;
    const country = req.query.country || CONFIG.DEFAULT_COUNTRY;
    const language = req.query.language || CONFIG.DEFAULT_LANGUAGE;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Use "all" as standard cache/fetch key for provider requests and cursors
    // to prevent fetching duplicate articles for different reading languages.
    const fetchLanguageKey = "all";

    // Build filter - no language constraint to maximize news coverage
    const filter = {};
    if (req.query.isHoroscopeRelated === "true") {
      filter.isHoroscopeRelated = true;
    } else {
      filter.category = category;
      filter.country = country;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { "translations.title": { $regex: search, $options: "i" } },
        { "translations.description": { $regex: search, $options: "i" } },
      ];
    }

    // ── Step 1: How many articles does MongoDB already have? ──────────────────
    const requiredCount = page * limit;
    console.log(`[News] 🔍 ${category}/${country}/${language} page=${page} limit=${limit} isHoroscopeRelated=${req.query.isHoroscopeRelated === "true"} — need ${requiredCount} docs`);

    let cachedCount = await News.countDocuments(filter);
    console.log(`[News] 💾 MongoDB has ${cachedCount} matching articles`);

    // ── Step 2: Fetch from Providers only when genuinely needed ──────────────────
    // providersDepleted: set to true only when ALL providers returned 0 articles
    // this is the single signal that controls hasNext on the frontend
    let providersDepleted = false;

    if (cachedCount < requiredCount && !search && req.query.isHoroscopeRelated !== "true") {
      console.log(`[News] 📡 DB short by ${requiredCount - cachedCount} — calling Provider Manager...`);

      let currentProviderPage = Math.floor(cachedCount / 10) + 1;
      let fetchedCount = cachedCount;
      let newsDataCursor = null;
      let iterations = 0;
      const MAX_ITERATIONS = 5;

      while (fetchedCount < requiredCount && iterations < MAX_ITERATIONS) {
        // Restore newsdata cursor from DB if available for this page
        if (!newsDataCursor && currentProviderPage > 1) {
          const cursorDoc = await NewsCursor.findOne({
            key: `${category}:${country}:${fetchLanguageKey}:${currentProviderPage - 1}`,
          }).lean();
          if (cursorDoc) {
            newsDataCursor = cursorDoc.cursor;
            console.log(`[News] 💾 Restored NewsData cursor for page ${currentProviderPage - 1}: ${newsDataCursor}`);
          }
        }

        const canFetch = newsDataCursor || canCallGNews(category, country, fetchLanguageKey, currentProviderPage);
        if (!canFetch) {
          console.log(`[News] ⏭️ Page ${currentProviderPage} recently fetched — skipping`);
          currentProviderPage++;
          iterations++;
          continue;
        }

        iterations++;
        try {
          // ProviderManager tries GNews → Currents → NewsData in sequence
          const fetched = await fetchArticles({
            page: newsDataCursor || currentProviderPage,
            limit: 10,
            category,
            country,
            language: fetchLanguageKey,
          });

          // Persist newsdata cursor for deep pagination
          if (fetched.nextPage) {
            newsDataCursor = fetched.nextPage;
            await NewsCursor.updateOne(
              { key: `${category}:${country}:${fetchLanguageKey}:${currentProviderPage}` },
              { cursor: newsDataCursor },
              { upsert: true }
            );
            console.log(`[News] 💾 Saved cursor for page ${currentProviderPage}`);
          } else {
            newsDataCursor = null;
          }

          markFetched(category, country, fetchLanguageKey, currentProviderPage);

          if (fetched.providersDepleted || fetched.length === 0) {
            // All providers returned nothing — no point continuing
            providersDepleted = true;
            console.log("[News] 🛑 All providers depleted — stopping fetch loop");
            break;
          }

          await upsertArticles(fetched);
          const newCount = await News.countDocuments(filter);
          console.log(`[News] 💾 After upsert — MongoDB now has ${newCount} articles (was ${fetchedCount})`);

          if (newCount <= fetchedCount) {
            console.log("[News] ⏹️ No new unique articles added — stopping");
            break;
          }

          fetchedCount = newCount;
          currentProviderPage++;
        } catch (apiErr) {
          console.error("[News] ❌ Provider pipeline error:", apiErr.message);
          break;
        }
      }
    } else if (cachedCount >= requiredCount) {
      console.log("[News] ✅ Cache hit — serving from MongoDB");
    } else if (search) {
      console.log("[News] 🔍 Search active — serving DB results only");
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

    // Lazily translate the articles for card display (title and description only)
    // Lazily translate the articles for card display sequentially to avoid concurrent rate limits (429)
    const translatedArticles = [];
    for (const art of articles) {
      const trans = await translateArticleCard(art, language);
      translatedArticles.push(trans);
      // Pacing delay (10ms)
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    console.log(`[News] 📤 Returning ${translatedArticles.length} articles (total: ${total}, hasNext: ${hasNext}, totalPages: ${totalPages})`);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrevious: page > 1,
      data: translatedArticles,
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

    const readingLanguage = req.query.language || CONFIG.DEFAULT_LANGUAGE;
    const translatedArticle = await translateArticleDetails(article, readingLanguage);

    return res.status(200).json({
      success: true,
      data: translatedArticle,
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