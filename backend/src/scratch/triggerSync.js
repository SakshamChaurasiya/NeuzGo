const axios = require("axios");

async function triggerSync() {
  console.log("Triggering manual sync...");
  try {
    const response = await axios.post("http://localhost:8001/api/news/sync");
    console.log("Sync response:", response.data);
  } catch (error) {
    console.error("Sync trigger failed:", error.message);
  }
}

triggerSync();
