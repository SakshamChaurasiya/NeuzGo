const CANONICAL_CATEGORIES = [
  "general",
  "business",
  "technology",
  "science",
  "health",
  "sports",
  "entertainment"
];

// Maps raw provider category strings to canonical app categories.
// Used only when a provider supplies a category token directly.
const CATEGORY_MAP = {
  // Business
  business: "business",
  finance: "business",
  money: "business",
  economy: "business",
  investing: "business",
  markets: "business",

  // Technology
  technology: "technology",
  tech: "technology",
  gadgets: "technology",
  ai: "technology",
  software: "technology",
  computers: "technology",
  internet: "technology",

  // Science
  science: "science",
  space: "science",
  physics: "science",
  biology: "science",
  environment: "science",

  // Sports
  sports: "sports",
  sport: "sports",
  cricket: "sports",
  football: "sports",
  soccer: "sports",
  basketball: "sports",
  olympics: "sports",

  // Entertainment
  entertainment: "entertainment",
  movies: "entertainment",
  cinema: "entertainment",
  music: "entertainment",
  hollywood: "entertainment",
  bollywood: "entertainment",
  celebrity: "entertainment",
  arts: "entertainment",
  tv: "entertainment",
  lifestyle: "entertainment",

  // Health
  health: "health",
  medicine: "health",
  fitness: "health",
  wellness: "health",
  medical: "health",

  // General / Fallbacks
  general: "general",
  world: "general",
  nation: "general",
  politics: "general",
  news: "general",
  top: "general",
};

// Keyword banks for content-based classification.
const KEYWORDS = {
  business: [
    "business", "finance", "stocks", "economy", "market", "startup", "invest",
    "crypto", "bitcoin", "earnings", "revenue", "fiscal", "gdp", "trade", "ipo",
    "acquisition", "merger", "hedge fund", "venture capital",
  ],
  technology: [
    "technology", "tech", "software", "hardware", "artificial intelligence",
    "gadget", "smartphone", "computer", "semiconductor", "cybersecurity",
    "robot", "drone", "blockchain", "machine learning", "cloud computing",
    "data breach", "app", "startup tech",
  ],
  science: [
    "science", "space", "nasa", "astronomy", "research", "physics", "biology",
    "scientists", "planet", "dinosaur", "climate change", "genome", "species",
    "discovery", "experiment", "laboratory", "fossil", "carbon",
  ],
  health: [
    "health", "medicine", "covid", "vaccine", "doctor", "hospital", "wellness",
    "fitness", "disease", "mental health", "cancer", "nutrition", "surgery",
    "therapy", "drug", "treatment", "symptom", "pandemic", "epidemic",
  ],
  sports: [
    "sports", "cricket", "football", "soccer", "basketball", "tennis", "olympics",
    "championship", "tournament", "league", "score", "match", "ipl", "fifa",
    "nba", "athlete", "stadium", "wicket", "goal", "medal",
  ],
  entertainment: [
    "entertainment", "movie", "cinema", "music", "hollywood", "bollywood",
    "celebrity", "actor", "actress", "album", "song", "theater", "showbiz",
    "streaming", "netflix", "series", "film", "box office", "concert",
  ],
};

const NICHE_CATEGORIES = new Set([]);

/**
 * Classifies an article into a canonical application category.
 *
 * Priority order:
 *   1. Keyword matching on title + description + content (always runs first)
 *   2. Provider category mapping (for mainstream categories only)
 *   3. Fallback to "general"
 *
 * @param {string} providerCategory - The raw category from the provider (or app intent category).
 * @param {string} title
 * @param {string} description
 * @param {string} content
 * @returns {string} One of the canonical categories.
 */
function classify(providerCategory, title = "", description = "", content = "") {
  const cleanCat = providerCategory ? providerCategory.toLowerCase().trim() : "";

  // 1. Trust specific provider categories immediately
  const specificCategories = new Set([
    "business", "finance", "money", "economy", "investing", "markets",
    "technology", "tech", "gadgets", "ai", "software", "computers", "internet",
    "science", "space", "physics", "biology", "environment",
    "sports", "sport", "cricket", "football", "soccer", "basketball", "olympics",
    "entertainment", "movies", "cinema", "music", "hollywood", "bollywood", "celebrity", "arts", "tv", "lifestyle",
    "health", "medicine", "fitness", "wellness", "medical"
  ]);

  if (cleanCat && specificCategories.has(cleanCat)) {
    if (CATEGORY_MAP[cleanCat]) {
      return CATEGORY_MAP[cleanCat];
    }
  }

  // 2. Run keyword matching for mixed feeds (like general, world, top) or unclassified articles
  const textToSearch = `${title} ${description} ${content}`.toLowerCase();
  const priorityOrder = [
    "sports", "health", "technology", "science", "business", "entertainment",
  ];

  for (const category of priorityOrder) {
    const keywords = KEYWORDS[category];
    if (!keywords) continue;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(textToSearch)) {
        return category;
      }
    }
  }

  // 3. Fallback to mapped category (e.g. general, world -> general) or "general"
  if (cleanCat && CATEGORY_MAP[cleanCat]) {
    return CATEGORY_MAP[cleanCat];
  }

  return "general";
}

module.exports = {
  classify,
  CANONICAL_CATEGORIES,
  NICHE_CATEGORIES,
};
