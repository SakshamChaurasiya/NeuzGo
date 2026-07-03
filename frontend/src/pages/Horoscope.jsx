import React, { useEffect, useState } from "react";
import { FiCalendar, FiArrowRight, FiActivity, FiSmile, FiCompass, FiHeart } from "react-icons/fi";
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
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { useAuth } from "../contexts/AuthContext";

const ZODIAC_SIGNS = [
  { id: "aries", name: "Aries", symbol: "♈", icon: TbZodiacAries, dateRange: "Mar 21 - Apr 19" },
  { id: "taurus", name: "Taurus", symbol: "♉", icon: TbZodiacTaurus, dateRange: "Apr 20 - May 20" },
  { id: "gemini", name: "Gemini", symbol: "♊", icon: TbZodiacGemini, dateRange: "May 21 - Jun 20" },
  { id: "cancer", name: "Cancer", symbol: "♋", icon: TbZodiacCancer, dateRange: "Jun 21 - Jul 22" },
  { id: "leo", name: "Leo", symbol: "♌", icon: TbZodiacLeo, dateRange: "Jul 23 - Aug 22" },
  { id: "virgo", name: "Virgo", symbol: "♍", icon: TbZodiacVirgo, dateRange: "Aug 23 - Sep 22" },
  { id: "libra", name: "Libra", symbol: "♎", icon: TbZodiacLibra, dateRange: "Sep 23 - Oct 22" },
  { id: "scorpio", name: "Scorpio", symbol: "♏", icon: TbZodiacScorpio, dateRange: "Oct 23 - Nov 21" },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", icon: TbZodiacSagittarius, dateRange: "Nov 22 - Dec 21" },
  { id: "capricorn", name: "Capricorn", symbol: "♑", icon: TbZodiacCapricorn, dateRange: "Dec 22 - Jan 19" },
  { id: "aquarius", name: "Aquarius", symbol: "♒", icon: TbZodiacAquarius, dateRange: "Jan 20 - Feb 18" },
  { id: "pisces", name: "Pisces", symbol: "♓", icon: TbZodiacPisces, dateRange: "Feb 19 - Mar 20" },
];

