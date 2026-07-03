/**
 * Intelligent Horoscope Article Classifier Service
 * Evaluates articles based on keyword weights and determines horoscope relevance.
 */

const CONFIG = {
  THRESHOLD: 5,
  KEYWORD_GROUPS: {
    strong: {
      weight: 5,
      words: [
        "horoscope",
        "astrology",
        "zodiac",
        "rashifal",
        "kundli",
        "tarot",
        "numerology",
        "birth chart",
        "moon sign",
        "planetary",
        "retrograde"
      ]
    },
    medium: {
      weight: 3,
      words: [
        "spiritual",
        "manifestation",
        "healing",
        "chakra",
        "meditation",
        "cosmic",
        "vedic",
        "prediction",
        "destiny",
        "fortune"
      ]
    },
    weak: {
      weight: 1,
      words: [
        "wellness",
        "mindfulness",
        "yoga",
        "positivity",
        "self care",
        "emotional wellbeing",
        "mental wellness"
      ]
    }
  }
};

/**
 * Calculates a relevance score for the given text based on weighted keyword groups.
 * Also returns the list of matched keywords as tags.
 * 
 * @param {string} text - The text content to search (typically title + description + content)
 * @returns {{ score: number, isRelated: boolean, tags: string[] }}
 */
function classifyText(text = "") {
  if (!text) {
    return { score: 0, isRelated: false, tags: [] };
  }

  const normalizedText = text.toLowerCase();
  let score = 0;
  const matchedTags = new Set();

  // Search each group
  for (const [groupName, group] of Object.entries(CONFIG.KEYWORD_GROUPS)) {
    const { weight, words } = group;
    for (const word of words) {
      // Use word boundaries for accurate keyword matching where possible
      // Since some keywords contain spaces (e.g. "birth chart"), handle them correctly
      const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedWord}\\b`, "i");

      if (regex.test(normalizedText)) {
        score += weight;
        matchedTags.add(word);
      }
    }
  }

  const isRelated = score >= CONFIG.THRESHOLD;

  return {
    score,
    isRelated,
    tags: Array.from(matchedTags)
  };
}

/**
 * Classifies a normalized article object, enriching it with horoscope classification fields.
 * 
 * @param {Object} article - The normalized article object
 * @returns {Object} The enriched article
 */
function classifyArticle(article) {
  const searchText = `${article.title || ""} ${article.description || ""} ${article.content || ""}`;
  const classification = classifyText(searchText);

  return {
    ...article,
    isHoroscopeRelated: classification.isRelated,
    tags: classification.tags
  };
}

module.exports = {
  classifyText,
  classifyArticle,
  CONFIG
};
