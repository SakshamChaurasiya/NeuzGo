const { URL } = require("url");

/**
 * Normalizes a URL by removing trailing slashes, protocol prefixes (http://, https://, www.),
 * and tracking query parameters (e.g. utm_source, etc.).
 * @param {string} url 
 * @returns {string} Cleaned URL
 */
function normalizeUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const trackers = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid"];
    trackers.forEach(param => parsed.searchParams.delete(param));
    
    let normalized = parsed.hostname.replace(/^www\./i, "") + parsed.pathname + parsed.search;
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase().trim();
  } catch (e) {
    let clean = url.replace(/^(https?:\/\/)?(www\.)?/i, "").split("?")[0];
    if (clean.endsWith("/")) clean = clean.slice(0, -1);
    return clean.toLowerCase().trim();
  }
}

/**
 * Normalizes a title by lowercasing and removing non-alphanumeric characters and whitespace.
 * @param {string} title 
 * @returns {string} Normalized alphanumeric title
 */
function normalizeTitle(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "")
    .trim();
}

/**
 * Deduplicates a list of articles in-memory by checking URLs and titles against each other.
 * @param {Array} articles - Array of normalized article objects
 * @returns {Array} List of unique articles
 */
function deduplicateInMemory(articles) {
  const uniqueArticles = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  for (const article of articles) {
    const normUrl = normalizeUrl(article.articleUrl);
    const normTitle = normalizeTitle(article.title);

    if (seenUrls.has(normUrl) || (normTitle && seenTitles.has(normTitle))) {
      continue;
    }

    seenUrls.add(normUrl);
    if (normTitle) {
      seenTitles.add(normTitle);
    }
    uniqueArticles.push(article);
  }

  return uniqueArticles;
}

module.exports = {
  normalizeUrl,
  normalizeTitle,
  deduplicateInMemory,
};
