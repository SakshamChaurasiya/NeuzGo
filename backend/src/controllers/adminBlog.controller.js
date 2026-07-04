const blogService = require("../service/blog.service");

// @desc    Get all blogs (Admin management list)
// @route   GET /api/admin/blogs
// @access  Private/Admin
const getAdminBlogs = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;
        const result = await blogService.getAdminBlogs({
            status,
            search,
            page: Math.max(1, Number(page) || 1),
            limit: Math.max(1, Number(limit) || 10),
        });

        return res.status(200).json({
            success: true,
            data: result.blogs,
            pagination: {
                total: result.total,
                page: result.page,
                pages: result.pages,
            },
        });
    } catch (error) {
        console.error("Admin get blogs error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching admin blogs dashboard.",
        });
    }
};

// @desc    Approve a pending blog
// @route   POST /api/admin/blogs/:id/approve
// @access  Private/Admin
const approveBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogService.approveBlog(id, req.user._id);

        return res.status(200).json({
            success: true,
            message: "Blog approved successfully.",
            data: blog,
        });
    } catch (error) {
        console.error("Admin approve blog error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Error approving blog.",
        });
    }
};

// @desc    Reject a pending blog
// @route   POST /api/admin/blogs/:id/reject
// @access  Private/Admin
const rejectBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const blog = await blogService.rejectBlog(id, req.user._id, reason);

        return res.status(200).json({
            success: true,
            message: "Blog rejected successfully.",
            data: blog,
        });
    } catch (error) {
        console.error("Admin reject blog error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Error rejecting blog.",
        });
    }
};

// @desc    Delete any blog by admin
// @route   DELETE /api/admin/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogService.deleteBlogByAdmin(id);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully by admin.",
            data: blog,
        });
    } catch (error) {
        console.error("Admin delete blog error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Error deleting blog.",
        });
    }
};

// @desc    Get blog statistics
// @route   GET /api/admin/blogs/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const stats = await blogService.getBlogStats();
        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error retrieving stats.",
        });
    }
};

module.exports = {
    getAdminBlogs,
    approveBlog,
    rejectBlog,
    deleteBlog,
    getStats,
};
