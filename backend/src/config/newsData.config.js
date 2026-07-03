const axios = require("axios");

const newsData = axios.create({
    baseURL: "https://newsdata.io/api/1",
    timeout: 15000,
    params: {
        apikey: process.env.NEWSDATA_API_KEY,
    },
    headers: {
        Accept: "application/json",
    },
});

module.exports = newsData;
