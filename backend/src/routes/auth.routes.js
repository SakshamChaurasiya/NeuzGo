const express = require("express");
const { signup, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

// Route for getting currently authenticated user profile
router.get("/me", protect, getMe);

module.exports = router;
