const LingvaProvider = require("./translation/lingvaProvider");
const GoogleProvider = require("./translation/googleProvider");
const MyMemoryProvider = require("./translation/mymemoryProvider");
const { VALID_LANG_CODES, delay } = require("./translation/utils");

const TranslationCache = require("../models/translationCache.model");
const News = require("../models/news.model");

// Keep providers in fallback priority order
const providers = [
  new LingvaProvider(),
  new GoogleProvider(),
  new MyMemoryProvider(),
];

// Circuit Breaker states per provider
const breakerStates = {};
const ERROR_THRESHOLD = 5;
const COOLDOWN_DURATION_MS = 5 * 60 * 1000;

function getBreakerState(providerName) {
  if (!breakerStates[providerName]) {
    breakerStates[providerName] = {
      consecutiveErrors: 0,
      cooldownUntil: 0,
    };
  }
  return breakerStates[providerName];
}

function isCircuitOpen(providerName) {
  const state = getBreakerState(providerName);
  return Date.now() < state.cooldownUntil;
}

function recordSuccess(providerName) {
  const state = getBreakerState(providerName);
  state.consecutiveErrors = 0;
}

function recordFailure(providerName) {
  const state = getBreakerState(providerName);
  state.consecutiveErrors++;
  if (state.consecutiveErrors >= ERROR_THRESHOLD) {
    state.cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    console.warn(`[Translation Breaker] 🚨 Circuit OPEN for provider "${providerName}". Cooldown active for 5 mins.`);
  }
}

/**
 * Core translation function that routes text through translation providers with circuit breakers.
 */
async function translateText(text, targetLang, sourceLang = "auto") {
  if (!text || !text.trim()) return text;
  
  const sl = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";
  const tl = targetLang;
  
  if (tl === "en" && sl === "en") return text;
  if (tl === sl) return text;

  for (const provider of providers) {
    if (isCircuitOpen(provider.name)) {
      continue;
    }

    const start = Date.now();
    try {
      const translated = await provider.translate(text, tl, sl);
      const duration = Date.now() - start;
      console.log(`[Translation] [Provider: ${provider.name}] Cache Miss -> Translating "${text.substring(0, 20)}..." to ${tl} (${duration}ms)`);
      recordSuccess(provider.name);
      return translated;
    } catch (err) {
      const duration = Date.now() - start;
      console.warn(`[Translation] [Provider: ${provider.name}] Failed in ${duration}ms: ${err.message}`);
      recordFailure(provider.name);
    }
  }

  console.warn(`[Translation] 🚨 All providers failed for text: "${text.substring(0, 20)}...". Returning original.`);
  return text;
}

/**
 * Translates title and description.
 */
async function translateFields(title, description, targetLang, sourceLang = "auto") {
  const resolvedSrc = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";
  const translatedTitle = await translateText(title, targetLang, resolvedSrc);
  await delay(10);
  const translatedDesc = await translateText(description, targetLang, resolvedSrc);
  return { title: translatedTitle, description: translatedDesc };
}

/**
 * Translates title, description, and content.
 */
async function translateFullArticle(title, description, content, targetLang, sourceLang = "auto") {
  const resolvedSrc = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";
  const translatedTitle = await translateText(title, targetLang, resolvedSrc);
  await delay(10);
  const translatedDesc = await translateText(description, targetLang, resolvedSrc);
  await delay(10);
  const translatedContent = await translateText(content, targetLang, resolvedSrc);
  
  return {
    title: translatedTitle,
    description: translatedDesc,
    content: translatedContent,
  };
}

/**
 * Helper to determine original language
 */
function getOriginalLanguage(article) {
  let origLang = article.originalLanguage || article.language || "en";
  if (!origLang || origLang.length !== 2 || origLang === "al") {
    origLang = "en";
  }
  // Force translation to English if title contains Devanagari characters
  const hasDevanagari = /[\u0900-\u097F]/.test(article.title || "");
  if (hasDevanagari && origLang === "en") {
    origLang = "hi";
  }
  return origLang;
}

/**
 * Translates article card (title and description) on-demand using cache
 */
