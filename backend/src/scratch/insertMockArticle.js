require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const News = require("../models/news.model");

async function insertMock() {
  await connectDB();

  const mockArticle = {
    title: "Cosmic Alignments: How the Retrograde Will Affect Your Sign Today",
    description: "An in-depth look at planetary movements, birth charts, and zodiac sign predictions for this month's transit.",
    content: "Detailed insights into astrology and tarot readings for Leo, Aries, Libra, and other signs during the planetary shift.",
    author: "Stella Cosmos",
    source: {
      name: "The Cosmic Tribune",
      url: "https://example.com/cosmic-tribune"
    },
    articleUrl: "https://example.com/mock-horoscope-article-1",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
    category: "general",
    country: "in",
    language: "en",
    publishedAt: new Date(),
    isHoroscopeRelated: true,
    tags: ["horoscope", "astrology", "planetary", "retrograde"]
  };

  try {
    await News.updateOne(
      { articleUrl: mockArticle.articleUrl },
      { $set: mockArticle },
      { upsert: true }
    );
    console.log("Mock horoscope article upserted successfully!");
  } catch (error) {
    console.error("Upsert failed:", error.message);
  }

  mongoose.disconnect();
}

insertMock().catch(console.error);
