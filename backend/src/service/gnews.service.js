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
    const queryParams = {
        page,
        max: limit,
        category,
        country,
        lang: language,
    };

    if (from) queryParams.from = from;
    if (sortby) queryParams.sortby = sortby;

    // const { data } = await gnews.get("/top-headlines", {
    //     params: {
    //         page,
    //         max: limit,
    //         category,
    //         country,
    //         lang: language,
    //     },
    // });

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