import { useRef, useCallback } from "react";
import apiClient from "../api/client";

// ─── Configuration (Task 7.2) ────────────────────────────────────────────────
const PREFETCH_CONFIG = {
  /**
   * Delay in milliseconds before a prefetch request fires after mouseenter.
   * Prevents unnecessary requests when the user quickly moves the cursor
   * across multiple nav links without intending to navigate.
   */
  HOVER_DELAY_MS: 400,

  /**
   * Number of articles to prefetch per category hover.
   * Matches the default limit used in Category.jsx so cached data
   * can be rendered immediately on navigation.
   */
  DEFAULT_LIMIT: 12,

  /**
   * Default country filter applied during prefetch.
   */
  DEFAULT_COUNTRY: "in",

  /**
   * Default language filter applied during prefetch.
   */
  get DEFAULT_LANGUAGE() {
    return localStorage.getItem("readingLanguage") || "en";
  },

  /**
   * Maximum age (ms) for cached prefetch data before it is considered stale.
   * 5 minutes keeps memory usage bounded while still covering quick navigation.
   */
  CACHE_TTL_MS: 5 * 60 * 1000,
};

// ─── Module-scope cache (shared across all hook instances) ───────────────────
// Key: "category:country:language:limit" → { data, timestamp }
const prefetchCache = new Map();

/**
 * Build a deterministic cache key from prefetch parameters.
 * @param {string} category
 * @param {object} params - { country, language, limit }
 * @returns {string}
 */
function buildCacheKey(category, params = {}) {
  const country = params.country || PREFETCH_CONFIG.DEFAULT_COUNTRY;
  const language = params.language || PREFETCH_CONFIG.DEFAULT_LANGUAGE;
  const limit = params.limit || PREFETCH_CONFIG.DEFAULT_LIMIT;
  return `${category}:${country}:${language}:${limit}`;
}

/**
 * Prefetch news articles for a given category and cache the response.
 * Uses AbortController so in-flight requests can be cancelled on mouseleave.
 *
 * @param {string} category - Category ID to prefetch (e.g. "technology")
 * @param {object} params   - Optional overrides: { country, language, limit }
 * @param {AbortSignal} signal - AbortController signal for cancellation
 */
async function prefetchNews(category, params = {}, signal) {
  const country = params.country || PREFETCH_CONFIG.DEFAULT_COUNTRY;
  const language = params.language || PREFETCH_CONFIG.DEFAULT_LANGUAGE;
  const limit = params.limit || PREFETCH_CONFIG.DEFAULT_LIMIT;
  const cacheKey = buildCacheKey(category, { country, language, limit });

  // Skip if we already have a fresh cached response
  const cached = prefetchCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < PREFETCH_CONFIG.CACHE_TTL_MS) {
    console.log(`[Prefetch] 💾 Cache hit for "${cacheKey}" — skipping request`);
    return;
  }

  console.log(`[Prefetch] 📡 Prefetching category "${category}"...`);
  try {
    const response = await apiClient.get("/news", {
      params: { category, country, language, page: 1, limit },
      signal, // honour AbortController signal
    });

    if (response.data && response.data.success) {
      prefetchCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      console.log(
        `[Prefetch] ✅ Cached ${response.data.data.length} articles for "${cacheKey}"`
      );
    }
  } catch (err) {
    if (err.name === "CanceledError" || err.name === "AbortError" || err.code === "ERR_CANCELED") {
      console.log(`[Prefetch] ⏹️ Request cancelled for "${cacheKey}"`);
    } else {
      console.warn(`[Prefetch] ⚠️ Prefetch failed for "${cacheKey}":`, err.message);
    }
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * usePrefetch — intent-based prefetch hook for category navigation links.
 *
 * Usage in Navbar (desktop links only):
 *   const { handleMouseEnter, handleMouseLeave } = usePrefetch();
 *   <NavLink onMouseEnter={() => handleMouseEnter(cat.id)} onMouseLeave={handleMouseLeave} />
 *
 * Usage in Category.jsx:
 *   const { getCachedData } = usePrefetch();
 *   const cached = getCachedData(categoryId, { country, language, limit: 12 });
 *   if (cached) { // use cached.data immediately }
 *
 * @returns {{ handleMouseEnter, handleMouseLeave, getCachedData, clearCache }}
 */
function usePrefetch() {
  /** Holds the setTimeout id for the hover delay */
  const timerRef = useRef(null);

  /** Holds the AbortController for any in-flight prefetch request */
  const abortControllerRef = useRef(null);

  /**
   * Called on mouseenter of a desktop category nav link.
   * Starts a delay timer; if the cursor stays long enough the prefetch fires.
   *
   * @param {string} category - Category ID
   * @param {object} [params] - Optional { country, language, limit }
   */
  const handleMouseEnter = useCallback((category, params = {}) => {
    // Clear any leftover timer from a previous hover
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(() => {
      // Create a fresh AbortController for this prefetch
      abortControllerRef.current = new AbortController();
      prefetchNews(category, params, abortControllerRef.current.signal);
    }, PREFETCH_CONFIG.HOVER_DELAY_MS);
  }, []);

  /**
   * Called on mouseleave of a desktop category nav link.
   * Cancels the pending timer and aborts any in-flight request.
   */
  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Retrieve previously prefetched data from the module-scope cache.
   * Returns null if no fresh data is cached.
   *
   * @param {string} category
   * @param {object} [params] - { country, language, limit }
   * @returns {object|null} Cached API response data, or null on miss
   */
  const getCachedData = useCallback((category, params = {}) => {
    const cacheKey = buildCacheKey(category, params);
    const cached = prefetchCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < PREFETCH_CONFIG.CACHE_TTL_MS) {
      console.log(`[Prefetch] ⚡ Cache hit in getCachedData for "${cacheKey}"`);
      return cached.data;
    }

    console.log(`[Prefetch] ❌ Cache miss in getCachedData for "${cacheKey}"`);
    return null;
  }, []);

  /**
   * Clear all cached prefetch responses (useful for testing or logout).
   */
  const clearCache = useCallback(() => {
    prefetchCache.clear();
    console.log("[Prefetch] 🧹 Prefetch cache cleared");
  }, []);

  return { handleMouseEnter, handleMouseLeave, getCachedData, clearCache };
}

export default usePrefetch;
