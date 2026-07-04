const express = require("express");
const {
    getNews,
    getNewsById,
    streamTranslations,
} = require("../controllers/news.controller.js");
const { syncNews } = require("../jobs/newsSync.job.js");

const router = express.Router();

/**
 * GET /api/news/stream-translations
 */
router.get("/stream-translations", streamTranslations);

/**
 * GET /api/news
 */
router.get("/", getNews);

/**
 * POST /api/news/sync
 * Manually triggers the synchronization job
 */
router.post("/sync", async (req, res) => {
    try {
        console.log("[Manual Sync Request] 🔄 Manual trigger received. Initiating API call to GNews...");
        await syncNews();
        console.log("[Manual Sync Request] ✅ Synchronization complete.");
        return res.status(200).json({
            success: true,
            message: "News synchronization triggered successfully",
        });
    } catch (err) {
        console.error("[Manual Sync Request] ❌ Synchronization failed:", err.message);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

/**
 * GET /api/news/:id
 */
router.get("/:id", getNewsById);

module.exports = router;