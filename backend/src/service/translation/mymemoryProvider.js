const BaseTranslationProvider = require("./baseProvider");
const axios = require("axios");
const { VALID_LANG_CODES } = require("./utils");

class MyMemoryProvider extends BaseTranslationProvider {
  constructor() {
    super("MyMemory");
  }

  async translate(text, targetLang, sourceLang = "auto") {
    const sl = sourceLang === "auto" || !VALID_LANG_CODES.has(sourceLang) ? "en" : sourceLang;
    const url = "https://api.mymemory.translated.net/get";
    const response = await axios.get(url, {
      params: {
        q: text,
        langpair: `${sl}|${targetLang}`,
      },
      timeout: 2000,
    });

    if (response.data && response.data.responseData) {
      const result = response.data.responseData.translatedText;
      if (result) {
        return result;
      }
    }
    throw new Error("Invalid response format from MyMemory");
  }
}

module.exports = MyMemoryProvider;
