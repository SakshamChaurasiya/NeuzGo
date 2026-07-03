const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const connectDB = require("./config/db");
const newsRoutes = require("./routes/news.routes");
const authRoutes = require("./routes/auth.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const horoscopeRoutes = require("./routes/horoscope.routes");
const { initCron } = require("./config/cron");

const app = express();
app.use(express.json());

// Enable CORS for frontend applications
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

connectDB();
initCron();

const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/horoscope", horoscopeRoutes);

app.listen(PORT, () => {
    console.log(`App is listening on PORT: ${PORT}`);
});
