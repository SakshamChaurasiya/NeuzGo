const newsApi = require("../config/newsApi.config");

const fetchTopHeadlines = async ({
    page = 1,
    limit = 10,
    category = "general",
    country = "in",
    language = "en",
}) => {
    console.log("🌍 Calling NewsAPI...");
    const { data } = await newsApi.get("/top-headlines", {
        params: {
            page,
            pageSize: limit,
            category,
            country,
            language
        },
    });
    console.log(`NewsAPi returned ${(data?.articles || []).length} articles`);

    return normalizeArticles(
        data?.articles || [],
        category,
        country,
        language
    );
}

const normalizeArticles = (
    articles,
    category,
    country,
    language
) => {
    return articles.map((article) => ({
        title: article.title,

        description: article.description || "",

        content: article.content || "",

        author: article.author || "Unknown",

        source: {
            name: article.source?.name || "",
            url: "",
        },

        articleUrl: article.url,

        imageUrl: article.urlToImage || "",

        publishedAt: article.publishedAt,

        category,

        country,

        language,

        provider: "newsApi",
    }));
};

module.exports = { fetchTopHeadlines };