const mongoose = require("mongoose");
const db = require("../config/db"); // assuming this connects to DB
const translationService = require("../service/translation.service");

async function run() {
  console.log("Testing translation.service.js...");
  const translated = await translationService.translateText("Hello World", "hi");
  console.log("Translation Result (Hello World -> Hindi):", translated);
  
  if (translated === "नमस्ते दुनिया" || translated.includes("नमस्ते")) {
    console.log("✅ Translation service test PASSED!");
  } else {
    console.log("❌ Translation service test FAILED or fallback occurred.");
  }
}

run();
