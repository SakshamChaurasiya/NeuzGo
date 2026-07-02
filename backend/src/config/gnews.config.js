const axios = require("axios");

const gnews = axios.create({
    baseURL: "https://gnews.io/api/v4",
    timeout: 10000,
    params: {
        apikey: process.env.GNEWS_API_KEY,
    },
    headers: {
        Accept: "application/json",
    },
});

module.exports = gnews;