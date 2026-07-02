const News = require("../models/news.model");

const getNews = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const category = req.query.category || "general";
    const country = req.query.country || "in";
    const language = req.query.language || "en";
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const filter = {
      category,
      country,
      language,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    console.log(`[News Request] 🔍 Checking MongoDB database for articles (category: ${category}, country: ${country}, lang: ${language}, search: "${search}")...`);

    let [articles, total] = await Promise.all([
      News.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),

      News.countDocuments(filter),
    ]);

    // Fallback: If no articles exist in the database for the requested category/country/language, fetch from GNews API
    if (total === 0) {
      console.log(`[News Request] ⚠️ 0 articles found in MongoDB. Fetching from GNews API...`);
      const { fetchTopHeadlines } = require("../service/gnews.service");
      
      try {
        const fetchedArticles = await fetchTopHeadlines({
          page: 1,
          limit: limit,
          category,
          country,
          language,
        });

        if (fetchedArticles.length > 0) {
          console.log(`[News Request] 📡 Fetched ${fetchedArticles.length} articles from GNews. Saving to MongoDB...`);
          
          // Bulk write to synchronize
          const ops = fetchedArticles.map((article) => ({
            updateOne: {
              filter: { articleUrl: article.articleUrl },
              update: { $set: article },
              upsert: true,
            },
          }));

          await News.bulkWrite(ops);

          // Query again to get the saved items
          articles = await News.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);

          total = await News.countDocuments(filter);
        } else {
          console.log(`[News Request] ⚠️ GNews API returned 0 articles.`);
        }
      } catch (apiErr) {
        console.error(`[News Request] ❌ Failed to fetch from GNews API during fallback:`, apiErr.message);
      }
    } else {
      console.log(`[News Request] 🗄️ Serving news directly from MongoDB database. NO GNews API call made.`);
    }

    console.log(`[News Request] ✅ Returning ${articles.length} articles.`);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: articles,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getNewsById = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getNews,
  getNewsById,
};