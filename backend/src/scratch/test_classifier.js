const { classifyText } = require("../service/horoscopeClassifier.service");

const testCases = [
  {
    title: "Daily Astrology reading",
    desc: "Check your tarot and birth chart predictions today.",
    expectedRelated: true
  },
  {
    title: "Meditation and spiritual healing",
    desc: "A guide to chakra balancing and manifest wellness.",
    expectedRelated: true // spiritual (3) + healing (3) + chakra (3) + meditation (3) + wellness (1) = 13 >= 5
  },
  {
    title: "My morning yoga routine",
    desc: "Self care and mindfulness practices for a positive day.",
    expectedRelated: false // yoga (1) + self care (1) + mindfulness (1) + positivity (1) = 4 < 5
  }
];

testCases.forEach((tc, idx) => {
  const result = classifyText(`${tc.title} ${tc.desc}`);
  console.log(`Test Case ${idx + 1}:`);
  console.log(`  Text: "${tc.title} - ${tc.desc}"`);
  console.log(`  Score: ${result.score}, Related: ${result.isRelated} (Expected: ${tc.expectedRelated})`);
  console.log(`  Tags: ${JSON.stringify(result.tags)}`);
  if (result.isRelated !== tc.expectedRelated) {
    console.error("❌ FAILED!");
  } else {
    console.log("✅ PASSED!");
  }
});
