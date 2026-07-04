const User = require("../models/user.model");
const News = require("../models/news.model");
const Blog = require("../models/blogs.model");

// @desc    Get dashboard metrics and chart statistics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
    try {
        // --- 1. Total Metrics (General count stats) ---
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: "admin" });
        const activeUsersToday = await User.countDocuments({ updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } });

        const totalNews = await News.countDocuments();
        const approvedNews = await News.countDocuments({ status: "Approved" });
        const pendingNews = await News.countDocuments({ status: "Pending" });
        const rejectedNews = await News.countDocuments({ status: "Rejected" });

        const totalBlogs = await Blog.countDocuments();
        const approvedBlogs = await Blog.countDocuments({ status: "Approved" });
        const pendingBlogs = await Blog.countDocuments({ status: "Pending" });
        const rejectedBlogs = await Blog.countDocuments({ status: "Rejected" });

        // Get count of unique categories and sources
        const newsCategories = await News.distinct("category");
        const blogCategories = await Blog.distinct("category");
        const uniqueCategories = Array.from(new Set([...newsCategories, ...blogCategories]));

        const uniqueSources = await News.distinct("source.name");

        const blogAggregation = await Blog.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        const totalViews = blogAggregation[0]?.totalViews || 0;

        // --- 2. Chart Aggregations ---

        // User registration trend over last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const userRegistrations = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // News published per day over last 30 days
        const newsPublished = await News.aggregate([
            { $match: { publishedAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Blogs published per week over last 8 weeks
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        const blogsPublished = await Blog.aggregate([
            { $match: { status: "Approved", publishedAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: { $week: "$publishedAt" },
                    year: { $first: { $year: "$publishedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { year: 1, _id: 1 } }
        ]);

        // Category distribution (News category counts)
        const categoryDistribution = await News.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Articles per source (Top 10)
        const sourceDistribution = await News.aggregate([
            { $group: { _id: "$source.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top authors of news and blogs
        const topNewsAuthors = await News.aggregate([
            { $group: { _id: "$author", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topBlogAuthors = await Blog.aggregate([
            { $match: { status: "Approved" } },
            {
                $group: {
                    _id: "$author",
                    count: { $sum: 1 },
                    views: { $sum: "$views" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            },
            { $unwind: "$authorDetails" },
            {
                $project: {
                    name: "$authorDetails.username",
                    count: 1,
                    views: 1
                }
            }
        ]);

        // Mock/Recent Activities list (for dashboard timeline)
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3).select("username createdAt");
        const recentApprovedBlogs = await Blog.find({ status: "Approved" }).populate("author", "username").sort({ approvedAt: -1 }).limit(3);
        const recentSubmittedBlogs = await Blog.find({ status: "Pending" }).populate("author", "username").sort({ submittedAt: -1 }).limit(3);

        const activities = [];
        recentUsers.forEach(u => {
            activities.push({
                type: "user_registered",
                message: `New user ${u.username} registered.`,
                time: u.createdAt
            });
        });
        recentApprovedBlogs.forEach(b => {
            activities.push({
                type: "blog_approved",
                message: `Blog "${b.title}" approved.`,
                time: b.approvedAt || b.updatedAt
            });
        });
        recentSubmittedBlogs.forEach(b => {
            activities.push({
                type: "blog_submitted",
                message: `Blog "${b.title}" submitted by ${b.author?.username || "Unknown"}.`,
                time: b.submittedAt || b.createdAt
            });
        });

        // Sort activities by time desc
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        return res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalUsers,
                    totalAdmins,
                    activeUsersToday,
                    totalNews,
                    approvedNews,
                    pendingNews,
                    rejectedNews,
                    totalBlogs,
                    approvedBlogs,
                    pendingBlogs,
                    rejectedBlogs,
                    totalViews,
                    categoriesCount: uniqueCategories.length,
                    sourcesCount: uniqueSources.length
                },
                charts: {
                    userRegistrations,
                    newsPublished,
                    blogsPublished: blogsPublished.map(b => ({
                        week: `Wk ${b._id}`,
                        count: b.count
                    })),
                    categoryDistribution: categoryDistribution.map(c => ({
                        name: c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : "Unknown",
                        value: c.count
                    })),
                    sourceDistribution: sourceDistribution.map(s => ({
                        name: s._id || "Unknown",
                        value: s.count
                    })),
                    topNewsAuthors: topNewsAuthors.map(a => ({
                        name: a._id || "Unknown",
                        count: a.count
                    })),
                    topBlogAuthors
                },
                activities: activities.slice(0, 7)
            }
        });
    } catch (error) {
        console.error("Get admin analytics error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error retrieving platform analytics."
        });
    }
};

module.exports = {
    getAdminAnalytics
};
