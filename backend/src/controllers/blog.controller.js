const blogService = require("../service/blog.service");

// Helper to validate blog data
const validateBlogData = (data, isUpdate = false) => {
    const { title, description, content } = data;
    const errors = [];

    if (!isUpdate) {
        if (!title || typeof title !== "string" || !title.trim()) {
            errors.push("Title is required and must be a valid string.");
        }
        if (!description || typeof description !== "string" || !description.trim()) {
            errors.push("Description is required and must be a valid string.");
        }
        if (!content || typeof content !== "string" || !content.trim()) {
            errors.push("Content is required and must be a valid string.");
        }
    } else {
        if (title !== undefined && (typeof title !== "string" || !title.trim())) {
            errors.push("Title must be a valid non-empty string.");
        }
        if (description !== undefined && (typeof description !== "string" || !description.trim())) {
            errors.push("Description must be a valid non-empty string.");
        }
        if (content !== undefined && (typeof content !== "string" || !content.trim())) {
            errors.push("Content must be a valid non-empty string.");
        }
    }

    return errors;
};

// @desc    Create a new draft blog
// @route   POST /api/blogs/draft
// @access  Private
const createDraft = async (req, res) => {
    try {
        const errors = validateBlogData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors,
            });
        }

        const draft = await blogService.createDraft(req.user._id, req.body);
        return res.status(201).json({
            success: true,
            message: "Draft created successfully.",
            data: draft,
        });
    } catch (error) {
        console.error("Create draft error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error creating blog draft.",
        });
    }
};

// @desc    Update a draft/rejected blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const errors = validateBlogData(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors,
            });
        }

        const updatedBlog = await blogService.updateDraft(id, req.user._id, req.body);
        return res.status(200).json({
            success: true,
            message: "Blog updated successfully.",
            data: updatedBlog,
        });
    } catch (error) {
        console.error("Update draft error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Error updating blog draft.",
        });
    }
};

// @desc    Delete own draft or rejected blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBlog = await blogService.deleteOwnDraft(id, req.user._id);
        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully.",
            data: deletedBlog,
        });
    } catch (error) {
        console.error("Delete draft error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Error deleting blog.",
        });
    }
};

// @desc    Get user's own blogs
// @route   GET /api/blogs/my-blogs
// @access  Private
const getMyBlogs = async (req, res) => {
    try {
        const { status } = req.query;
        const blogs = await blogService.getMyBlogs(req.user._id, { status });
        return res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        console.error("Get my blogs error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching your blogs.",
        });
    }
};

// @desc    Submit a blog draft for review
// @route   POST /api/blogs/:id/submit
// @access  Private
const submitForReview = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogService.submitForReview(id, req.user._id);
        return res.status(200).json({
            success: true,
            message: "Blog submitted for review successfully.",
            data: blog,
        });
    } catch (error) {
        console.error("Submit blog error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Error submitting blog for review.",
        });
    }
};

// @desc    Get all approved blogs (public feed)
// @route   GET /api/blogs
// @access  Public
const getApprovedBlogs = async (req, res) => {
    try {
        const { category, page, limit } = req.query;
        const result = await blogService.getApprovedBlogs({
            category,
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
        console.error("Get approved blogs error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error retrieving public blog feed.",
        });
    }
};

const getBlogDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const Blog = require("../models/blogs.model");

        const blog = await Blog.findById(id).select("+viewedBy").populate("author", "username email");
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        const visitorId = req.user._id.toString();
        const isAuthorized = req.user.role === "admin" || blog.author._id.toString() === visitorId;

        // If approved, count unique views and serve
        if (blog.status === "Approved") {
            if (!blog.viewedBy.includes(visitorId)) {
                blog.viewedBy.push(visitorId);
                blog.views += 1;
                await blog.save();
            }
            return res.status(200).json({
                success: true,
                data: blog,
            });
        }

        // Otherwise (Draft, Pending, Rejected, Deleted), check authorization
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized to view this unpublished blog.",
            });
        }

        return res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        console.error("Get blog details error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error retrieving blog details.",
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const Blog = require("../models/blogs.model");

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        const likedIndex = blog.likedBy.indexOf(userId);
        let liked = false;
        if (likedIndex > -1) {
            blog.likedBy.splice(likedIndex, 1);
            blog.likes = Math.max(0, blog.likes - 1);
        } else {
            blog.likedBy.push(userId);
            blog.likes += 1;
            liked = true;
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            liked,
            likes: blog.likes,
            message: liked ? "Blog liked." : "Blog unliked.",
        });
    } catch (error) {
        console.error("Toggle like error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error toggling like.",
        });
    }
};

const reportBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const Blog = require("../models/blogs.model");

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        if (blog.reportedBy.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this blog.",
            });
        }

        blog.reportedBy.push(userId);

        let flagged = false;
        if (blog.reportedBy.length >= 5) {
            blog.status = "Pending";
            flagged = true;
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            flagged,
            message: flagged 
                ? "Blog reported and flagged for admin review." 
                : "Blog reported successfully.",
        });
    } catch (error) {
        console.error("Report blog error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error reporting blog.",
        });
    }
};

module.exports = {
    createDraft,
    updateDraft,
    deleteDraft,
    getMyBlogs,
    submitForReview,
    getApprovedBlogs,
    getBlogDetails,
    toggleLike,
    reportBlog,
};
