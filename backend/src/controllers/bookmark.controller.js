const Bookmark = require("../models/bookmark.model");
const News = require("../models/news.model");

// @desc    Get all bookmarks for logged-in user
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user._id })
            .populate("newsId")
            .sort({ createdAt: -1 });

        // Filter out orphaned bookmarks (where the news article was deleted)
        const validBookmarks = bookmarks.filter(b => b.newsId !== null);
        const orphanIds = bookmarks.filter(b => b.newsId === null).map(b => b._id);

        // Delete orphaned bookmarks in the database asynchronously if any exist
        if (orphanIds.length > 0) {
            Bookmark.deleteMany({ _id: { $in: orphanIds } }).catch(err => {
                console.error("Failed to delete orphaned bookmarks:", err);
            });
        }

        return res.status(200).json({
            success: true,
            data: validBookmarks,
        });
    } catch (error) {
        console.error("Get bookmarks error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error retrieving bookmarks.",
        });
    }
};

// @desc    Bookmark a news article
// @route   POST /api/bookmarks
// @access  Private
const addBookmarks = async (req, res) => {
    try {
        const { newsId } = req.body;

        if (!newsId) {
            return res.status(400).json({
                success: false,
                message: "News ID is required.",
            });
        }

        // Verify if news article exists
        const newsExists = await News.findById(newsId);
        if (!newsExists) {
            return res.status(404).json({
                success: false,
                message: "News article not found.",
            });
        }

        // Check if already bookmarked
        const alreadyBookmarked = await Bookmark.findOne({
            userId: req.user._id,
            newsId,
        });

        if (alreadyBookmarked) {
            return res.status(400).json({
                success: false,
                message: "Article is already bookmarked.",
            });
        }

        const bookmark = await Bookmark.create({
            userId: req.user._id,
            newsId,
        });

        return res.status(201).json({
            success: true,
            message: "News bookmarked successfully.",
            data: bookmark,
        });
    } catch (error) {
        console.error("Add bookmark error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error adding bookmark.",
        });
    }
};

// @desc    Delete bookmark by ID
// @route   DELETE /api/bookmarks/:id
// @access  Private
const deleteBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!bookmark) {
            return res.status(404).json({
                success: false,
                message: "Bookmark not found or unauthorized.",
            });
        }

        await bookmark.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Bookmark removed successfully.",
        });
    } catch (error) {
        console.error("Delete bookmark error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error deleting bookmark.",
        });
    }
};

// @desc    Delete bookmark by News article ID
// @route   DELETE /api/bookmarks/news/:newsId
// @access  Private
const deleteBookmarkByNewsId = async (req, res) => {
    try {
        const { newsId } = req.params;

        if (!newsId) {
            return res.status(400).json({
                success: false,
                message: "News ID is required.",
            });
        }

        const bookmark = await Bookmark.findOne({
            newsId,
            userId: req.user._id,
        });

        if (!bookmark) {
            return res.status(404).json({
                success: false,
                message: "Bookmark not found or unauthorized.",
            });
        }

        await bookmark.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Bookmark removed successfully.",
        });
    } catch (error) {
        console.error("Delete bookmark by newsId error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error deleting bookmark.",
        });
    }
};

module.exports = {
    getBookmarks,
    addBookmarks,
    deleteBookmark,
    deleteBookmarkByNewsId,
};
