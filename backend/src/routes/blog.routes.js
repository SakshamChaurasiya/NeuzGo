const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
    createDraft,
    updateDraft,
    deleteDraft,
    getMyBlogs,
    submitForReview,
    getApprovedBlogs,
    getBlogDetails,
} = require("../controllers/blog.controller");

const router = express.Router();

// All blog routes require authentication
router.use(protect);

router.get("/", getApprovedBlogs);
router.get("/my-blogs", getMyBlogs);
router.post("/draft", createDraft);
router.post("/:id/submit", submitForReview);
router.put("/:id", updateDraft);
router.delete("/:id", deleteDraft);
router.get("/:id", getBlogDetails);

module.exports = router;
