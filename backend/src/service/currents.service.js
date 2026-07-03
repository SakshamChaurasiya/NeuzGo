const BaseProvider = require("./baseProvider");
const { registerProvider } = require("./providerRegistry");
const currents = require("../config/currents.config");
const { classify } = require("./categoryClassifier.service");
const { deduplicateInMemory } = require("../utils/duplicateDetector");

// Currents API supported categories on /latest-news endpoint.
const CURRENTS_CATEGORY_MAP = {
  general:       "world",
  business:      "finance",
  technology:    "technology",
  science:       "science",
  health:        "health",
  sports:        "sports",
  entertainment: "entertainment",
};

class CurrentsProvider extends BaseProvider {
  constructor() {
    super("currents");
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
    if (!process.env.CURRENTS_API_KEY) {
      throw new Error("CURRENTS_API_KEY is not configured");
    }

    console.log("🌍 Calling Currents API...");

    const apiCategory = CURRENTS_CATEGORY_MAP[category] || "world";
    const params = {
      category: apiCategory,
      language: "en",
      country: country ? country.toUpperCase() : undefined,
      page_size: Math.min(limit, 200),
    };

    // Cursor-based pagination
    if (page && typeof page === "string") {
      params.page = page;
    }

    const { data } = await currents.get("/latest-news", { params });
    console.log(`✅ Currents API returned ${(data?.news || []).length} articles`);

    const normalized = normalizeArticles(
      data?.news || [],
      category,
      country,
      language
    );

    const deduped = deduplicateInMemory(normalized);
    deduped.nextPage = data?.nextPage || null;
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
  return articles
    .filter((a) => a.url && a.title)
    .map((article) => {
      const rawLang = article.language || fallbackLanguage;
      const articleLang = cleanLanguageCode(rawLang);

      let sourceHostname = "";
      try { sourceHostname = new URL(article.url).hostname.replace(/^www\./, ""); } catch (_) {}

      return {
        title: article.title || "",
        description: article.description || "",
        content: article.description || "",
        author: article.author || "Unknown",
        source: {
          name: sourceHostname || "Unknown",
          url: article.url || "",
        },
        articleUrl: article.url,
        imageUrl: article.image || "",
        publishedAt: article.published ? new Date(article.published) : new Date(),
        // Keyword matching on content is authoritative
        category: classify(
          category,
          article.title || "",
          article.description || "",
          ""
        ),
        country,
        language: articleLang,
        originalLanguage: articleLang,
        originalTitle: article.title || "",
        originalDescription: article.description || "",
        originalContent: article.description || "",
        provider: "currents",
      };
    });
};

const currentsProviderInstance = new CurrentsProvider();
registerProvider("currents", currentsProviderInstance);

module.exports = {
  fetchTopHeadlines: currentsProviderInstance.fetchTopHeadlines.bind(currentsProviderInstance),
  instance: currentsProviderInstance,
};
