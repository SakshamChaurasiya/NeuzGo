require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const News = require("../models/news.model");

async function checkArticles() {
  await connectDB();
  const count = await News.countDocuments({ isHoroscopeRelated: true });
  console.log(`Number of horoscope-related articles: ${count}`);

  if (count > 0) {
    const samples = await News.find({ isHoroscopeRelated: true }).limit(3).lean();
    samples.forEach((art, idx) => {
      console.log(`\nSample ${idx + 1}:`);
      console.log(`  Title: ${art.title}`);
      console.log(`  Tags: ${JSON.stringify(art.tags)}`);
      console.log(`  isHoroscopeRelated: ${art.isHoroscopeRelated}`);
    });
  }
  mongoose.disconnect();
}

checkArticles().catch(console.error);
