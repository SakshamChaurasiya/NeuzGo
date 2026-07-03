// Ensure all providers are registered before the manager is used
require("./gnews.service");
require("./currents.service");
require("./newsdata.service");

const { getAllProviders, getProvider } = require("./providerRegistry");

// ─── Rate-limit tracking ──────────────────────────────────────────────────────
const rateLimitedProviders = new Map();
const RATE_LIMIT_BACKOFF_MS = 60 * 60 * 1000; // 1 hour

function activateRateLimitBackoff(providerName) {
  rateLimitedProviders.set(providerName, Date.now() + RATE_LIMIT_BACKOFF_MS);
  const until = new Date(rateLimitedProviders.get(providerName)).toISOString();
  console.warn(`[ProviderManager] ⚠️ HTTP 429 — ${providerName} suppressed until ${until}`);
}

function isProviderRateLimited(providerName) {
  const limitUntil = rateLimitedProviders.get(providerName);
  if (!limitUntil) return false;
  if (Date.now() < limitUntil) return true;
  rateLimitedProviders.delete(providerName);
  return false;
}

// ─── Provider priority order ─────────────────────────────────────────────────
// Providers are tried in this order. First one to return articles wins.
// Add future providers here without touching any other file.
const PROVIDER_PRIORITY = ["gnews", "currents", "newsdata"];

/**
 * Fetch articles from registered providers using a sequential priority pipeline.
 *
 * Flow:
 *   1. Try each provider in PROVIDER_PRIORITY order.
 *   2. Skip if rate-limited or if params.provider forces a specific one.
 *   3. Return immediately on first successful non-empty result.
 *   4. If all providers fail/return empty, return [].
 *
 * @param {Object} params - Query parameters (page, limit, category, country, language, provider?)
 * @returns {Promise<Array & { nextPage?: string, providersDepleted?: boolean }>}
 */
async function fetchArticles(params) {
  const forceProvider = params.provider;
  const isCursor = params.page && typeof params.page === "string";
  // Build ordered list of providers to try
  const orderedNames = forceProvider
    ? [forceProvider]
    : PROVIDER_PRIORITY;

  for (const name of orderedNames) {
    // When cursor exists, skip straight to newsdata (only cursor-aware provider)
    if (isCursor && name !== "newsdata") continue;

    if (isProviderRateLimited(name)) {
      const remaining = Math.ceil((rateLimitedProviders.get(name) - Date.now()) / 60000);
      console.log(`[ProviderManager] ⏭️ ${name} rate-limited (${remaining}min left) — skipping`);
      continue;
    }

    const provider = getProvider(name);
    if (!provider) {
      console.warn(`[ProviderManager] ⚠️ Provider "${name}" not found in registry — skipping`);
      continue;
    }

    try {
      console.log(`[ProviderManager] 📡 Trying ${name}...`);
      const articles = await provider.fetchTopHeadlines(params);

      if (articles && articles.length > 0) {
        console.log(`[ProviderManager] ✅ ${name} returned ${articles.length} articles`);
        const { classifyArticle } = require("./horoscopeClassifier.service");
        const classified = articles.map(classifyArticle);
        if (articles.nextPage) classified.nextPage = articles.nextPage;
        if (articles.providersDepleted) classified.providersDepleted = articles.providersDepleted;
        return classified;
      }

      console.log(`[ProviderManager] ⚠️ ${name} returned 0 articles — trying next provider`);
    } catch (error) {
      if (error.response?.status === 429) {
        activateRateLimitBackoff(name);
      } else {
        console.error(`[ProviderManager] ❌ ${name} error: ${error.message}`);
      }
    }
  }

  // All providers exhausted — signal to controller
  console.log("[ProviderManager] 🛑 All providers exhausted — returning empty");
  const empty = [];
  empty.providersDepleted = true;
  return empty;
}

/**
 * Cron-specific aggregation: calls ALL registered providers and merges their results.
 * Unlike fetchArticles (which stops at first success), this exhausts every provider
 * to maximize article variety in MongoDB before users visit.
 *
 * Rate: 1 request per provider per call = 3 requests/cron-run = 72 requests/day.
 * Each provider is called sequentially to avoid flooding APIs simultaneously.
 *
 * @param {Object} params - Query parameters (page, limit, category, country, language, from, sortby)
 * @returns {Promise<Array>} Merged and deduplicated articles from all providers.
 */
async function syncFromAllProviders(params) {
  const { deduplicateInMemory } = require("../utils/duplicateDetector");
  const allArticles = [];

  for (const name of PROVIDER_PRIORITY) {
    if (isProviderRateLimited(name)) {
      const remaining = Math.ceil((rateLimitedProviders.get(name) - Date.now()) / 60000);
      console.log(`[ProviderManager] ⏭️ ${name} rate-limited (${remaining}min) — skipping in sync`);
      continue;
    }

    const provider = getProvider(name);
    if (!provider) continue;

    try {
      console.log(`[ProviderManager] 📡 Syncing from ${name}...`);
      const articles = await provider.fetchTopHeadlines(params);
      if (articles && articles.length > 0) {
        console.log(`[ProviderManager] ✅ ${name} contributed ${articles.length} articles`);
        const { classifyArticle } = require("./horoscopeClassifier.service");
        const classified = articles.map(classifyArticle);
        allArticles.push(...classified);
      } else {
        console.log(`[ProviderManager] ⚠️ ${name} returned 0 articles`);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        activateRateLimitBackoff(name);
      } else {
        console.error(`[ProviderManager] ❌ ${name} sync error: ${error.message}`);
      }
    }
  }

  // Cross-provider deduplication before returning
  const merged = deduplicateInMemory(allArticles);
  console.log(`[ProviderManager] 🔀 Merged ${allArticles.length} → ${merged.length} unique articles`);
  return merged;
}

module.exports = {
  fetchArticles,
  syncFromAllProviders,
  isProviderRateLimited,
  activateRateLimitBackoff,
};
