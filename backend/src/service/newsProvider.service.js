const gnewsService = require("./gnews.service");
const newsDataService = require("./newsdata.service");

let rateLimitedUntil = 0;
const RATE_LIMIT_BACKOFF_MS = 60 * 60 * 1000;

/**
 * Activates GNews rate-limit backoff window.
 */
function activateRateLimitBackoff() {
  rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
  const until = new Date(rateLimitedUntil).toISOString();
  console.warn(`[NewsProvider] ⚠️ HTTP 429 received — GNews calls suppressed until ${until}`);
}

/**
 * Checks if GNews is currently rate-limited.
 * @returns {boolean}
 */
function isGNewsRateLimited() {
  return Date.now() < rateLimitedUntil;
}

/**
 * Unified fetch top headlines function that prioritizes GNews and falls back to NewsAPI.
 */
const fetchTopHeadlines = async (params) => {
  if (!isGNewsRateLimited()) {
    try {
      console.log("[NewsProvider] 📡 Trying GNews...");
      const articles = await gnewsService.fetchTopHeadlines(params);
      if (articles && articles.length > 0) {
        return articles;
      }
      console.log("[NewsProvider] ⚠️ GNews returned empty response, attempting fallback...");
    } catch (error) {
      if (error.response?.status === 429) {
        activateRateLimitBackoff();
      } else {
        console.error("[NewsProvider] ❌ GNews API error:", error.message);
      }
      console.log("[NewsProvider] 🔄 Initiating fallback to NewsData.io...");
    }
  } else {
    const remainingMin = Math.ceil((rateLimitedUntil - Date.now()) / 60000);
    console.log(`[NewsProvider] ⏭️ GNews is rate limited (${remainingMin} min remaining) — skipping GNews, calling NewsData.io`);
  }

  // Fallback to NewsData.io
  try {
    console.log("[NewsProvider] 📡 Trying NewsData.io...");
    const articles = await newsDataService.fetchTopHeadlines(params);
    return articles;
  } catch (error) {
    console.error("[NewsProvider] ❌ NewsData.io API error:", error.message);
    throw error;
  }
};

module.exports = {
  fetchTopHeadlines,
  isGNewsRateLimited,
  activateRateLimitBackoff,
};
