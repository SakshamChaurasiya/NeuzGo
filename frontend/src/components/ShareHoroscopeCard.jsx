import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiShare2, FiDownload, FiLink, FiEye, FiX, FiCheck } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

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

const ShareHoroscopeCard = ({ selectedSign, horoscope }) => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const drawCard = () => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // 1. Background Gradient (Celestial Space theme)
        const gradient = ctx.createRadialGradient(540, 960, 100, 540, 960, 1100);
        gradient.addColorStop(0, "#1e1b4b"); // indigo-950
        gradient.addColorStop(0.5, "#0f172a"); // slate-900
        gradient.addColorStop(1, "#030712"); // gray-950
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);

        // 2. Cosmic elements: Orbit rings
        ctx.strokeStyle = "rgba(245, 158, 11, 0.15)"; // amber-500
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(540, 960, 420, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(99, 102, 241, 0.1)"; // indigo-500
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.arc(540, 960, 480, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // 3. Twinkling stars scattered
        const stars = [
          { x: 200, y: 300, r: 3, alpha: 0.8 },
          { x: 880, y: 250, r: 2, alpha: 0.5 },
          { x: 150, y: 700, r: 2.5, alpha: 0.6 },
          { x: 920, y: 800, r: 3.5, alpha: 0.9 },
          { x: 180, y: 1300, r: 2, alpha: 0.4 },
          { x: 900, y: 1450, r: 3, alpha: 0.75 },
          { x: 540, y: 220, r: 1.5, alpha: 0.3 },
          { x: 300, y: 1700, r: 2.5, alpha: 0.6 },
          { x: 780, y: 1750, r: 2, alpha: 0.5 },
        ];
        stars.forEach((star) => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();

          if (star.r > 2.8) {
            ctx.strokeStyle = `rgba(245, 158, 11, ${star.alpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(star.x - 10, star.y);
            ctx.lineTo(star.x + 10, star.y);
            ctx.moveTo(star.x, star.y - 10);
            ctx.lineTo(star.x, star.y + 10);
            ctx.stroke();
          }
        });

        // 4. Logo Branding (Top)
        ctx.fillStyle = "#f59e0b"; // amber-500
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦   N E U Z G O   ✦", 540, 180);

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "tracking-widest 18px sans-serif";
        ctx.fillText("DAILY CELESTIAL INSIGHTS", 540, 230);

        // 5. Centerpiece: Zodiac Symbol
        const signName = selectedSign.toUpperCase();
        const symbol = ZODIAC_SYMBOLS[selectedSign.toLowerCase()] || "✨";

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
        ctx.fillText(signName, 540, 660);

        ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(420, 720);
        ctx.lineTo(660, 720);
        ctx.stroke();

        const dateStr = horoscope?.date || new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "italic 32px serif";
        ctx.fillText(dateStr, 540, 785);

        // 6. Horoscope Reading Text
        const rawText = horoscope?.horoscope_data || "";
        const maxChars = 260;
        let readingText = rawText;
        if (rawText.length > maxChars) {
          readingText = rawText.substring(0, maxChars) + "...";
        }

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "italic 38px serif";
        ctx.textAlign = "center";

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

        // 7. Reading attributes
        let attrY = 1420;
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 26px sans-serif";
        const compatibilityText = horoscope?.compatibility ? `Compatibility: ${horoscope.compatibility}` : "";
        const luckyText = horoscope?.lucky_number ? `Lucky Number: ${horoscope.lucky_number}  |  Lucky Color: ${horoscope.lucky_color}` : "";

        if (compatibilityText) {
          ctx.fillText(compatibilityText, 540, attrY);
          attrY += 50;
        }
        if (luckyText) {
          ctx.fillText(luckyText, 540, attrY);
        }

        // 8. Footer Call-to-action
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.font = "26px sans-serif";
        ctx.fillText("Read your full horoscope reading on NeuzGo", 540, 1720);

        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    const toastId = toast.loading("Generating your share card...");

    try {
      const canvas = await drawCard();
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas blob conversion failed"))), "image/png");
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `neuzgo-${selectedSign}-horoscope.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Could not generate share card.", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // Generate public link URL
  const generatePublicLink = () => {
    const baseUrl = window.location.origin;
    const payload = {
      u: user?.name || "A NeuzGo Reader",
      s: selectedSign,
      d: horoscope?.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      t: horoscope?.horoscope_data || "",
      n: horoscope?.lucky_number || "",
      c: horoscope?.lucky_color || "",
      p: horoscope?.compatibility || "",
    };
    try {
      const jsonStr = JSON.stringify(payload);
      const token = btoa(unescape(encodeURIComponent(jsonStr)));
      return `${baseUrl}/shared-horoscope?card=${token}`;
    } catch (e) {
      console.error("Token encoding error:", e);
      return `${baseUrl}/shared-horoscope`;
    }
  };

  const handleShareLink = () => {
    const publicUrl = generatePublicLink();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Public link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const dateStr = horoscope?.date || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl hover:shadow-amber-500/20 border border-amber-400/25 active:scale-98"
      >
        <FiShare2 className="h-4 w-4" /> Share Reading
      </button>

      {showModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer"
        >
          {/* Modal Container */}
          <div className="bg-gradient-to-b from-charcoal-900 to-indigo-950/95 border border-indigo-500/20 rounded-3xl w-full max-w-4xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative text-white animate-fade-in-up cursor-default shadow-2xl">
            
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all p-2 rounded-full cursor-pointer z-10 border border-white/10 shadow-md"
              title="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>

            {/* Left: Premium Interactive Card Preview (View Card Option) */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-bold text-accent-amber uppercase tracking-widest mb-3 flex items-center gap-1.5 bg-accent-amber/10 px-3 py-1 rounded-full border border-accent-amber/20">
                <FiEye className="text-accent-amber" /> Live Card Preview
              </span>
              
              {/* Instagram story format mockup */}
              <div className="w-full max-w-[280px] aspect-[9/16] bg-gradient-to-b from-indigo-950 via-slate-900 to-black border-2 border-accent-amber/30 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center select-none">
                {/* Visual Orbit rings inside mock */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent-amber/5 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-indigo-500/10 border-dashed pointer-events-none animate-[celestialRotate_60s_linear_infinite]"></div>

                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-extrabold text-accent-amber tracking-widest uppercase block">✦ NEUZGO ✦</span>
                  <span className="text-[7px] font-semibold text-white/50 tracking-widest uppercase block">DAILY TRANSIT GUIDANCE</span>
                </div>

                <div className="my-auto py-4 space-y-4 z-10">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl text-accent-amber font-serif leading-none block transform hover:scale-110 transition-transform duration-300">
                      {ZODIAC_SYMBOLS[selectedSign.toLowerCase()] || "✨"}
                    </span>
                    <h4 className="text-xl font-serif font-black uppercase tracking-wider text-white mt-1">{selectedSign}</h4>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-accent-amber/50 to-transparent mx-auto"></div>
                    <p className="text-[9px] italic font-serif text-white/40">{dateStr}</p>
                  </div>

                  <p className="text-[11px] leading-relaxed font-serif font-light text-slate-200 italic px-2 line-clamp-6">
                    "{horoscope?.horoscope_data}"
                  </p>

                  <div className="text-[8px] space-y-0.5 text-white/70 font-medium bg-white/5 py-1.5 px-2 rounded-xl border border-white/5 inline-block mx-auto max-w-full">
                    {horoscope?.compatibility && <p>Compatibility: <span className="text-accent-amber font-bold">{horoscope.compatibility}</span></p>}
                    {horoscope?.lucky_number && <p>Lucky: {horoscope.lucky_number} | {horoscope.lucky_color}</p>}
                  </div>
                </div>

                <div className="text-[8px] text-white/20 tracking-wide z-10">
                  Read full reading on NeuzGo app
                </div>
              </div>
            </div>

            {/* Right: Actions Selection */}
            <div className="flex-1 flex flex-col justify-between space-y-6 md:py-4">
              <div>
                <h3 className="font-serif text-2xl font-black text-white">Share Your Cosmic Reading</h3>
                <p className="text-sm text-white/60 mt-1">
                  Choose how you want to share your Daily Transit reading for <span className="text-accent-amber font-bold">{selectedSign.toUpperCase()}</span>.
                </p>
              </div>

              <div className="space-y-4">
                {/* Option 1: Download Card */}
                <button
                  onClick={handleDownload}
                  disabled={generating}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                      <FiDownload className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-sm block text-white">Download Your Card</span>
                      <span className="text-xs text-white/50 block mt-0.5">Save as high-resolution Instagram Story PNG</span>
                    </div>
                  </div>
                </button>

                {/* Option 2: Share via Link */}
                <button
                  onClick={handleShareLink}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                      {copied ? <FiCheck className="h-5 w-5 text-green-400" /> : <FiLink className="h-5 w-5" />}
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-sm block text-white">Share via Link</span>
                      <span className="text-xs text-white/50 block mt-0.5">Generate a public URL to show your friends</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                {/* Secondary Actions: Close Modal */}
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Close Preview
                </button>

                <div className="pt-2 border-t border-white/10 text-[10px] text-white/40 flex justify-between">
                  <span>Format: 1080x1920px PNG</span>
                  <span>Powered by NeuzGo</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ShareHoroscopeCard;
