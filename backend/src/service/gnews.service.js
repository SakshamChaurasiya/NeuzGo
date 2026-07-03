const BaseProvider = require("./baseProvider");
const { registerProvider } = require("./providerRegistry");
const gnews = require("../config/gnews.config");
const { classify } = require("./categoryClassifier.service");
const { deduplicateInMemory } = require("../utils/duplicateDetector");

// GNews API only supports these categories natively on /top-headlines.
const GNEWS_CATEGORY_MAP = {
  general:       "general",
  business:      "business",
  technology:    "technology",
  science:       "science",
  health:        "health",
  sports:        "sports",
  entertainment: "entertainment",
};

class GNewsProvider extends BaseProvider {
  constructor() {
    super("gnews");
  }

  async fetchTopHeadlines({
    page = 1,
    limit = 10,
    category = "general",
    country = "in",
    language = "en",
    from,
    sortby
  }) {
    console.log("🌍 Calling GNews API...");

    const apiCategory = GNEWS_CATEGORY_MAP[category] || "general";
    const queryParams = {
      page,
      max: limit,
      category: apiCategory,
      country,
    };
    if (from) queryParams.from = from;
    if (sortby) queryParams.sortby = sortby;

    // Remove undefined keys to avoid sending them as "undefined" strings
    Object.keys(queryParams).forEach(
      (k) => queryParams[k] === undefined && delete queryParams[k]
    );

    const { data } = await gnews.get("/top-headlines", { params: queryParams });

    const rawArticles = data?.articles || [];
    console.log(`✅ GNews returned ${rawArticles.length} articles`);

    const normalized = normalizeArticles(rawArticles, category, country, language);
    return deduplicateInMemory(normalized);
  }
}

function cleanLanguageCode(lang) {
  if (!lang || lang === "all") return "en";
  const l = String(lang).toLowerCase().trim();
  if (l.startsWith("en") || l === "english") return "en";
  if (l.startsWith("hi") || l === "hindi") return "hi";
  if (l.startsWith("es") || l === "spanish") return "es";
  if (l.startsWith("fr") || l === "french") return "fr";
  if (l.startsWith("de") || l === "german") return "de";
  return l.substring(0, 2);
}

const normalizeArticles = (articles, category, country, fallbackLanguage = "en") => {
  return articles.map((article) => {
    const rawLang = article.language || article.lang || fallbackLanguage;
    const articleLang = cleanLanguageCode(rawLang);
    return {
      title: article.title || "",
      description: article.description || "",
      content: article.content || "",
      author: article.source?.name || "Unknown",
      source: {
        name: article.source?.name || "",
        url: article.source?.url || "",
      },
      articleUrl: article.url,
      imageUrl: article.image || "",
      publishedAt: article.publishedAt,
      // Classify by actual content
      category: classify(category, article.title, article.description || "", article.content || ""),
      country,
      language: articleLang,
      originalLanguage: articleLang,
      originalTitle: article.title,
      originalDescription: article.description || "",
      originalContent: article.content || "",
      provider: "gnews",
    };
  });
};

const gnewsProviderInstance = new GNewsProvider();
registerProvider("gnews", gnewsProviderInstance);

module.exports = {
  fetchTopHeadlines: gnewsProviderInstance.fetchTopHeadlines.bind(gnewsProviderInstance),
  instance: gnewsProviderInstance,
};