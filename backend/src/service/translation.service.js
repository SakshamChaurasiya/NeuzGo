const axios = require("axios");

/**
 * Translates a single string of text using Google Translate's free API.
 * Uses HTTP POST to support translating longer texts (e.g. article content) safely.
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'es', 'fr')
 * @param {string} sourceLang - Source language code (defaults to 'auto')
 * @returns {Promise<string>} Translated text, or original text on failure/empty
 */
async function translateText(text, targetLang, sourceLang = "auto") {
  if (!text || !text.trim()) return text;
  if (targetLang === sourceLang) return text;

  try {
    const url = "https://translate.googleapis.com/translate_a/single";
    
    // Use URLSearchParams for form-urlencoded request body
    const body = new URLSearchParams();
    body.append("client", "gtx");
    body.append("sl", sourceLang);
    body.append("tl", targetLang);
    body.append("dt", "t");
    body.append("q", text);

    const response = await axios.post(url, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 10000, // 10s timeout
    });

    if (response.data && Array.isArray(response.data[0])) {
      // Reconstruct translation from segments
      const translated = response.data[0]
        .map((segment) => segment && segment[0])
        .filter((val) => typeof val === "string")
        .join("");
      return translated || text;
    }
    
    return text;
  } catch (error) {
    console.error(`[Translation] ❌ Failed to translate to "${targetLang}":`, error.message);
    return text; // Graceful fallback
  }
}

/**
 * Translates the lightweight fields (title, description) of an article.
 */
async function translateFields(title, description, targetLang, sourceLang = "auto") {
  const [translatedTitle, translatedDesc] = await Promise.all([
    translateText(title, targetLang, sourceLang),
    translateText(description, targetLang, sourceLang),
  ]);
  return { title: translatedTitle, description: translatedDesc };
}

/**
 * Translates the full fields (title, description, content) of an article.
 */
async function translateFullArticle(title, description, content, targetLang, sourceLang = "auto") {
  const [translatedTitle, translatedDesc, translatedContent] = await Promise.all([
    translateText(title, targetLang, sourceLang),
    translateText(description, targetLang, sourceLang),
    translateText(content, targetLang, sourceLang),
  ]);
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
