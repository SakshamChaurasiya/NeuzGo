import React, { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  TbZodiacAries,
  TbZodiacTaurus,
  TbZodiacGemini,
  TbZodiacCancer,
  TbZodiacLeo,
  TbZodiacVirgo,
  TbZodiacLibra,
  TbZodiacScorpio,
  TbZodiacSagittarius,
  TbZodiacCapricorn,
  TbZodiacAquarius,
  TbZodiacPisces
} from "react-icons/tb";
import { FiDownload, FiCompass, FiActivity, FiHeart, FiSmile } from "react-icons/fi";

const ZODIAC_ICONS = {
  aries: TbZodiacAries,
  taurus: TbZodiacTaurus,
  gemini: TbZodiacGemini,
  cancer: TbZodiacCancer,
  leo: TbZodiacLeo,
  virgo: TbZodiacVirgo,
  libra: TbZodiacLibra,
  scorpio: TbZodiacScorpio,
  sagittarius: TbZodiacSagittarius,
  capricorn: TbZodiacCapricorn,
  aquarius: TbZodiacAquarius,
  pisces: TbZodiacPisces,
};

const ZODIAC_SYMBOLS = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

const SharedHoroscope = () => {
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);

  const cardToken = searchParams.get("card") || "";
  let sign = "aries";
  let text = "";
  let date = "";
  let luckyNumber = "";
  let luckyColor = "";
  let compatibility = "";
  let sharedByUser = "A NeuzGo Reader";

  if (cardToken) {
    try {
      const decodedStr = decodeURIComponent(escape(atob(cardToken)));
      const payload = JSON.parse(decodedStr);
      sharedByUser = payload.u || "A NeuzGo Reader";
      sign = payload.s || "aries";
      date = payload.d || "";
      text = payload.t || "";
      luckyNumber = payload.n || "";
      luckyColor = payload.c || "";
      compatibility = payload.p || "";
    } catch (e) {
      console.error("Token decoding error:", e);
    }
  }

  const ZodiacIcon = ZODIAC_ICONS[sign.toLowerCase()] || TbZodiacAries;
  const symbol = ZODIAC_SYMBOLS[sign.toLowerCase()] || "✨";

  // Function to draw card for download
  const handleDownload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // 1. Background Gradient
      const gradient = ctx.createRadialGradient(540, 960, 100, 540, 960, 1100);
      gradient.addColorStop(0, "#1e1b4b");
      gradient.addColorStop(0.5, "#0f172a");
      gradient.addColorStop(1, "#030712");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Orbit rings
      ctx.strokeStyle = "rgba(245, 158, 11, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(540, 960, 420, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.arc(540, 960, 480, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Twinkling stars
      const stars = [
        { x: 200, y: 300, r: 3, alpha: 0.8 },
        { x: 880, y: 250, r: 2, alpha: 0.5 },
        { x: 150, y: 700, r: 2.5, alpha: 0.6 },
        { x: 920, y: 800, r: 3.5, alpha: 0.9 },
        { x: 180, y: 1300, r: 2, alpha: 0.4 },
        { x: 900, y: 1450, r: 3, alpha: 0.75 },
      ];
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Logo Branding
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦   N E U Z G O   ✦", 540, 180);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "18px sans-serif";
      ctx.fillText("DAILY CELESTIAL INSIGHTS", 540, 230);

      // 5. Centerpiece
      const radGlow = ctx.createRadialGradient(540, 520, 10, 540, 520, 180);
      radGlow.addColorStop(0, "rgba(99, 102, 241, 0.2)");
      radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(540, 520, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "160px serif";
      ctx.fillText(symbol, 540, 510);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px serif";
      ctx.fillText(sign.toUpperCase(), 540, 660);

      ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(420, 720);
      ctx.lineTo(660, 720);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "italic 32px serif";
      ctx.fillText(date, 540, 785);

      // 6. Text
      const maxChars = 260;
      const readingText = text.length > maxChars ? text.substring(0, maxChars) + "..." : text;

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "italic 38px serif";

      const words = readingText.split(" ");
      let line = "";
      const lines = [];
      const maxWidth = 760;
      const lineHeight = 58;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      let startY = 1040 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((lineText) => {
        ctx.fillText(lineText.trim(), 540, startY);
        startY += lineHeight;
      });

      // 7. Attributes
      let attrY = 1420;
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 26px sans-serif";
      if (compatibility) {
        ctx.fillText(`Compatibility: ${compatibility}`, 540, attrY);
        attrY += 50;
      }
      if (luckyNumber && luckyColor) {
        ctx.fillText(`Lucky Number: ${luckyNumber}  |  Lucky Color: ${luckyColor}`, 540, attrY);
      }

      // 8. Footer
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "26px sans-serif";
      ctx.fillText("Read your full horoscope reading on NeuzGo", 540, 1720);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `neuzgo-${sign}-horoscope.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="z-10 w-full max-w-lg flex justify-between items-center pb-6 border-b border-indigo-900/30">
        <Link to="/" className="font-serif text-2xl font-black text-white hover:text-accent-amber transition-colors">
          ✦ NeuzGo
        </Link>
        <Link to="/signup" className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-md">
          Get Your Reading
        </Link>
      </header>

      {/* Main Content Card Preview */}
      <main className="z-10 w-full max-w-md my-8 flex flex-col items-center">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-accent-amber uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
            ✨ {sharedByUser} shared this card
          </span>
        </div>
        {/* Card Mockup representing the 1080x1920 layout proportionally */}
        <div className="w-full aspect-[9/16] bg-gradient-to-b from-indigo-950 via-slate-900 to-black border-2 border-accent-amber/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none"></div>
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-accent-amber tracking-widest uppercase block">✦ NEUZGO ✦</span>
            <span className="text-[8px] font-semibold text-white/40 tracking-wider uppercase block">Daily Celestial Insights</span>
          </div>

          <div className="my-auto py-4 space-y-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl text-amber-400 font-serif leading-none block">{symbol}</span>
              <h2 className="text-2xl font-serif font-black uppercase tracking-wide text-white">{sign}</h2>
              <div className="w-24 h-0.5 bg-amber-500/30 mx-auto"></div>
              <p className="text-[11px] italic font-serif text-white/60">{date}</p>
            </div>

            <p className="text-sm md:text-base leading-relaxed font-serif font-light text-slate-200 italic px-2">
              "{text}"
            </p>

            <div className="text-[10px] space-y-1 text-white/80 font-medium">
              {compatibility && <p>Compatibility: <span className="text-amber-300 font-bold">{compatibility}</span></p>}
              {luckyNumber && <p>Lucky Number: {luckyNumber} | Color: {luckyColor}</p>}
            </div>
          </div>

          <div className="text-[9px] text-white/30 tracking-wide">
            Read your full horoscope reading on NeuzGo
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer hover:shadow-lg active:scale-98"
        >
          <FiDownload className="h-4 w-4" /> Download Card
        </button>
      </main>

      {/* Footer */}
      <footer className="z-10 text-center text-xs text-white/40 pt-6 border-t border-indigo-900/20 w-full max-w-lg">
        &copy; {new Date().getFullYear()} NeuzGo. All rights reserved.
      </footer>
    </div>
  );
};

export default SharedHoroscope;
