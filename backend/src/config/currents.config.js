const axios = require("axios");

const currents = axios.create({
  baseURL: "https://api.currentsapi.services/v1",
  timeout: 15000,
  params: {
    apiKey: process.env.CURRENTS_API_KEY,
  },
  headers: {
    Accept: "application/json",
  },
});

module.exports = currents;
