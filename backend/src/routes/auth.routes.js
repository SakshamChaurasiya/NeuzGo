const express = require("express");
const { signup, login } = require("../controllers/auth.controller");

const router = express.Router();

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

module.exports = router;
