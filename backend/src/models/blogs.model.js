const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        imageMetadata: {
            type: Map,
            of: String,
            default: {},
        },
        status: {
            type: String,
            enum: ["Draft", "Pending", "Approved", "Rejected", "Deleted"],
            default: "Draft",
            required: true,
        },
        category: {
            type: String,
            default: "General",
        },
        tags: {
            type: [String],
            default: [],
        },
        views: {
            type: Number,
            default: 0,
        },
        viewedBy: {
            type: [String],
            default: [],
            select: false,
        },
        likes: {
            type: Number,
            default: 0,
        },
        likedBy: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }],
            default: [],
        },
        reportedBy: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }],
            default: [],
        },
        commentCount: {
            type: Number,
            default: 0,
        },
        readingTime: {
            type: Number, // In minutes
            default: 1,
        },
        submittedAt: {
            type: Date,
        },
        publishedAt: {
            type: Date,
        },
        approvedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        rejectionReason: {
            type: String,
            default: "",
        },
        lastEditedAt: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

// Indexes for high performance
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ status: 1, category: 1, publishedAt: -1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Auto-generate slug from title before saving if not provided
blogSchema.pre("save", function () {
    if (this.isModified("title") && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
    if (this.isModified("content")) {
        // Calculate reading time roughly: ~200 words per minute
        const words = this.content ? this.content.split(/\s+/).length : 0;
        this.readingTime = Math.max(1, Math.ceil(words / 200));
    }
});

module.exports = mongoose.model("Blog", blogSchema);