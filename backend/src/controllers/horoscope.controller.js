const horoscopeService = require("../service/horoscope.service");

/**
 * GET /api/horoscope/history
 * Returns historical horoscope readings for the user's sign.
 */
const getHoroscopeHistory = async (req, res) => {
  try {
    const range = req.query.range || "week"; // "week" or "month"
    const sign = req.query.sign || req.user?.zodiacSign || "aries";

    const normalizedSign = sign.toLowerCase().trim();
    if (!horoscopeService.VALID_SIGNS.has(normalizedSign)) {
      return res.status(400).json({
        success: false,
        message: `Invalid zodiac sign: ${sign}. Must be one of: ${Array.from(horoscopeService.VALID_SIGNS).join(", ")}`
      });
    }

    const days = range === "month" ? 30 : 7;
    const history = await horoscopeService.getHoroscopeHistoryForRange(normalizedSign, days);

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("[Horoscope Controller] ❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrieving horoscope history."
    });
  }
};

/**
 * GET /api/horoscope/:sign
 * Returns daily horoscope details for the specified zodiac sign.
 */
const getDailyHoroscope = async (req, res) => {
  try {
    const { sign } = req.params;

    if (!sign) {
      return res.status(400).json({
        success: false,
        message: "Zodiac sign parameter is required"
      });
    }

    const normalizedSign = sign.toLowerCase().trim();
    if (!horoscopeService.VALID_SIGNS.has(normalizedSign)) {
      return res.status(400).json({
        success: false,
        message: `Invalid zodiac sign: ${sign}. Must be one of: ${Array.from(horoscopeService.VALID_SIGNS).join(", ")}`
      });
    }

    const data = await horoscopeService.getDailyHoroscope(normalizedSign);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("[Horoscope Controller] ❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while retrieving horoscope data."
    });
  }
};

module.exports = {
  getDailyHoroscope,
  getHoroscopeHistory
};
