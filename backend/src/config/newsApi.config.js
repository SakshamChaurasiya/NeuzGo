const axios = require("axios");

const newsApi = axios.create({
    baseURL: "https://newsapi.org/v2",
    timeout: 10000,
    params: {
        apiKey: process.env.NEWS_API_KEY,
    },
    headers: {
        Accept: "application/json",
    },
});

module.exports = newsApi;