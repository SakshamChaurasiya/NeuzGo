const axios = require("axios");

// Valid ISO 639-1 two-letter codes that Google Translate accepts as source language.
const VALID_LANG_CODES = new Set([
  "af","sq","am","ar","hy","az","eu","be","bn","bs","bg","ca","ceb","ny","zh","co",
  "hr","cs","da","nl","en","eo","et","tl","fi","fr","fy","gl","ka","de","el","gu",
  "ht","ha","haw","iw","hi","hmn","hu","is","ig","id","ga","it","ja","jw","kn",
  "kk","km","rw","ko","ku","ky","lo","la","lv","lt","lb","mk","mg","ms","ml","mt",
  "mi","mr","mn","my","ne","no","or","ps","fa","pl","pt","pa","ro","ru","sm","gd",
  "sr","st","sn","sd","si","sk","sl","so","es","su","sw","sv","tg","ta","tt","te",
  "th","tr","tk","uk","ur","ug","uz","vi","cy","xh","yi","yo","zu",
]);

// Helper for pacing/throttling concurrent requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Circuit breaker state
let consecutiveErrors = 0;
let cooldownUntil = 0;
const ERROR_THRESHOLD = 5; // Fail 5 times to trigger breaker
const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minute cooldown

function isCircuitOpen() {
  return Date.now() < cooldownUntil;
}

function recordSuccess() {
  consecutiveErrors = 0;
}

function recordFailure() {
  consecutiveErrors++;
  if (consecutiveErrors >= ERROR_THRESHOLD) {
    cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    console.warn(`[Translation Breaker] 🚨 Threshold hit. Circuit OPEN. Disabling translation for 5 minutes.`);
  }
}

/**
 * Tier 3: Translate using MyMemory API (Final Fallback)
 */
async function translateMyMemory(text, targetLang, sourceLang = "en") {
  try {
    const sl = sourceLang === "auto" || !VALID_LANG_CODES.has(sourceLang) ? "en" : sourceLang;
    const url = "https://api.mymemory.translated.net/get";
    const response = await axios.get(url, {
      params: {
        q: text,
        langpair: `${sl}|${targetLang}`,
      },
      timeout: 1500,
    });
    if (response.data && response.data.responseData) {
      const result = response.data.responseData.translatedText;
      if (result) {
        recordSuccess();
        return result;
      }
    }
    return text;
  } catch (err) {
    console.error(`[MyMemory Translation] ❌ Fallback failed:`, err.message);
    recordFailure();
    return text;
  }
}

/**
 * Tier 2: Translate using Google Translate's undocumented POST endpoint
 */
async function translateGooglePost(text, targetLang, resolvedSourceLang) {
  try {
    const url = "https://translate.googleapis.com/translate_a/single";
    const body = new URLSearchParams();
    body.append("client", "gtx");
    body.append("sl", resolvedSourceLang);
    body.append("tl", targetLang);
    body.append("dt", "t");
    body.append("q", text);

    const response = await axios.post(url, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 2000,
    });

    if (response.data && Array.isArray(response.data[0])) {
      const translated = response.data[0]
        .map((segment) => segment && segment[0])
        .filter((val) => typeof val === "string")
        .join("");
      if (translated) {
        recordSuccess();
        return translated;
      }
    }
  } catch (error) {
    console.warn(`[Translation] ⚠️ Google Post returned ${error.response?.status || error.message}. Trying MyMemory...`);
  }
  return translateMyMemory(text, targetLang, resolvedSourceLang);
}

/**
 * Tier 1 (Primary): Translate using Lingva Translate API (GET wrapper)
 */
async function translateLingva(text, targetLang, sourceLang = "auto") {
  try {
    const sl = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";
    const url = `https://lingva.ml/api/v1/${sl}/${targetLang}/${encodeURIComponent(text)}`;
    
    const response = await axios.get(url, {
      timeout: 2000,
    });

    if (response.data && response.data.translation) {
      recordSuccess();
      return response.data.translation;
    }
  } catch (error) {
    console.warn(`[Translation] ⚠️ Lingva Translate returned ${error.response?.status || error.message}. Trying Google Post...`);
  }
  return translateGooglePost(text, targetLang, sourceLang);
}

/**
 * Entry point: Translates a string of text using the 3-tier pipeline with a circuit breaker.
 */
async function translateText(text, targetLang, sourceLang = "auto") {
  if (!text || !text.trim()) return text;
  if (targetLang === "en" && sourceLang === "en") return text;
  if (targetLang === sourceLang) return text;

  if (isCircuitOpen()) {
    return text;
  }

  // Run through Tier 1 (Lingva) -> Tier 2 (Google Post) -> Tier 3 (MyMemory)
  return translateLingva(text, targetLang, sourceLang);
}

/**
 * Translates the lightweight fields (title, description) of an article card.
 */
async function translateFields(title, description, targetLang, sourceLang = "auto") {
  const resolvedSrc = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";

  const translatedTitle = await translateText(title, targetLang, resolvedSrc);
  await delay(10);
  const translatedDesc = await translateText(description, targetLang, resolvedSrc);

  return { title: translatedTitle, description: translatedDesc };
}

/**
 * Translates the full fields (title, description, content) of an article.
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

module.exports = {
  translateText,
  translateFields,
  translateFullArticle,
};
