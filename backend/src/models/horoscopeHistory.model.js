const mongoose = require("mongoose");

const horoscopeHistorySchema = new mongoose.Schema(
  {
    sign: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    dateStr: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    date: {
      type: String, // e.g. "Saturday, July 4, 2026"
      required: true,
    },
    horoscope_data: {
      type: String,
      required: true,
    },
    lucky_number: {
      type: String,
    },
    lucky_color: {
      type: String,
    },
    compatibility: {
      type: String,
    },
    mood: {
      type: String,
    },
    is_fallback: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique entry per sign and dateStr
horoscopeHistorySchema.index({ sign: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model("HoroscopeHistory", horoscopeHistorySchema);
