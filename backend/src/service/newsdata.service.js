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

    const params = {
        category: mappedCategory,
        country,
        language,
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

const normalizeArticles = (
    articles,
    category,
    country,
    language
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
            language,
            provider: "newsdata",
        };
    });
};

module.exports = { fetchTopHeadlines };

