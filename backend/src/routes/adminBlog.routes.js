const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");
const {
    getAdminBlogs,
    approveBlog,
    rejectBlog,
    deleteBlog,
    getStats,
} = require("../controllers/adminBlog.controller");

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get("/", getAdminBlogs);
router.get("/stats", getStats);
router.post("/:id/approve", approveBlog);
router.post("/:id/reject", rejectBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
