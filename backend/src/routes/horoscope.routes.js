const express = require("express");
const { getDailyHoroscope } = require("../controllers/horoscope.controller");

const router = express.Router();

/**
 * GET /api/horoscope/:sign
 */
router.get("/:sign", getDailyHoroscope);

module.exports = router;
