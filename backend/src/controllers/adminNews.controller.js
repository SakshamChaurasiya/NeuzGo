const News = require("../models/news.model");

// @desc    Get all news articles with search, sorting, filtering, pagination
// @route   GET /api/admin/news
// @access  Private/Admin
const getAdminNews = async (req, res) => {
    try {
        const { search, category, status, source, sortBy = "publishedAt", order = "desc", page = 1, limit = 10 } = req.query;

        const query = {};

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        if (source) {
            query["source.name"] = { $regex: source, $options: "i" };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } }
            ];
        }

        const parsedPage = Math.max(1, parseInt(page) || 1);
        const parsedLimit = Math.max(1, parseInt(limit) || 10);
        const skip = (parsedPage - 1) * parsedLimit;

        const sortObj = {};
        sortObj[sortBy] = order === "asc" ? 1 : -1;

        const total = await News.countDocuments(query);
        const articles = await News.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parsedLimit);

        return res.status(200).json({
            success: true,
            data: articles,
            pagination: {
                total,
                page: parsedPage,
                pages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        });
    } catch (error) {
        console.error("Get admin news error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching news articles."
        });
    }
};

// @desc    Update news details (title, description, content, author, source, category, status)
// @route   PUT /api/admin/news/:id
// @access  Private/Admin
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content, author, sourceName, sourceUrl, category, status, imageUrl } = req.body;

        const article = await News.findById(id);
        if (!article) {
            return res.status(404).json({ success: false, message: "News article not found." });
        }

        if (title !== undefined) article.title = title;
        if (description !== undefined) article.description = description;
        if (content !== undefined) article.content = content;
        if (author !== undefined) article.author = author;
        if (category !== undefined) article.category = category;
        if (status !== undefined) article.status = status;
        if (imageUrl !== undefined) article.imageUrl = imageUrl;

        if (sourceName !== undefined || sourceUrl !== undefined) {
            article.source = {
                name: sourceName !== undefined ? sourceName : article.source.name,
                url: sourceUrl !== undefined ? sourceUrl : article.source.url
            };
        }

        await article.save();

        return res.status(200).json({
            success: true,
            message: "News article updated successfully.",
            data: article
        });
    } catch (error) {
        console.error("Update news error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update news article."
        });
    }
};

// @desc    Approve news article
// @route   POST /api/admin/news/:id/approve
// @access  Private/Admin
const approveNews = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await News.findByIdAndUpdate(id, { status: "Approved" }, { new: true });
        if (!article) {
            return res.status(404).json({ success: false, message: "News article not found." });
        }

        return res.status(200).json({
            success: true,
            message: "News article approved successfully.",
            data: article
        });
    } catch (error) {
        console.error("Approve news error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to approve news article."
        });
    }
};

// @desc    Reject news article
// @route   POST /api/admin/news/:id/reject
// @access  Private/Admin
const rejectNews = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await News.findByIdAndUpdate(id, { status: "Rejected" }, { new: true });
        if (!article) {
            return res.status(404).json({ success: false, message: "News article not found." });
        }

        return res.status(200).json({
            success: true,
            message: "News article rejected successfully.",
            data: article
        });
    } catch (error) {
        console.error("Reject news error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to reject news article."
        });
    }
};

// @desc    Delete news article
// @route   DELETE /api/admin/news/:id
// @access  Private/Admin
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await News.findByIdAndDelete(id);
        if (!article) {
            return res.status(404).json({ success: false, message: "News article not found." });
        }

        return res.status(200).json({
            success: true,
            message: "News article deleted successfully."
        });
    } catch (error) {
        console.error("Delete news error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to delete news article."
        });
    }
};

// @desc    Bulk approve news articles
// @route   POST /api/admin/news/bulk-approve
// @access  Private/Admin
const bulkApproveNews = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: "Invalid article IDs." });
        }

        await News.updateMany({ _id: { $in: ids } }, { status: "Approved" });

        return res.status(200).json({
            success: true,
            message: `Successfully approved ${ids.length} articles.`
        });
    } catch (error) {
        console.error("Bulk approve news error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to bulk approve news articles."
        });
    }
};

// @desc    Bulk reject news articles
// @route   POST /api/admin/news/bulk-reject
// @access  Private/Admin
const bulkRejectNews = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: "Invalid article IDs." });
        }

        await News.updateMany({ _id: { $in: ids } }, { status: "Rejected" });

        return res.status(200).json({
            success: true,
            message: `Successfully rejected ${ids.length} articles.`
        });
    } catch (error) {
        console.error("Bulk reject news error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to bulk reject news articles."
        });
    }
};

// @desc    Bulk delete news articles
// @route   POST /api/admin/news/bulk-delete
// @access  Private/Admin
const bulkDeleteNews = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: "Invalid article IDs." });
        }

        await News.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({
            success: true,
            message: `Successfully deleted ${ids.length} articles.`
        });
    } catch (error) {
        console.error("Bulk delete news error:", error);
        return res.status(400).json({
            success: false,
            message: "Failed to bulk delete news articles."
        });
    }
};

module.exports = {
    getAdminNews,
    updateNews,
    approveNews,
    rejectNews,
    deleteNews,
    bulkApproveNews,
    bulkRejectNews,
    bulkDeleteNews
};
