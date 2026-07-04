const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/user.model");

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, "username email role");
        console.log("Users:", JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
