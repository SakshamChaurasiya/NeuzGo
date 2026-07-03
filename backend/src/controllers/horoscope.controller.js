const horoscopeService = require("../service/horoscope.service");

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
  getDailyHoroscope
};