async function translateArticleCard(article, targetLang) {
  const origLang = getOriginalLanguage(article);
  if (targetLang === origLang) {
    return article;
  }

  const articleId = String(article._id);
  const cacheKey = `${articleId}:${targetLang}`;

  const startTime = Date.now();
  // Check translation cache
  try {
    const cached = await TranslationCache.findOne({ articleId, language: targetLang }).lean();
    if (cached) {
      console.log(`[Translation Cache] 🎯 Hit: Article ${articleId} in ${targetLang} (${Date.now() - startTime}ms)`);
      return {
        ...article,
        title: cached.title,
        description: cached.description,
        language: targetLang,
      };
    }
  } catch (err) {
    console.error(`[Translation Cache] ❌ Error checking cache for ${cacheKey}:`, err.message);
  }

  // Cache Miss -> Perform translation
  const origTitle = article.originalTitle || article.title;
  const origDesc = article.originalDescription || article.description || "";

  const translated = await translateFields(origTitle, origDesc, targetLang, origLang);

  // Save to Cache (upsert to handle any race conditions cleanly)
  try {
    await TranslationCache.updateOne(
      { articleId, language: targetLang },
      {
        $set: {
          title: translated.title,
          description: translated.description,
        },
      },
      { upsert: true }
    );
    console.log(`[Translation Cache] 💾 Saved: Article ${articleId} in ${targetLang}`);
  } catch (err) {
    console.error(`[Translation Cache] ❌ Error saving cache for ${cacheKey}:`, err.message);
  }

  return {
    ...article,
    title: translated.title,
    description: translated.description,
    language: targetLang,
  };
}

/**
 * Translates full article details (title, description, content) on-demand using cache
 */
async function translateArticleDetails(article, targetLang) {
  const origLang = getOriginalLanguage(article);
  if (targetLang === origLang) {
    return article;
  }

  const articleId = String(article._id);
  const cacheKey = `${articleId}:${targetLang}`;

  const startTime = Date.now();
  // Check translation cache
  try {
    const cached = await TranslationCache.findOne({ articleId, language: targetLang }).lean();
    if (cached && cached.content) {
      console.log(`[Translation Cache] 🎯 Hit (Full): Article ${articleId} in ${targetLang} (${Date.now() - startTime}ms)`);
      return {
        ...article,
        title: cached.title,
        description: cached.description,
        content: cached.content,
        language: targetLang,
      };
    }
  } catch (err) {
    console.error(`[Translation Cache] ❌ Error checking cache for ${cacheKey}:`, err.message);
  }

  // Cache Miss -> Perform full translation
  const origTitle = article.originalTitle || article.title;
  const origDesc = article.originalDescription || article.description || "";
  const origContent = article.originalContent || article.content || "";

  const translated = await translateFullArticle(origTitle, origDesc, origContent, targetLang, origLang);

  // Save to Cache (upsert to handle any race conditions cleanly)
  try {
    await TranslationCache.updateOne(
      { articleId, language: targetLang },
      {
        $set: {
          title: translated.title,
          description: translated.description,
          content: translated.content,
        },
      },
      { upsert: true }
    );
    console.log(`[Translation Cache] 💾 Saved (Full): Article ${articleId} in ${targetLang}`);
  } catch (err) {
    console.error(`[Translation Cache] ❌ Error saving cache for ${cacheKey}:`, err.message);
  }

  return {
    ...article,
    title: translated.title,
    description: translated.description,
    content: translated.content,
    language: targetLang,
  };
}

/**
 * Asynchronously prefetches and translates the next page of articles in the background.
 */
function prefetchNextPage(filter, page, limit, language) {
  setImmediate(async () => {
    try {
      const skip = page * limit; // next page skip
      const nextArticles = await News.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      if (nextArticles && nextArticles.length > 0) {
        console.log(`[Translation Prefetch] 🚀 Background translating page ${page + 1} (${nextArticles.length} articles) for language "${language}"`);
        for (const art of nextArticles) {
          await translateArticleCard(art, language);
          await delay(50); // Gentle pacing
        }
        console.log(`[Translation Prefetch] ✅ Page ${page + 1} prefetch complete`);
      }
    } catch (err) {
      console.error(`[Translation Prefetch] ❌ Background prefetch failed:`, err.message);
    }
  });
}

module.exports = {
  translateText,
  translateFields,
  translateFullArticle,
  translateArticleCard,
  translateArticleDetails,
  prefetchNextPage,
};
