const BaseProvider = require("./baseProvider");
const { registerProvider } = require("./providerRegistry");
const newsData = require("../config/newsData.config");
const { classify } = require("./categoryClassifier.service");
const { deduplicateInMemory } = require("../utils/duplicateDetector");

// NewsData.io supported categories on /latest endpoint.
const NEWSDATA_CATEGORY_MAP = {
  general:       "top",
  business:      "business",
  technology:    "technology",
  science:       "science",
  health:        "health",
  sports:        "sports",
  entertainment: "entertainment",
};

class NewsDataProvider extends BaseProvider {
  constructor() {
    super("newsdata");
  }

  async fetchTopHeadlines({
    page = 1,
    limit = 10,
    category = "general",
    country = "in",
    language = "en",
    from,
    sortby,
  }) {
    console.log("🌍 Calling NewsData.io...");

    const params = {
      country,
      size: limit,
      category: NEWSDATA_CATEGORY_MAP[category] || "top",
    };

    // NewsData.io uses cursor-based pagination
    if (page && typeof page === "string") {
      params.page = page;
    }

    const { data } = await newsData.get("/latest", { params });
    console.log(`NewsData.io returned ${(data?.results || []).length} articles`);

    const normalized = normalizeArticles(
      data?.results || [],
      category,
      country,
      language
    );
    const deduped = deduplicateInMemory(normalized);
    deduped.nextPage = data?.nextPage;
    return deduped;
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
    let author = "Unknown";
    if (article.creator) {
      if (Array.isArray(article.creator)) {
        author = article.creator.filter(Boolean).join(", ") || "Unknown";
      } else if (typeof article.creator === "string") {
        author = article.creator.trim() || "Unknown";
      }
    }

    const cleanedContent = article.content && article.content !== "ONLY AVAILABLE IN PAID PLANS"
      ? article.content : "";

    const rawLang = article.language || article.lang || fallbackLanguage;
    const articleLang = cleanLanguageCode(rawLang);

    // Use article's own reported category as hint
    const providerCategoryHint = Array.isArray(article.category)
      ? article.category[0]
      : (article.category || null);

    return {
      title: article.title || "",
      description: article.description || "",
      content: cleanedContent,
      author,
      source: {
        name: article.source_name || article.source_id || "Unknown",
        url: article.source_url || "",
      },
      articleUrl: article.link,
      imageUrl: article.image_url || "",
      publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
      category: classify(
        providerCategoryHint,
        article.title || "",
        article.description || "",
        cleanedContent
      ),
      country,
      language: articleLang,
      originalLanguage: articleLang,
      originalTitle: article.title || "",
      originalDescription: article.description || "",
      originalContent: cleanedContent,
      provider: "newsdata",
    };
  });
};

const newsDataProviderInstance = new NewsDataProvider();
registerProvider("newsdata", newsDataProviderInstance);

module.exports = {
  fetchTopHeadlines: newsDataProviderInstance.fetchTopHeadlines.bind(newsDataProviderInstance),
  instance: newsDataProviderInstance,
};
