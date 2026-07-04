const Blog = require("../models/blogs.model");

/**
 * Create a new draft blog
 * @param {string} authorId - ID of the blog author
 * @param {Object} blogData - Blog fields (title, description, content, imageUrl, category, tags)
 * @returns {Promise<Object>} The created blog document
 */
const createDraft = async (authorId, blogData) => {
    const { title, description, content, imageUrl, category, tags } = blogData;

    const draft = new Blog({
        author: authorId,
        title,
        description,
        content,
        imageUrl,
        category: category || "General",
        tags: tags || [],
        status: "Draft",
    });

    return await draft.save();
};

/**
 * Update an existing draft or rejected blog
 * @param {string} blogId - ID of the blog to update
 * @param {string} authorId - ID of the blog author (for authorization)
 * @param {Object} blogData - Updated blog fields
 * @returns {Promise<Object>} The updated blog document
 */
const updateDraft = async (blogId, authorId, blogData) => {
    const blog = await Blog.findOne({ _id: blogId, author: authorId });
    if (!blog) {
        throw new Error("Blog not found or unauthorized.");
    }

    if (blog.status !== "Draft" && blog.status !== "Rejected") {
        throw new Error(`Cannot update a blog in ${blog.status} status.`);
    }

    const { title, description, content, imageUrl, category, tags } = blogData;

    if (title !== undefined) {
        blog.title = title;
        // Reset slug on title change
        blog.slug = undefined;
    }
    if (description !== undefined) blog.description = description;
    if (content !== undefined) blog.content = content;
    if (imageUrl !== undefined) blog.imageUrl = imageUrl;
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = tags;

    blog.lastEditedAt = new Date();

    return await blog.save();
};

/**
 * Soft-delete own blog (any status) — author can delete their own blogs at any stage
 * @param {string} blogId - ID of the blog
 * @param {string} authorId - ID of the blog author (for authorization)
 * @returns {Promise<Object>} The updated blog document
 */
const deleteOwnDraft = async (blogId, authorId) => {
    const blog = await Blog.findOne({ _id: blogId, author: authorId });
    if (!blog) {
        throw new Error("Blog not found or unauthorized.");
    }

    if (blog.status === "Deleted") {
        throw new Error("Blog has already been deleted.");
    }

    // Soft-delete: mark as "Deleted" so author dashboard can show history if needed
    blog.status = "Deleted";
    return await blog.save();
};

/**
 * Retrieve own blogs (drafts, pending, approved, rejected)
 * @param {string} authorId - ID of the user
 * @param {Object} filter - Additional filters (status)
 * @returns {Promise<Array>} List of user's blogs
 */
const getMyBlogs = async (authorId, filter = {}) => {
    const query = { author: authorId };
    if (filter.status) {
        query.status = filter.status;
    } else {
        // Exclude Deleted blogs by default
        query.status = { $ne: "Deleted" };
    }
    return await Blog.find(query).sort({ updatedAt: -1 });
};

/**
 * Submit a blog draft for review
 * @param {string} blogId - ID of the blog
 * @param {string} authorId - ID of the blog author (for auth check)
 * @returns {Promise<Object>} The updated blog document
 */
const submitForReview = async (blogId, authorId) => {
    const blog = await Blog.findOne({ _id: blogId, author: authorId });
    if (!blog) {
        throw new Error("Blog not found or unauthorized.");
    }

    if (blog.status !== "Draft" && blog.status !== "Rejected") {
        throw new Error(`Cannot submit a blog in ${blog.status} status. Only Draft or Rejected blogs can be submitted.`);
    }

    // Admins bypass the approval queue and publish directly
    const User = require("../models/user.model");
    const author = await User.findById(authorId);
    if (author && author.role === "admin") {
        blog.status = "Approved";
        blog.approvedAt = new Date();
        blog.publishedAt = new Date();
        blog.approvedBy = authorId;
    } else {
        blog.status = "Pending";
        blog.submittedAt = new Date();
    }

    return await blog.save();
};

/**
 * Retrieve admin blogs with filtering, searching, sorting, and pagination
 */
const getAdminBlogs = async ({ status, search, page = 1, limit = 10 }) => {
    const query = {};
    if (status) {
        query.status = status;
    }

    if (search) {
        const User = require("../models/user.model");
        const matchingUsers = await User.find({
            $or: [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }).select("_id");

        const userIds = matchingUsers.map(u => u._id);

        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { author: { $in: userIds } }
        ];
    }

    const skip = (page - 1) * limit;
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .populate("author", "username email phoneNumber")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        blogs,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

/**
 * Approve a pending blog
 */
const approveBlog = async (blogId, adminId) => {
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new Error("Blog not found.");
    }
    if (blog.status !== "Pending") {
        throw new Error(`Cannot approve a blog in ${blog.status} status.`);
    }
    blog.status = "Approved";
    blog.approvedAt = new Date();
    blog.publishedAt = new Date();
    blog.approvedBy = adminId;
    return await blog.save();
};

/**
 * Reject a pending blog
 */
const rejectBlog = async (blogId, adminId, reason) => {
    if (!reason || !reason.trim()) {
        throw new Error("Rejection reason is required.");
    }
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new Error("Blog not found.");
    }
    if (blog.status !== "Pending") {
        throw new Error(`Cannot reject a blog in ${blog.status} status.`);
    }
    blog.status = "Rejected";
    blog.rejectedAt = new Date();
    blog.rejectionReason = reason;
    return await blog.save();
};

/**
 * Delete any blog by admin
 */
const deleteBlogByAdmin = async (blogId) => {
    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new Error("Blog not found.");
    }
    blog.status = "Deleted";
    return await blog.save();
};

/**
 * Get statistical overview of blogs
 */
const getBlogStats = async () => {
    const stats = await Blog.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likes" }
            }
        }
    ]);

    const result = {
        Draft: 0,
        Pending: 0,
        Approved: 0,
        Rejected: 0,
        Deleted: 0,
        totalViews: 0,
        totalLikes: 0
    };

    stats.forEach(item => {
        if (result[item._id] !== undefined) {
            result[item._id] = item.count;
        }
        result.totalViews += item.totalViews || 0;
        result.totalLikes += item.totalLikes || 0;
    });

    return result;
};

/**
 * Retrieve approved public blogs
 */
const getApprovedBlogs = async ({ category, page = 1, limit = 10 }) => {
    const query = { status: "Approved" };
    if (category && category !== "All") {
        query.category = category;
    }
    const skip = (page - 1) * limit;
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .populate("author", "username email")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        blogs,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

/**
 * Get a single approved blog and increment views
 */
const getBlogByIdAndIncrementViews = async (blogId) => {
    const blog = await Blog.findOne({ _id: blogId, status: "Approved" })
        .populate("author", "username email");
    if (!blog) {
        throw new Error("Blog not found or not published.");
    }
    blog.views += 1;
    await blog.save();
    return blog;
};

module.exports = {
    createDraft,
    updateDraft,
    deleteOwnDraft,
    getMyBlogs,
    submitForReview,
    getAdminBlogs,
    approveBlog,
    rejectBlog,
    deleteBlogByAdmin,
    getBlogStats,
    getApprovedBlogs,
    getBlogByIdAndIncrementViews,
};
