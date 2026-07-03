const gnews = require("../config/gnews.config");

const fetchTopHeadlines = async ({
    page = 1,
    limit = 10,
    category = "general",
    country = "in",
    language = "en",
    from,
    sortby
}) => {
    console.log("🌍 Calling GNews API...");
    // Explicitly build params object to avoid sending undefined values
    // lang parameter is omitted to fetch widest possible news coverage
    const queryParams = {
        page,
        max: limit,
        category,
        country,
    };

    if (from) queryParams.from = from;
    if (sortby) queryParams.sortby = sortby;

    const { data } = await gnews.get("/top-headlines", {
        params: queryParams,
    });

    console.log(
        `✅ GNews returned ${(data?.articles || []).length} articles`
    );
    return normalizeArticles(
        data?.articles || [],
        category,
        country,
        language
    );

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
        const rawLang = article.language || article.lang || fallbackLanguage;
        const articleLang = cleanLanguageCode(rawLang);
        return {
            title: article.title,
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
            category,
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

module.exports = {
    fetchTopHeadlines,
};