const News = require("../models/news.model");
const { fetchTopHeadlines } = require("../service/gnews.service");

/**
 * Synchronizes news articles from GNews API to MongoDB.
 * Fetch default parameters: country=in, category=general, lang=en, max=10, page=1
 */
async function syncNews() {
  const startTime = Date.now();
  console.log("⏱️ Cron started");

  try {
    console.log("📡 API request started");
    const articles = await fetchTopHeadlines({
      page: 1,
      limit: 10,
      category: "general",
      country: "in",
      language: "en",
    });
    console.log("✅ API request completed");

    const fetchedCount = articles.length;
    console.log(`📰 Number of fetched articles: ${fetchedCount}`);

    if (fetchedCount === 0) {
      console.log("⚠️ No articles fetched from GNews.");
      return;
    }

    // Retrieve existing articles to determine which need updating versus inserting
    const articleUrls = articles.map(a => a.articleUrl);
    const existingArticles = await News.find({ articleUrl: { $in: articleUrls } });
    const existingMap = new Map(existingArticles.map(a => [a.articleUrl, a]));

    const bulkOps = [];
    let insertedCount = 0;
    let updatedCount = 0;

    for (const article of articles) {
      const existing = existingMap.get(article.articleUrl);
      if (existing) {
        // Check if fields have changed
        let hasChanges = false;
        const fieldsToUpdate = {};

        // Compare relevant fields
        const checkFields = ["title", "description", "content", "author", "imageUrl", "publishedAt", "category", "country", "language"];
        for (const field of checkFields) {
          // Normalize publishedAt date comparison
          if (field === "publishedAt") {
            if (new Date(existing.publishedAt).getTime() !== new Date(article.publishedAt).getTime()) {
              hasChanges = true;
              fieldsToUpdate.publishedAt = article.publishedAt;
            }
          } else if (existing[field] !== article[field]) {
            hasChanges = true;
            fieldsToUpdate[field] = article[field];
          }
        }

        // Compare source object nested properties
        if (
          existing.source?.name !== article.source?.name ||
          existing.source?.url !== article.source?.url
        ) {
          hasChanges = true;
          fieldsToUpdate.source = article.source;
        }

        if (hasChanges) {
          bulkOps.push({
            updateOne: {
              filter: { articleUrl: article.articleUrl },
              update: { $set: fieldsToUpdate },
            },
          });
          updatedCount++;
        }
      } else {
        bulkOps.push({
          insertOne: {
            document: article,
          },
        });
        insertedCount++;
      }
    }

    if (bulkOps.length > 0) {
      await News.bulkWrite(bulkOps);
    }

    // Cleanup: Delete articles older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleteResult = await News.deleteMany({
      publishedAt: { $lt: thirtyDaysAgo },
    });
    const deletedCount = deleteResult.deletedCount || 0;

    const duration = Date.now() - startTime;

    console.log(`📊 Sync Summary:`);
    console.log(`  - Number of inserted articles: ${insertedCount}`);
    console.log(`  - Number of updated articles: ${updatedCount}`);
    console.log(`  - Number of deleted articles: ${deletedCount}`);
    console.log(`⏱️ Total execution time: ${duration}ms`);

  } catch (error) {
    console.error("❌ Error in News Synchronization job:", error);
  }
}

module.exports = {
  syncNews,
};
