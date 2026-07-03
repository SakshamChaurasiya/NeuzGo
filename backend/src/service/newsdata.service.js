const newsData = require("../config/newsData.config");

const fetchTopHeadlines = async ({
    page = 1,
    limit = 10,
    category = "general",
    country = "in",
    language = "en",
    from,      // Accepted but omitted for NewsData.io compatibility
    sortby,    // Accepted but omitted for NewsData.io compatibility
}) => {
    console.log("🌍 Calling NewsData.io...");

    // Map general to top for NewsData.io
    const mappedCategory = category === "general" ? "top" : category;

    // language parameter is omitted to fetch widest possible news coverage
    const params = {
        category: mappedCategory,
        country,
        size: limit,
    };

    // NewsData.io uses cursor-based pagination. If page is a string token, pass it.
    // If page is a number (like page=1), omit it to avoid pagination errors.
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
    normalized.nextPage = data?.nextPage;
    return normalized;
};

function cleanLanguageCode(lang) {
  if (!lang) return "en";
  const l = String(lang).toLowerCase().trim();
  if (l.startsWith("en") || l === "english") return "en";
  if (l.startsWith("hi") || l === "hindi") return "hi";
  if (l.startsWith("es") || l === "spanish") return "es";
  if (l.startsWith("fr") || l === "french") return "fr";
  if (l.startsWith("de") || l === "german") return "de";
  return l.substring(0, 2);
}

const normalizeArticles = (
    articles,
    category,
    country,
    fallbackLanguage = "en"
) => {
    return articles.map((article) => {
        let author = "Unknown";
        if (article.creator) {
            if (Array.isArray(article.creator)) {
                author = article.creator.filter(Boolean).join(", ") || "Unknown";
            } else if (typeof article.creator === "string") {
                author = article.creator.trim() || "Unknown";
            }
        }

        // Clean up paid plan notice from content
        const cleanedContent = article.content && article.content !== "ONLY AVAILABLE IN PAID PLANS"
            ? article.content
            : "";

        const rawLang = article.language || article.lang || fallbackLanguage;
        const articleLang = cleanLanguageCode(rawLang);

        return {
            title: article.title || "",
            description: article.description || "",
            content: cleanedContent,
            author: author,
            source: {
                name: article.source_name || article.source_id || "Unknown",
                url: article.source_url || "",
            },
            articleUrl: article.link,
            imageUrl: article.image_url || "",
            publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
            category,
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

module.exports = { fetchTopHeadlines };

