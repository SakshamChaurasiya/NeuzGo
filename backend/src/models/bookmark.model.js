const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that a user can only bookmark a specific article once
bookmarkSchema.index({ userId: 1, newsId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);