class BaseTranslationProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Translates text to the target language.
   * @param {string} text 
   * @param {string} targetLang 
   * @param {string} sourceLang 
   * @returns {Promise<string>}
   */
  async translate(text, targetLang, sourceLang = "auto") {
    throw new Error("Method 'translate()' must be implemented");
  }
}

module.exports = BaseTranslationProvider;
