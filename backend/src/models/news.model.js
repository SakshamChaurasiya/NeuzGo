const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
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

    author: {
      type: String,
      default: "Unknown",
    },

    source: {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        default: "",
      },
    },

    articleUrl: {
      type: String,
      required: true,
      unique: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "general",
      index: true,
    },

    language: {
      type: String,
      default: "en",
      index: true,
    },

    country: {
      type: String,
      default: "in",
      index: true,
    },

    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },

    provider: {
      type: String,
      default: "gnews",
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    originalDescription: {
      type: String,
      default: "",
    },
    originalContent: {
      type: String,
      default: "",
    },
    originalLanguage: {
      type: String,
      default: "en",
    },
    translations: [
      {
        language: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        content: { type: String, default: "" },
      }
    ],
    isHoroscopeRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound index ────────────────────────────────────────────────────────────
// Covers every countDocuments + find query in the controller:
//   filter: { category, country }  sort: { publishedAt: -1 }
newsSchema.index(
  { category: 1, country: 1, publishedAt: -1 },
  { name: "category_country_publishedAt" }
);

newsSchema.index(
  { category: 1, country: 1, language: 1, publishedAt: -1 },
  { name: "category_country_language_publishedAt" }
);

newsSchema.index(
  { isHoroscopeRelated: 1, publishedAt: -1 },
  { name: "isHoroscopeRelated_publishedAt" }
);

// ─── NewsCursor Schema for cursor-based pagination ──────────────────────────────
const newsCursorSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cursor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mongoose.model("NewsCursor", newsCursorSchema);

module.exports = mongoose.model("News", newsSchema);