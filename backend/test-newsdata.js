require("dotenv").config();
const axios = require("axios");

const apiKey = process.env.NEWSDATA_API_KEY;

if (!apiKey || apiKey === "YOUR_NEWSDATA_API_KEY") {
    console.error("❌ Error: NEWSDATA_API_KEY is not defined (or is still the placeholder) in your backend/.env file.");
    process.exit(1);
}

console.log(`🔑 Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

const country = process.argv[2] || "in";
console.log(`🌍 Testing NewsData.io with country: "${country}" (You can change this by running: node test-newsdata.js <country_code>)`);

async function testRawNewsData() {
    console.log("\n--- Testing Raw NewsData.io Request ---");
    try {
        const url = "https://newsdata.io/api/1/latest";
        const params = {
            apikey: apiKey,
            country: country,
            category: "top",
            size: 5
        };
        
        console.log(`GET ${url} with params:`, { ...params, apikey: "***" });
        
        const response = await axios.get(url, { params, timeout: 10000 });
        
        console.log("✅ Success!");
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Total Results: ${response.data.totalResults}`);
        console.log(`Results Returned: ${response.data.results ? response.data.results.length : 0}`);
        
        if (response.data.results && response.data.results.length > 0) {
            console.log("\nSample Article Data (First Article):");
            console.log(JSON.stringify(response.data.results[0], null, 2));
        } else {
            console.log("⚠️ No articles returned for this country/category combination.");
        }
    } catch (error) {
        console.error("❌ Raw NewsData.io Request Failed!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

async function testServiceNewsData() {
    console.log("\n--- Testing NewsData.io Service (With Normalization) ---");
    try {
        const newsDataService = require("./src/service/newsdata.service");
        
        console.log("Calling newsDataService.fetchTopHeadlines...");
        const normalizedArticles = await newsDataService.fetchTopHeadlines({
            page: 1,
            limit: 5,
            category: "general",
            country: country,
            language: "en"
        });
        
        console.log("✅ Success!");
        console.log(`Articles Normalized: ${normalizedArticles.length}`);
        
        if (normalizedArticles.length > 0) {
            console.log("\nSample Normalized Article Data (First Article):");
            console.log(JSON.stringify(normalizedArticles[0], null, 2));
        } else {
            console.log("⚠️ No articles normalized.");
        }
    } catch (error) {
        console.error("❌ NewsData.io Service Failed!");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.stack || error.message);
        }
    }
}

async function run() {
    await testRawNewsData();
    await testServiceNewsData();
}

run();
