/**
 * db-cleanup.js
 *
 * Cleans up the database by:
 *   1. Deleting all news articles belonging to "fashion" or "astrology" (targeted cleanup).
 *   2. Supporting both single string category and array schema formats.
 *   3. Deleting cursors related to those categories.
 *
 * If you run with: node scripts/db-cleanup.js --all
 * It will drop the entire news and newscursors collections.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const targetCategories = ["fashion", "astrology"];

async function cleanDb() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;
  const isFullDrop = process.argv.includes("--all");

  if (isFullDrop) {
    console.log("⚠️ Full drop requested...");
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);

    if (names.includes("news")) {
      await db.collection("news").drop();
      console.log("🗑️ Dropped: news");
    }
    if (names.includes("newscursors")) {
      await db.collection("newscursors").drop();
      console.log("🗑️ Dropped: newscursors");
    }
  } else {
    console.log("🧹 Running targeted category cleanup for: " + targetCategories.join(", "));

    const newsCollection = db.collection("news");
    const cursorsCollection = db.collection("newscursors");

    // Deletes documents where category is "fashion" / "astrology", or categories array contains them
    const deleteFilter = {
      $or: [
        { category: { $in: targetCategories } },
        { categories: { $in: targetCategories } }
      ]
    };

    const newsResult = await newsCollection.deleteMany(deleteFilter);
    console.log(`🗑️ Deleted ${newsResult.deletedCount} articles belonging to fashion/astrology.`);

    // Deletes cursors matching those categories
    const cursorResult = await cursorsCollection.deleteMany({
      $or: targetCategories.map(cat => ({ key: new RegExp(`^${cat}:`, "i") }))
    });
    console.log(`🗑️ Deleted ${cursorResult.deletedCount} sync cursors related to fashion/astrology.`);
  }

  console.log("✅ Database cleanup complete.");
  await mongoose.disconnect();
}

cleanDb().catch((err) => {
  console.error("❌ Cleanup failed:", err.message);
  process.exit(1);
});
