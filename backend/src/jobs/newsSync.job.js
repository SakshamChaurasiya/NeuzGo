const News = require("../models/news.model");
const { fetchTopHeadlines } = require("../service/newsProvider.service");

async function syncNews() {
  const startTime = Date.now();
  console.log("⏱️ [Cron] News sync started — scope: general/IN/EN/page1");

  try {
    // ── 1. Fetch from News Provider ─────────────────────────────────────────────
    console.log("📡 [Cron] Calling News Provider API...");
    const articles = await fetchTopHeadlines({
      page: 1,
      limit: 10,
      category: "general",
      country: "in",
      language: "en",
    });
    console.log(`✅ [Cron] News Provider returned ${articles.length} articles`);

    const fetchedCount = articles.length;
    let bulkOps = [];
    let insertedCount = 0;
    let updatedCount = 0;
    let duplicateCount = 0;

    if (fetchedCount === 0) {
      console.log("⚠️ [Cron] No articles returned from News Provider — skipping upsert");
    } else {
      // ── 2. Retrieve existing records for change detection ──────────────────
      const articleUrls = articles.map((a) => a.articleUrl);
      const existingArticles = await News.find(
        { articleUrl: { $in: articleUrls } },
        { articleUrl: 1, title: 1, description: 1, content: 1, author: 1, imageUrl: 1, publishedAt: 1, category: 1, country: 1, language: 1, source: 1 }
      ).lean();
      const existingMap = new Map(existingArticles.map((a) => [a.articleUrl, a]));

      bulkOps = [];

      const CHECK_FIELDS = [
        "title", "description", "content", "author",
        "imageUrl", "category", "country", "language",
      ];

      for (const article of articles) {
        const existing = existingMap.get(article.articleUrl);

        if (existing) {
          // Determine which fields actually changed
          const fieldsToUpdate = {};

          for (const field of CHECK_FIELDS) {
            if (existing[field] !== article[field]) {
              fieldsToUpdate[field] = article[field];
            }
          }

          // Date comparison — normalize to timestamps
          if (new Date(existing.publishedAt).getTime() !== new Date(article.publishedAt).getTime()) {
            fieldsToUpdate.publishedAt = article.publishedAt;
          }

          // Nested source object
          if (
            existing.source?.name !== article.source?.name ||
            existing.source?.url !== article.source?.url
          ) {
            fieldsToUpdate.source = article.source;
          }

          if (Object.keys(fieldsToUpdate).length > 0) {
            bulkOps.push({
              updateOne: {
                filter: { articleUrl: article.articleUrl },
                update: { $set: fieldsToUpdate },
              },
            });
            updatedCount++;
          } else {
            duplicateCount++;
          }
        } else {
          bulkOps.push({
            insertOne: { document: article },
          });
          insertedCount++;
        }
      }

      if (bulkOps.length > 0) {
        await News.bulkWrite(bulkOps, { ordered: false });
      }

      console.log(`📊 [Cron] Upsert complete — inserted: ${insertedCount}, updated: ${updatedCount}, duplicated: ${duplicateCount}`);
    }

    // ── 3. Cleanup ─────────────────────────────────────────────────────────────
    // General: 30-day retention (kept fresh by this cron)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const generalCleanup = await News.deleteMany({
      category: "general",
      publishedAt: { $lt: thirtyDaysAgo },
    });

    // Non-general: 48-hour retention (user-triggered, re-fetched on demand)
    // Keeps DB size manageable without leaving category pages cold indefinitely.
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const categoryCleanup = await News.deleteMany({
      category: { $ne: "general" },
      publishedAt: { $lt: fortyEightHoursAgo },
    });

    const deletedCount = (generalCleanup.deletedCount || 0) + (categoryCleanup.deletedCount || 0);

    const duration = Date.now() - startTime;
    console.log("📊 [Cron] Sync Summary:");
    console.log(`   Fetched    : ${fetchedCount}`);
    console.log(`   Inserted   : ${insertedCount}`);
    console.log(`   Updated    : ${updatedCount}`);
    console.log(`   Duplicates : ${duplicateCount}`);
    console.log(`   Deleted    : ${deletedCount} (general >30d: ${generalCleanup.deletedCount}, other >48h: ${categoryCleanup.deletedCount})`);
    console.log(`   Duration   : ${duration}ms`);

  } catch (error) {
    // Detect 429 specifically so it shows up clearly in logs
    if (error.response?.status === 429) {
      console.error("❌ [Cron] Provider rate limit hit (HTTP 429) — will retry on next scheduled run");
    } else {
      console.error("❌ [Cron] News sync error:", error.message);
    }
  }
}

module.exports = {
  syncNews,
};
