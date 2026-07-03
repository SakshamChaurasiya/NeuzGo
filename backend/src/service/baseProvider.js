class BaseProvider {
  constructor(name) {
    if (this.constructor === BaseProvider) {
      throw new Error("Cannot instantiate abstract class BaseProvider");
    }
    this.name = name;
  }

  /**
   * Fetch headlines from the provider and return them in normalized format.
   * @param {Object} params - Query parameters (page, limit, category, country, language, from, sortby)
   * @returns {Promise<Array & { nextPage?: string }>} Normalized articles list with optional nextPage cursor
   */
  async fetchTopHeadlines(params) {
    throw new Error(`fetchTopHeadlines() not implemented for provider "${this.name}"`);
  }
}

module.exports = BaseProvider;
