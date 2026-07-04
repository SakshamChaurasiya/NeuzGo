import { useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const useTranslationStream = (language, onTranslated) => {
  useEffect(() => {
    if (!language || language === "en") return;

    const url = `${API_BASE_URL}/news/stream-translations?language=${language}`;
    console.log(`[SSE] Connecting to: ${url}`);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onTranslated) {
          onTranslated(data);
        }
      } catch (err) {
        console.error("[SSE] Failed to parse translation event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("[SSE] Connection error:", err);
    };

    return () => {
      eventSource.close();
      console.log(`[SSE] Disconnected from: ${url}`);
    };
  }, [language, onTranslated]);
};
