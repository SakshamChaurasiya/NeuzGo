/**
 * seed-admin.js
 *
 * Promotes an existing user to admin or seeds a new admin user.
 * Usage:
 *   node scripts/seed-admin.js <email> [username] [phoneNumber] [password]
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/user.model");

async function seedAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log("❌ Error: Email is required.");
    console.log("Usage: node scripts/seed-admin.js <email> [username] [phoneNumber] [password]");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const username = process.argv[3] || "admin";
  const phoneNumber = process.argv[4] || "9999999999";
  const rawPassword = process.argv[5] || "admin123";

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing from environment variables.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    console.log(`ℹ️ User with email ${normalizedEmail} already exists. Promoting to admin...`);
    existingUser.role = "admin";
    await existingUser.save();
    console.log(`🎉 Success! User "${existingUser.username}" is now an admin.`);
  } else {
    console.log(`ℹ️ Creating new admin user with email ${normalizedEmail}...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newAdmin = new User({
      username: username.trim(),
      email: normalizedEmail,
      phoneNumber,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log(`🎉 Success! Created admin user "${username}" with password: "${rawPassword}".`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
