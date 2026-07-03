import React, { useEffect, useState } from "react";
import { FiCalendar, FiArrowRight, FiActivity, FiSmile, FiCompass, FiHeart } from "react-icons/fi";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { useAuth } from "../contexts/AuthContext";

const ZODIAC_SIGNS = [
  { id: "aries", name: "Aries", symbol: "♈", dateRange: "Mar 21 - Apr 19" },
  { id: "taurus", name: "Taurus", symbol: "♉", dateRange: "Apr 20 - May 20" },
  { id: "gemini", name: "Gemini", symbol: "♊", dateRange: "May 21 - Jun 20" },
  { id: "cancer", name: "Cancer", symbol: "♋", dateRange: "Jun 21 - Jul 22" },
  { id: "leo", name: "Leo", symbol: "♌", dateRange: "Jul 23 - Aug 22" },
  { id: "virgo", name: "Virgo", symbol: "♍", dateRange: "Aug 23 - Sep 22" },
  { id: "libra", name: "Libra", symbol: "♎", dateRange: "Sep 23 - Oct 22" },
  { id: "scorpio", name: "Scorpio", symbol: "♏", dateRange: "Oct 23 - Nov 21" },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", dateRange: "Nov 22 - Dec 21" },
  { id: "capricorn", name: "Capricorn", symbol: "♑", dateRange: "Dec 22 - Jan 19" },
  { id: "aquarius", name: "Aquarius", symbol: "♒", dateRange: "Jan 20 - Feb 18" },
  { id: "pisces", name: "Pisces", symbol: "♓", dateRange: "Feb 19 - Mar 20" },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-charcoal-900 via-indigo-950 to-charcoal-900 text-white p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-accent-amber">
            Premium Insight
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-black leading-tight tracking-tight">
            Daily Horoscope & Cosmic Guidance
          </h1>
          <p className="text-charcoal-300 text-base md:text-lg font-light leading-relaxed">
            Understand your path, discover compatibility, and unlock daily celestial predictions tailored to your zodiac sign.
          </p>
        </div>
      </div>

      {/* Zodiac Selector Grid */}
      <div className="space-y-6">
        <div className="border-b border-charcoal-100 pb-4">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">Select Your Zodiac Sign</h2>
          <p className="text-sm text-charcoal-500 mt-1">Choose a sign to view its daily cosmic horoscope reading</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {ZODIAC_SIGNS.map((sign) => {
            const isSelected = sign.id === selectedSign;
            return (
              <button
                key={sign.id}
                onClick={() => handleSignSelect(sign.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-charcoal-950 border-charcoal-950 text-white shadow-lg scale-102"
                    : "bg-white border-charcoal-100 hover:border-charcoal-300 hover:bg-charcoal-50/50 text-charcoal-800"
                }`}
              >
                <span className={`text-3xl md:text-4xl mb-2 transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-110"}`}>
                  {sign.symbol}
                </span>
                <span className="font-bold text-sm">{sign.name}</span>
                <span className={`text-[10px] mt-1 ${isSelected ? "text-charcoal-300" : "text-charcoal-400"}`}>
                  {sign.dateRange}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Horoscope Card */}
      <div className="space-y-6">
        <div className="border-b border-charcoal-100 pb-4 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              Today's Reading
            </h2>
            <p className="text-sm text-charcoal-500 mt-1">
              Personalized prediction for {selectedSign.charAt(0).toUpperCase() + selectedSign.slice(1)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-600 uppercase tracking-widest bg-charcoal-50 px-3 py-1.5 rounded border border-charcoal-100">
            <FiCalendar className="h-4 w-4 text-indigo-500" />
            {horoscope?.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {loadingHoroscope ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-64 bg-charcoal-50 border border-charcoal-100 rounded-xl md:col-span-2"></div>
            <div className="h-64 bg-charcoal-50 border border-charcoal-100 rounded-xl"></div>
          </div>
        ) : errorHoroscope ? (
          <div className="p-8 text-center bg-red-50 border border-red-100 rounded-xl text-red-700">
            {errorHoroscope}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reading Content */}
            <div className="md:col-span-2 bg-white border border-charcoal-100 rounded-xl p-6 md:p-8 flex flex-col justify-between hover:shadow-sm transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {ZODIAC_SIGNS.find((z) => z.id === selectedSign)?.symbol}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal-950 uppercase tracking-wide">
                      {selectedSign} Guidance
                    </h3>
                    <p className="text-xs text-charcoal-400">Daily Transit Outlook</p>
                  </div>
                </div>
                <p className="text-charcoal-700 text-base md:text-lg leading-relaxed pt-2 font-serif font-light">
                  {horoscope.horoscope_data}
                </p>
              </div>
              {horoscope.is_fallback && (
                <div className="mt-6 text-[10px] font-bold text-charcoal-400 bg-charcoal-50 px-3 py-1.5 rounded w-max border border-charcoal-100 uppercase tracking-widest">
                  Offline Mode Active
                </div>
              )}
            </div>

            {/* Reading Attributes Sidebar */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="bg-white border border-charcoal-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-xs transition-shadow">
                <div className="h-10 w-10 rounded-full bg-accent-amber/10 flex items-center justify-center text-accent-amber">
                  <FiCompass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-400">Lucky Number</p>
                  <p className="font-bold text-lg text-charcoal-900">{horoscope.lucky_number}</p>
                </div>
              </div>

              <div className="bg-white border border-charcoal-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-xs transition-shadow">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <FiActivity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-400">Lucky Color</p>
                  <p className="font-bold text-lg text-charcoal-900">{horoscope.lucky_color}</p>
                </div>
              </div>

              <div className="bg-white border border-charcoal-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-xs transition-shadow">
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <FiHeart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-400">Compatibility</p>
                  <p className="font-bold text-lg text-charcoal-900">{horoscope.compatibility}</p>
                </div>
              </div>

              <div className="bg-white border border-charcoal-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-xs transition-shadow">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <FiSmile className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-400">Mood</p>
                  <p className="font-bold text-lg text-charcoal-900">{horoscope.mood}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Articles Section */}
      <div className="space-y-6">
        <div className="border-b border-charcoal-100 pb-4">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Celestial & Wellness Insights
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Handpicked articles relating to mindfulness, meditation, and astrology
          </p>
        </div>

        {loadingArticles ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-charcoal-50 border border-charcoal-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-charcoal-200 rounded-xl text-center px-6 gap-4">
            <div className="h-12 w-12 rounded-full bg-charcoal-50 flex items-center justify-center text-charcoal-400">
              ✨
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-charcoal-800">No cosmic articles found</h3>
              <p className="text-sm text-charcoal-500 max-w-sm">
                Check back later as our synchronization system categorizes new spiritual and astrological news stories.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Horoscope;
