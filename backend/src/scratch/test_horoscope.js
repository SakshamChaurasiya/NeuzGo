const { getDailyHoroscope } = require("../service/horoscope.service");

async function runTests() {
  console.log("Starting daily horoscope service tests...");

  // Test 1: Fetching Aries
  console.log("\n--- Test 1: Fetch Aries ---");
  const aries = await getDailyHoroscope("aries");
  console.log("Result:", aries);

  // Test 2: Fetching Aries again (should hit cache)
  console.log("\n--- Test 2: Fetch Aries again (cache hit check) ---");
  const ariesCached = await getDailyHoroscope("aries");
  console.log("Result:", ariesCached);

  // Test 3: Fetching invalid sign (should error)
  console.log("\n--- Test 3: Invalid Sign ---");
  try {
    await getDailyHoroscope("invalid_sign");
    console.error("❌ Test failed: allowed invalid sign");
  } catch (err) {
    console.log("✅ Correctly rejected invalid sign:", err.message);
  }

  console.log("\nAll service tests completed.");
}

runTests().catch(console.error);
