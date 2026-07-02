const News = require("../models/news.model");

// ─── Configuration (Task 7.1) ─────────────────────────────────────────────────
// Centralised constants for the smart cache-first logic.
// Adjust these values (or move to env vars) to tune caching behaviour.
const CONFIG = {
  /**
   * Time window (ms) within which duplicate API calls for the same
   * category/country/language combination are suppressed.
   * Default: 15 minutes.
   */
  CACHE_WINDOW_MS: 15 * 60 * 1000,

  /**
   * Default number of articles per page when no limit is supplied.
   */
  DEFAULT_PAGE_LIMIT: 10,

  /**
   * Default category used when none is provided in the query string.
   */
  DEFAULT_CATEGORY: "general",

  /**
   * Default country code.
   */
  DEFAULT_COUNTRY: "in",

  /**
   * Default language code.
   */
  DEFAULT_LANGUAGE: "en",
};

// Request deduplication mechanism (Requirement 9.3)
// Tracks recent API calls to prevent redundant fetches within 15-minute window
const recentFetches = new Map(); // Key: "category:country:language", Value: timestamp

/**
 * Check if we should fetch from GNews API based on recent fetch history
 * @param {string} category - News category
 * @param {string} country - Country code
 * @param {string} language - Language code
 * @returns {boolean} - True if fetch should proceed, false if within cache window
 */
function shouldFetchFromAPI(category, country, language) {
  const key = `${category}:${country}:${language}`;
  const lastFetch = recentFetches.get(key);
  const now = Date.now();
  
  if (lastFetch && (now - lastFetch) < CONFIG.CACHE_WINDOW_MS) {
    const secondsAgo = Math.floor((now - lastFetch) / 1000);
    console.log(`[Dedup] ⏭️ Skipping API call for ${key} - fetched ${secondsAgo}s ago (within 15min window)`);
    return false;
  }
  
  recentFetches.set(key, now);
  console.log(`[Dedup] ✅ Allowing API call for ${key}`);
  return true;
}

// Periodic cleanup to remove old entries from deduplication map
// Runs every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, timestamp] of recentFetches.entries()) {
    if (now - timestamp > CONFIG.CACHE_WINDOW_MS) {
      recentFetches.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`[Dedup Cleanup] 🧹 Removed ${cleaned} old entries from deduplication map`);
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

/**
 * Log API usage for monitoring GNews API quota consumption (Requirement 9.5)
 * @param {object} params - Request parameters {category, country, language}
 * @param {number} articleCount - Number of articles fetched from GNews API
 * @param {string} source - Source of the API call (controller/cron)
 */
function logAPIUsage(params, articleCount, source) {
  console.log(`[API Usage] ${new Date().toISOString()} | Source: ${source} | ` +
    `Category: ${params.category} | Country: ${params.country} | Lang: ${params.language} | ` +
    `Fetched: ${articleCount} articles`);
}

