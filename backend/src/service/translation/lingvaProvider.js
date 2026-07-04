const BaseTranslationProvider = require("./baseProvider");
const axios = require("axios");
const { VALID_LANG_CODES } = require("./utils");

class LingvaProvider extends BaseTranslationProvider {
  constructor() {
    super("Lingva");
  }

  async translate(text, targetLang, sourceLang = "auto") {
    const sl = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";
    const url = `https://lingva.ml/api/v1/${sl}/${targetLang}/${encodeURIComponent(text)}`;
    
    const response = await axios.get(url, {
      timeout: 2500,
    });

    if (response.data && response.data.translation) {
      return response.data.translation;
    }
    throw new Error("Invalid response format from Lingva Translate");
  }
}

module.exports = LingvaProvider;
