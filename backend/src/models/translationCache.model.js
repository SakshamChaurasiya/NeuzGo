const mongoose = require("mongoose");

const translationCacheSchema = new mongoose.Schema(
  {
    articleId: {
      type: String, // String representation of Article ID / Item ID (for generic reusability)
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt as the translation timestamp
  }
);

// Create compound index on articleId + language to ensure fast lookups and uniqueness
translationCacheSchema.index({ articleId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model("TranslationCache", translationCacheSchema);