const getNews = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const category = req.query.category || "general";
    const country = req.query.country || "in";
    const language = req.query.language || "en";
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const filter = {
      category,
      country,
      language,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    console.log(`[News Request] 🔍 Checking MongoDB database for articles (category: ${category}, country: ${country}, lang: ${language}, search: "${search}")...`);

    // Calculate required article count for pagination (Requirement 2.1)
    const requiredCount = page * limit;
    console.log(`[News Request] 📊 Required articles for page ${page}: ${requiredCount}`);

    // Query MongoDB to get cached article count with current filters (Requirement 2.2)
    // Wrap in try-catch for MongoDB failure handling (Requirement 8.3)
    let cachedCount;
    try {
      cachedCount = await News.countDocuments(filter);
      console.log(`[News Request] 💾 Cached articles in MongoDB: ${cachedCount}`);
    } catch (dbError) {
      console.error(`[News Request] ❌ MongoDB query failed:`, dbError.message);
      console.log(`[News Request] 🔄 Attempting GNews API as fallback...`);
      
      // Fallback to GNews API when MongoDB fails (Requirement 8.3)
      try {
        const { fetchTopHeadlines } = require("../service/gnews.service");
        const fetchedArticles = await fetchTopHeadlines({
          page: 1,
          limit: requiredCount,
          category,
          country,
          language,
        });

        if (fetchedArticles.length > 0) {
          console.log(`[News Request] ✅ GNews API fallback successful. Returning ${fetchedArticles.length} articles.`);
          
          // Log API usage for monitoring (Task 1.4 - DB fallback path)
          logAPIUsage({ category, country, language }, fetchedArticles.length, "controller-db-fallback");

          // Return paginated results from API without saving to DB
          const paginatedArticles = fetchedArticles.slice(skip, skip + limit);
          return res.status(200).json({
            success: true,
            page,
            limit,
            total: fetchedArticles.length,
            totalPages: Math.ceil(fetchedArticles.length / limit),
            data: paginatedArticles,
          });
        } else {
          console.log(`[News Request] ⚠️ GNews API returned 0 articles.`);
          return res.status(503).json({
            success: false,
            message: 'News service temporarily unavailable. Please try again later.',
          });
        }
      } catch (apiError) {
        console.error(`[News Request] ❌ Both MongoDB and GNews API failed`);
        return res.status(503).json({
          success: false,
          message: 'News service temporarily unavailable. Please try again later.',
        });
      }
    }

    let articles, total;

    // Decision logic: Cache-first with smart fetching (Requirement 2.3, 2.4, 2.5)
    if (cachedCount >= requiredCount) {
      // Sufficient articles in cache - serve from MongoDB without API call (Requirement 2.3)
      console.log(`[News Request] ✅ Cache hit! Serving from MongoDB (cached: ${cachedCount} >= required: ${requiredCount})`);
      
      articles = await News.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      total = cachedCount;
      
      console.log(`[News Request] 🗄️ Serving news directly from MongoDB database. NO GNews API call made.`);
    } else {
      // Insufficient articles in cache - fetch missing articles from GNews API (Requirement 2.4)
      const missingCount = requiredCount - cachedCount; // Requirement 2.5
      console.log(`[News Request] ⚠️ Cache miss! Missing ${missingCount} articles (cached: ${cachedCount}, required: ${requiredCount})`);
      
      // Check if we should fetch from API (deduplication check - Requirement 9.3)
      if (!shouldFetchFromAPI(category, country, language)) {
        console.log(`[News Request] 🚫 Skipping GNews API call due to recent fetch. Serving available cache.`);
        // Serve whatever is in cache
        articles = await News.find(filter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit);
        total = cachedCount;
      } else {
        console.log(`[News Request] 📡 Fetching ${missingCount} missing articles from GNews API...`);
        const { fetchTopHeadlines } = require("../service/gnews.service");
        
        try {
          const fetchedArticles = await fetchTopHeadlines({
            page: 1,
            limit: missingCount, // Only fetch the number of missing articles (Requirement 2.5)
            category,
            country,
            language,
          });

        if (fetchedArticles.length > 0) {
          console.log(`[News Request] 📡 Fetched ${fetchedArticles.length} articles from GNews. Saving to MongoDB...`);
          
          // Log API usage for monitoring (Task 1.4)
          logAPIUsage({ category, country, language }, fetchedArticles.length, "controller");

          // Bulk write with upsert to prevent duplicates (Requirement 3.2)
          const ops = fetchedArticles.map((article) => ({
            updateOne: {
              filter: { articleUrl: article.articleUrl },
              update: { $set: article },
              upsert: true,
            },
          }));

          await News.bulkWrite(ops);

          // Query again to get the final results with updated cache
          articles = await News.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);

          total = await News.countDocuments(filter);
          
          console.log(`[News Request] ✅ Successfully saved and retrieved articles. Total now: ${total}`);
        } else {
          console.log(`[News Request] ⚠️ GNews API returned 0 articles.`);
          // Serve whatever is in cache
          articles = await News.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);
          total = cachedCount;
        }
        } catch (apiErr) {
          // Enhanced error handling for GNews API failures (Requirement 8.1, 8.2)
          console.error(`[News Request] ❌ Failed to fetch from GNews API:`, apiErr.message);
          
          // Check for rate limit error (HTTP 429) (Requirement 8.2)
          if (apiErr.response?.status === 429) {
            console.warn(`[News Request] ⚠️ GNews API rate limit exceeded (HTTP 429). Serving from cache.`);
            console.log(`[API Usage] ${new Date().toISOString()} | Rate Limit Hit | Category: ${category} | Country: ${country} | Lang: ${language}`);
          }
          
          // Fallback: serve from cache even if insufficient (Requirement 8.1)
          articles = await News.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);
          total = cachedCount;
          
          // If cache is completely empty, return 503 service unavailable (Requirement 8.5)
          if (articles.length === 0) {
            console.error(`[News Request] ❌ No cached articles available and API failed. Returning 503.`);
            return res.status(503).json({
              success: false,
              message: 'News service temporarily unavailable. Please try again later.',
            });
          }
          
          console.log(`[News Request] ✅ Serving ${articles.length} articles from cache despite API failure.`);
        }
      }
    }

    console.log(`[News Request] ✅ Returning ${articles.length} articles.`);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: articles,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getNewsById = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);

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