const axios = require("axios");

// Simple in-memory cache dictionary
// Keys are formatted as: "sign_YYYY-MM-DD"
const cache = new Map();

const VALID_SIGNS = new Set([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
]);

/**
 * Gets the current date string in YYYY-MM-DD format (IST timezone)
 * @returns {string}
 */
function getTodayDateString() {
  const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
  const formatter = new Intl.DateTimeFormat("en-CA", options);
  return formatter.format(new Date()); // Returns YYYY-MM-DD
}

/**
 * Deterministically generates a premium fallback daily horoscope when the API fails
 * @param {string} sign 
 * @param {string} dateStr 
 * @returns {Object}
 */
function generateFallbackHoroscope(sign, dateStr) {
  // Simple deterministic seed based on sign name length and the day number
  const dayNum = parseInt(dateStr.split("-")[2], 10) || 1;
  const seed = (sign.charCodeAt(0) + sign.length + dayNum) % 5;

  const readings = [
    "Today brings a wave of positive energy. Focus on communication and connection. An unexpected conversation could open new doors for your personal projects.",
    "A day to trust your instincts. The planetary alignment encourages self-reflection and grounding. Take time to organize your thoughts and prioritize your well-being.",
    "Opportunities for collaboration are highlighted today. Your creative expression is at its peak. Share your ideas confidently, as others are ready to support you.",
    "Balance is your key theme today. Ensure you divide your energy equally between work commitments and personal relations. A peaceful evening awaits you.",
    "Dynamic energies are guiding your career and financial plans today. Take calculated risks and trust in your long-term vision. Success is well within your grasp."
  ];

  const luckyNumbers = [3, 7, 9, 11, 22, 5, 8, 14];
  const luckyColors = ["Crimson Red", "Royal Blue", "Emerald Green", "Amber Gold", "Deep Violet", "Silver Grey"];
  const compatibilities = ["Leo", "Libra", "Aries", "Taurus", "Gemini", "Cancer", "Scorpio", "Sagittarius", "Virgo", "Pisces"];
  const moods = ["Optimistic", "Reflective", "Energetic", "Harmonious", "Ambitious"];

  return {
    date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    horoscope_data: readings[seed % readings.length],
    lucky_number: luckyNumbers[seed % luckyNumbers.length].toString(),
    lucky_color: luckyColors[seed % luckyColors.length],
    compatibility: compatibilities[seed % compatibilities.length],
    mood: moods[seed % moods.length],
    is_fallback: true
  };
}

/**
 * Fetches daily horoscope for a given sign, utilizing local caching.
 * @param {string} sign - Zodiac sign (case insensitive)
 * @returns {Promise<Object>}
 */
async function getDailyHoroscope(sign) {
  const normalizedSign = sign.toLowerCase().trim();
  if (!VALID_SIGNS.has(normalizedSign)) {
    throw new Error(`Invalid zodiac sign: ${sign}`);
  }

  const todayStr = getTodayDateString();
  const cacheKey = `${normalizedSign}_${todayStr}`;

  // 1. Check in-memory cache
  if (cache.has(cacheKey)) {
    console.log(`[Horoscope Cache] 🎯 Hit for ${cacheKey}`);
    return cache.get(cacheKey);
  }

  // Periodic cleanup of yesterday's cache entries to prevent memory growth
  for (const key of cache.keys()) {
    if (!key.endsWith(todayStr)) {
      cache.delete(key);
    }
  }

  // 2. Fetch from External API
  try {
    console.log(`[Horoscope API] 📡 Fetching daily horoscope for: ${normalizedSign}`);
    const response = await axios.get("https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily", {
      params: { sign: normalizedSign, day: "today" },
      timeout: 6000 // 6 seconds timeout
    });

    const apiData = response.data?.data;
    const horoscopeText = apiData?.horoscope || apiData?.horoscope_data;

    if (apiData && horoscopeText) {
      // Deterministically generate secondary fields that the API doesn't provide
      const dayNum = parseInt(todayStr.split("-")[2], 10) || 1;
      const seed = (normalizedSign.charCodeAt(0) + normalizedSign.length + dayNum) % 5;

      const luckyNumbers = [3, 7, 9, 11, 22, 5, 8, 14];
      const luckyColors = ["Crimson Red", "Royal Blue", "Emerald Green", "Amber Gold", "Deep Violet", "Silver Grey"];
      const compatibilities = ["Leo", "Libra", "Aries", "Taurus", "Gemini", "Cancer", "Scorpio", "Sagittarius", "Virgo", "Pisces"];
      const moods = ["Optimistic", "Reflective", "Energetic", "Harmonious", "Ambitious"];

      const formattedResult = {
        date: apiData.date || new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        horoscope_data: horoscopeText,
        lucky_number: luckyNumbers[seed % luckyNumbers.length].toString(),
        lucky_color: luckyColors[seed % luckyColors.length],
        compatibility: compatibilities[seed % compatibilities.length],
        mood: moods[seed % moods.length],
        is_fallback: false
      };
      
      cache.set(cacheKey, formattedResult);
      return formattedResult;
    } else {
      throw new Error("Empty response or missing horoscope text from API");
    }
  } catch (error) {
    console.error(`[Horoscope API] ⚠️ Failure fetching for ${normalizedSign}: ${error.message}. Serving fallback.`);
    // Generate deterministic fallback
    const fallback = generateFallbackHoroscope(normalizedSign, todayStr);
    // Cache the fallback for the day so we don't flood failing API endpoints repeatedly
    cache.set(cacheKey, fallback);
    return fallback;
  }
}

module.exports = {
  getDailyHoroscope,
  VALID_SIGNS
};
