const express = require("express");
const { getDailyHoroscope, getHoroscopeHistory } = require("../controllers/horoscope.controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * GET /api/horoscope/history
 */
router.get("/history", protect, getHoroscopeHistory);

/**
 * GET /api/horoscope/:sign
 */
router.get("/:sign", getDailyHoroscope);

module.exports = router;
