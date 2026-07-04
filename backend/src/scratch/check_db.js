const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/user.model");
const News = require("../models/news.model");

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        console.log("thirtyDaysAgo Date:", thirtyDaysAgo);

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
        console.log("userRegistrations aggregation result:", JSON.stringify(userRegistrations, null, 2));

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
        console.log("newsPublished aggregation result:", JSON.stringify(newsPublished, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
