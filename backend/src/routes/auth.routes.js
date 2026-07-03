const express = require("express");
const { signup, login, getMe, updateZodiac } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

// Route for getting currently authenticated user profile
router.get("/me", protect, getMe);

// Route for updating zodiac sign preference
router.put("/zodiac", protect, updateZodiac);

module.exports = router;