const Horoscope = () => {
  const { user } = useAuth();
  const [selectedSign, setSelectedSign] = useState(
    user?.zodiacSign || localStorage.getItem("preferredZodiacSign") || "aries"
  );

  useEffect(() => {
    if (user?.zodiacSign) {
      setSelectedSign(user.zodiacSign);
    }
  }, [user?.zodiacSign]);

  const [horoscope, setHoroscope] = useState(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(true);
  const [errorHoroscope, setErrorHoroscope] = useState(null);

  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Save selected sign preference
  const handleSignSelect = (signId) => {
    setSelectedSign(signId);
    localStorage.setItem("preferredZodiacSign", signId);
  };

  // Fetch Horoscope Reading
  useEffect(() => {
    const fetchHoroscope = async () => {
      setLoadingHoroscope(true);
      setErrorHoroscope(null);
      try {
        const response = await apiClient.get(`/horoscope/${selectedSign}`);
        if (response.data?.success) {
          setHoroscope(response.data.data);
        } else {
          setErrorHoroscope("Failed to load reading");
        }
      } catch (err) {
        console.error("Horoscope load error:", err);
        setErrorHoroscope("Could not connect to horoscope service.");
      } finally {
        setLoadingHoroscope(false);
      }
    };
    fetchHoroscope();
  }, [selectedSign]);

  // Fetch Related Articles
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      setLoadingArticles(true);
      try {
        const response = await apiClient.get("/news", {
          params: {
            isHoroscopeRelated: "true",
            limit: 6,
          },
        });
        if (response.data?.success) {
          setArticles(response.data.data || []);
        }
      } catch (err) {
        console.error("Related articles load error:", err);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchRelatedArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 text-charcoal-900">
      {/* Inject custom CSS keyframe animations dynamically to prevent external style dependencies */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes celestialRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-celestial-rotate {
          animation: celestialRotate 140s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulseGlow 10s ease-in-out infinite;
        }
        .animate-twinkle-slow {
          animation: twinkle 4s ease-in-out infinite;
        }
        .animate-twinkle-fast {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-float {
          animation: floatParticle 8s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-charcoal-950 via-indigo-950 to-charcoal-950 text-white p-8 md:p-14 shadow-2xl border border-indigo-900/30">
        {/* Soft background glows and orbit details */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-800/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/2 right-12 md:right-24 -translate-y-1/2 w-80 h-80 rounded-full border border-indigo-500/10 animate-pulse-glow pointer-events-none"></div>
        <div className="absolute top-1/2 right-12 md:right-24 -translate-y-1/2 w-[26rem] h-[26rem] rounded-full border border-indigo-400/5 animate-celestial-rotate pointer-events-none hidden md:block">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-accent-amber/40 rounded-full"></div>
        </div>

        {/* Twinkling stars */}
        <div className="absolute top-8 left-12 w-1.5 h-1.5 bg-white rounded-full animate-twinkle-slow"></div>
        <div className="absolute top-20 right-1/3 w-1 h-1 bg-white rounded-full animate-twinkle-fast"></div>
        <div className="absolute bottom-12 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-twinkle-fast"></div>
        <div className="absolute bottom-20 right-16 w-2 h-2 bg-accent-amber/20 rounded-full animate-twinkle-slow"></div>

        {/* Background Zodiac Ring Icon Container */}
        <div className="absolute right-[-40px] md:right-10 top-1/2 -translate-y-1/2 opacity-10 md:opacity-20 pointer-events-none animate-celestial-rotate">
          <svg className="w-80 h-80 md:w-96 md:h-96 text-accent-amber" fill="none" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="45" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="38" />
            <circle cx="50" cy="50" r="30" strokeDasharray="4,4" />
            <line x1="50" y1="5" x2="50" y2="95" />
            <line x1="5" y1="50" x2="95" y2="50" />
            <line x1="18.3" y1="18.3" x2="81.7" y2="81.7" />
            <line x1="18.3" y1="81.7" x2="81.7" y2="18.3" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-accent-amber/10 to-indigo-500/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-accent-amber border border-accent-amber/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-ping"></span>
            Cosmic Guidance
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Daily Horoscope <br />
            <span className="bg-gradient-to-r from-accent-amber via-amber-200 to-indigo-300 bg-clip-text text-transparent">
              & Celestial Insights
            </span>
          </h1>
          <p className="text-charcoal-300 text-base md:text-lg font-light leading-relaxed max-w-xl">
            Understand your path, discover compatibility, and unlock daily predictions tailored to your zodiac sign's unique energetic signature.
          </p>
        </div>
      </div>

      {/* Zodiac Selector Grid */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-charcoal-100 pb-5">
          <div>
            <h2 className="font-serif text-3xl font-extrabold text-charcoal-950 tracking-tight">Select Your Zodiac Sign</h2>
            <p className="text-sm text-charcoal-500 mt-1">Choose a sign to sync with today's cosmic reading</p>
          </div>
          {user?.zodiacSign && (
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 w-max">
              Linked: {user.zodiacSign.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {ZODIAC_SIGNS.map((sign) => {
            const isSelected = sign.id === selectedSign;
            const SignIcon = sign.icon;
            return (
              <button
                key={sign.id}
                onClick={() => handleSignSelect(sign.id)}
                className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-indigo-950 to-charcoal-950 border-indigo-900 text-white shadow-xl shadow-indigo-950/20 scale-102"
                    : "bg-white border-charcoal-100 hover:border-indigo-200 hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/20 hover:shadow-md text-charcoal-800"
                }`}
              >
                {/* Micro-glow behind selected symbol */}
                {isSelected && (
                  <span className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></span>
                )}
                
                <span className={`transition-transform duration-500 block ${
                  isSelected 
                    ? "scale-115 rotate-6 text-accent-amber" 
                    : "group-hover:scale-115 group-hover:rotate-6 text-indigo-950/80 group-hover:text-indigo-600"
                }`}>
                  <SignIcon className="w-10 h-10 md:w-11 md:h-11 stroke-[1.25]" />
                </span>
                
                <span className={`font-extrabold text-sm tracking-wide mt-3 ${isSelected ? "text-white" : "text-charcoal-900"}`}>
                  {sign.name}
                </span>
                
                <span className={`text-[10px] mt-1 font-medium transition-colors ${
                  isSelected ? "text-indigo-200" : "text-charcoal-400 group-hover:text-indigo-500/70"
                }`}>
                  {sign.dateRange}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Horoscope Card */}
      <div className="space-y-8">
        <div className="border-b border-charcoal-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-3xl font-extrabold text-charcoal-950 tracking-tight">
              Today's Reading
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              Personalized guidance for {selectedSign.charAt(0).toUpperCase() + selectedSign.slice(1)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700 uppercase tracking-widest bg-charcoal-50 px-4 py-2 rounded-xl border border-charcoal-200 shadow-sm">
            <FiCalendar className="h-4 w-4 text-accent-amber" />
            {horoscope?.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {loadingHoroscope ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-72 bg-gradient-to-r from-charcoal-50 via-charcoal-100 to-charcoal-50 border border-charcoal-100 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)',
                animation: 'shimmer 1.8s infinite'
              }}></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gradient-to-r from-charcoal-50 via-charcoal-100 to-charcoal-50 border border-charcoal-100 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)',
                    animation: 'shimmer 1.8s infinite'
                  }}></div>
                </div>
              ))}
            </div>
            {/* Shimmer animation inject */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes shimmer {
                100% { transform: translateX(100%); }
              }
            `}} />
          </div>
        ) : errorHoroscope ? (
          <div className="p-10 text-center bg-red-50/60 border border-red-100 rounded-2xl text-red-800 font-medium">
            <span className="text-2xl mr-2">⚠️</span> {errorHoroscope}
          </div>
        ) : (
          /* Animate container mounting whenever sign changes using key */
          <div key={selectedSign} className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
            
            {/* Reading Content */}
            <div className="md:col-span-2 bg-gradient-to-b from-white to-indigo-50/10 border border-charcoal-150 rounded-3xl p-6 md:p-10 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950 text-accent-amber flex items-center justify-center text-4xl shadow-md border border-indigo-900/35">
                    {React.createElement(ZODIAC_SIGNS.find((z) => z.id === selectedSign)?.icon || TbZodiacAries, {
                      className: "w-10 h-10 stroke-[1.25]"
                    })}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-black text-charcoal-950 uppercase tracking-wide">
                      {selectedSign} Guidance
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600/80 uppercase tracking-wider">Daily Transit Outlook</p>
                  </div>
                </div>
                
                <p className="text-charcoal-800 text-lg md:text-xl leading-relaxed pt-2 font-serif font-light italic">
                  "{horoscope.horoscope_data}"
                </p>
              </div>
              
              {horoscope.is_fallback && (
                <div className="mt-8 text-[10px] font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-lg w-max border border-amber-100 uppercase tracking-widest">
                  Offline Mode Active
                </div>
              )}
            </div>

            {/* Reading Attributes Sidebar */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              
              {/* Lucky Number */}
              <div className="bg-white border border-charcoal-150 hover:border-indigo-150 rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:shadow-indigo-950/5 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-accent-amber/10 flex items-center justify-center text-accent-amber transition-transform duration-300 group-hover:scale-110">
                  <FiCompass className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Lucky Number</p>
                  <p className="font-serif font-black text-2xl text-charcoal-950 mt-0.5">{horoscope.lucky_number}</p>
                </div>
              </div>

              {/* Lucky Color */}
              <div className="bg-white border border-charcoal-150 hover:border-indigo-150 rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:shadow-indigo-950/5 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform duration-300 group-hover:scale-110">
                  <FiActivity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Lucky Color</p>
                  <p className="font-serif font-black text-xl text-charcoal-950 mt-0.5">{horoscope.lucky_color}</p>
                </div>
              </div>

              {/* Compatibility */}
              <div className="bg-white border border-charcoal-150 hover:border-indigo-150 rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:shadow-indigo-950/5 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 transition-transform duration-300 group-hover:scale-110">
                  <FiHeart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Compatibility</p>
                  <p className="font-serif font-black text-xl text-charcoal-950 mt-0.5">{horoscope.compatibility}</p>
                </div>
              </div>

              {/* Mood */}
              <div className="bg-white border border-charcoal-150 hover:border-indigo-150 rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:shadow-indigo-950/5 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 transition-transform duration-300 group-hover:scale-110">
                  <FiSmile className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Mood</p>
                  <p className="font-serif font-black text-xl text-charcoal-950 mt-0.5">{horoscope.mood}</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Related Articles Section */}
      <div className="space-y-8">
        <div className="border-b border-charcoal-100 pb-5">
          <h2 className="font-serif text-3xl font-extrabold text-charcoal-950 tracking-tight">
            Celestial & Wellness Insights
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Handpicked articles relating to mindfulness, meditation, and astrology
          </p>
        </div>

        {loadingArticles ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-gradient-to-r from-charcoal-50 via-charcoal-100 to-charcoal-50 border border-charcoal-100 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)',
                  animation: 'shimmer 1.8s infinite'
                }}></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-charcoal-200 rounded-3xl text-center px-6 gap-5 bg-charcoal-50/30">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl text-indigo-600 shadow-inner">
              ✨
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-extrabold text-charcoal-900">No cosmic articles found</h3>
              <p className="text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed">
                Check back later as our synchronization system categorizes new spiritual and astrological news stories.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <div key={art._id} className="transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-950/5">
                <ArticleCard article={art} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Horoscope;

