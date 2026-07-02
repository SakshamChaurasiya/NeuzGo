const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const connectDB = require("./config/db");
const newsRoutes = require("./routes/news.routes");
const authRoutes = require("./routes/auth.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const { initCron } = require("./config/cron");

const app = express();
app.use(express.json());
connectDB();
initCron();

const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

app.listen(PORT, () => {
    console.log(`App is listening on PORT: ${PORT}`);
});
