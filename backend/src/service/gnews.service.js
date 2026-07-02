const gnews = require("../config/gnews.config");

const fetchTopHeadlines = async ({
    page = 1,
    limit = 10,
    category = "general",
    country = "in",
    language = "en",
}) => {
    console.log("🌍 Calling GNews API...");
    const { data } = await gnews.get("/top-headlines", {
        params: {
            page,
            max: limit,
            category,
            country,
            lang: language,
        },
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

        language,

        provider: "gnews",
    }));
};

module.exports = {
    fetchTopHeadlines,
};