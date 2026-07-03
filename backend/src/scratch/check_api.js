const axios = require("axios");

async function checkApi() {
  try {
    const url = "https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=aries&day=today";
    console.log("Fetching url:", url);
    const res = await axios.get(url);
    console.log("Status:", res.status);
    console.log("Headers:", res.headers);
    console.log("Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

checkApi();
