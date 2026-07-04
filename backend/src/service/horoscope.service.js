const axios = require("axios");
const HoroscopeHistory = require("../models/horoscopeHistory.model");

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

  // 2. Check Database Cache
  try {
    const dbEntry = await HoroscopeHistory.findOne({ sign: normalizedSign, dateStr: todayStr });
    if (dbEntry) {
      console.log(`[Horoscope DB] 🎯 Hit for ${normalizedSign} on ${todayStr}`);
      const formatted = {
        date: dbEntry.date,
        horoscope_data: dbEntry.horoscope_data,
        lucky_number: dbEntry.lucky_number,
        lucky_color: dbEntry.lucky_color,
        compatibility: dbEntry.compatibility,
        mood: dbEntry.mood,
        is_fallback: dbEntry.is_fallback
      };
      cache.set(cacheKey, formatted);
      return formatted;
    }
  } catch (dbErr) {
    console.error(`[Horoscope DB] Error reading:`, dbErr.message);
  }

  // 3. Fetch from External API
  let result;
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

      result = {
        date: apiData.date || new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        horoscope_data: horoscopeText,
        lucky_number: luckyNumbers[seed % luckyNumbers.length].toString(),
        lucky_color: luckyColors[seed % luckyColors.length],
        compatibility: compatibilities[seed % compatibilities.length],
        mood: moods[seed % moods.length],
        is_fallback: false
      };
    } else {
      throw new Error("Empty response or missing horoscope text from API");
    }
  } catch (error) {
    console.error(`[Horoscope API] ⚠️ Failure fetching for ${normalizedSign}: ${error.message}. Serving fallback.`);
    // Generate deterministic fallback
    result = generateFallbackHoroscope(normalizedSign, todayStr);
  }

  // Save to DB and set in memory cache
  try {
    await HoroscopeHistory.updateOne(
      { sign: normalizedSign, dateStr: todayStr },
      {
        $set: {
          date: result.date,
          horoscope_data: result.horoscope_data,
          lucky_number: result.lucky_number,
          lucky_color: result.lucky_color,
          compatibility: result.compatibility,
          mood: result.mood,
          is_fallback: result.is_fallback
        }
      },
      { upsert: true }
    );
  } catch (dbErr) {
    console.error(`[Horoscope DB] Error saving:`, dbErr.message);
  }

  cache.set(cacheKey, result);
  return result;
}

/**
 * Fetches the horoscope history for the specified sign and range of days
 * @param {string} sign
 * @param {number} days
 * @returns {Promise<Array>}
 */
async function getHoroscopeHistoryForRange(sign, days) {
  const normalizedSign = sign.toLowerCase().trim();
  if (!VALID_SIGNS.has(normalizedSign)) {
    throw new Error(`Invalid zodiac sign: ${sign}`);
  }

  // Get past N date strings
  const pastDates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    pastDates.push(formatter.format(d));
  }

  // Find existing history entries from DB
  const existingEntries = await HoroscopeHistory.find({
    sign: normalizedSign,
    dateStr: { $in: pastDates }
  });

  const entryMap = new Map();
  existingEntries.forEach(entry => {
    entryMap.set(entry.dateStr, entry);
  });

  // Construct results in chronological order or reverse chronological order. Let's return them starting from today (reverse chronological).
  const results = [];
  const toInsert = [];

  for (const dateStr of pastDates) {
    if (entryMap.has(dateStr)) {
      const entry = entryMap.get(dateStr);
      results.push({
        dateStr: entry.dateStr,
        date: entry.date,
        horoscope_data: entry.horoscope_data,
        lucky_number: entry.lucky_number,
        lucky_color: entry.lucky_color,
        compatibility: entry.compatibility,
        mood: entry.mood,
        is_fallback: entry.is_fallback
      });
    } else {
      // Deterministically generate a premium entry for the missing day
      // So that the user has immediate data
      const dayNum = parseInt(dateStr.split("-")[2], 10) || 1;
      const seed = (normalizedSign.charCodeAt(0) + normalizedSign.length + dayNum) % 5;
      
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

      // Parse dateStr to generate readable date
      const dateParts = dateStr.split("-");
      const tempDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const readableDate = tempDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

      const newEntry = {
        dateStr,
        date: readableDate,
        horoscope_data: readings[seed % readings.length],
        lucky_number: luckyNumbers[seed % luckyNumbers.length].toString(),
        lucky_color: luckyColors[seed % luckyColors.length],
        compatibility: compatibilities[seed % compatibilities.length],
        mood: moods[seed % moods.length],
        is_fallback: true
      };

      toInsert.push({
        sign: normalizedSign,
        ...newEntry
      });
      results.push(newEntry);
    }
  }

  // Await batch insert of any new mock readings to avoid connection closed issues or missing history
  if (toInsert.length > 0) {
    try {
      await HoroscopeHistory.insertMany(toInsert, { ordered: false });
    } catch (err) {
      // Ignore duplicate keys (code 11000)
      if (err.code !== 11000) {
        console.error("Error backfilling horoscope history:", err.message);
      }
    }
  }

  return results;
}

module.exports = {
  getDailyHoroscope,
  getHoroscopeHistoryForRange,
  VALID_SIGNS
};
