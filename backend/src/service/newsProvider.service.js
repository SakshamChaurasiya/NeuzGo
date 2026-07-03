const providerManager = require("./providerManager.service");

function activateRateLimitBackoff() {
  providerManager.activateRateLimitBackoff("gnews");
}

function isGNewsRateLimited() {
  return providerManager.isProviderRateLimited("gnews");
}

const fetchTopHeadlines = async (params) => {
  return providerManager.fetchArticles(params);
};

module.exports = {
  fetchTopHeadlines,
  isGNewsRateLimited,
  activateRateLimitBackoff,
};
