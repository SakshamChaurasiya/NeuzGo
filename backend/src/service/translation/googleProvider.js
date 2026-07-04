const BaseTranslationProvider = require("./baseProvider");
const axios = require("axios");
const { VALID_LANG_CODES } = require("./utils");

class GoogleProvider extends BaseTranslationProvider {
  constructor() {
    super("GoogleTranslate");
  }

  async translate(text, targetLang, sourceLang = "auto") {
    const sl = VALID_LANG_CODES.has(sourceLang) ? sourceLang : "auto";
    const url = "https://translate.googleapis.com/translate_a/single";
    const body = new URLSearchParams();
    body.append("client", "gtx");
    body.append("sl", sl);
    body.append("tl", targetLang);
    body.append("dt", "t");
    body.append("q", text);

    const response = await axios.post(url, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 2500,
    });

    if (response.data && Array.isArray(response.data[0])) {
      const translated = response.data[0]
        .map((segment) => segment && segment[0])
        .filter((val) => typeof val === "string")
        .join("");
      if (translated) {
        return translated;
      }
    }
    throw new Error("Invalid response format from Google Translate");
  }
}

module.exports = GoogleProvider;
