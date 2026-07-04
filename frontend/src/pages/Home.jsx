import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBookmark, FiFilter } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import HeroSlider from "../components/HeroSlider";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigationState } from "../contexts/NavigationStateContext";
import toast from "react-hot-toast";
import { useTranslationStream } from "../hooks/useTranslationStream";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

const Home = () => {
  const { getNavigationState, setNavigationState } = useNavigationState();
  const savedState = getNavigationState("home") || {};

  // Language is a GLOBAL preference — always read from localStorage, never per-page session.
  const [language, setLanguage] = useState(
    localStorage.getItem("readingLanguage") || "en"
  );




  const [newsFeed, setNewsFeed] = useState(savedState.newsFeed || []);
  const [businessNews, setBusinessNews] = useState(savedState.businessNews || []);
  const [techNews, setTechNews] = useState(savedState.techNews || []);
  
  const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);
  const [totalPages, setTotalPages] = useState(savedState.totalPages || 1);
  const [hasNext, setHasNext] = useState(savedState.hasNext || false);
  
  const [loadingFeed, setLoadingFeed] = useState(!savedState.newsFeed);
  const [loadingSections, setLoadingSections] = useState(!savedState.businessNews || !savedState.techNews);

  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();

  const handleTranslationUpdate = React.useCallback((data) => {
    const updateArticle = (list) =>
      list.map((art) =>
        art._id === data.articleId
          ? {
              ...art,
              title: data.title,
              description: data.description,
              translationPending: false,
            }
          : art
      );

    setNewsFeed((prev) => updateArticle(prev));
    setBusinessNews((prev) => updateArticle(prev));
    setTechNews((prev) => updateArticle(prev));
  }, []);

  useTranslationStream(language, handleTranslationUpdate);

  // Reset page when language changes
  useEffect(() => {
    setCurrentPage(1);
  }, [language]);

  // Load Main Feed & Pagination
  useEffect(() => {
    const fetchMainFeed = async () => {
      const currentSaved = getNavigationState("home");
      if (
        currentSaved &&
        currentSaved.currentPage === currentPage &&
        currentSaved.language === language &&
        currentSaved.newsFeed &&
        currentSaved.newsFeed.length > 0
      ) {
        setNewsFeed(currentSaved.newsFeed);
        setTotalPages(currentSaved.totalPages || 1);
        setHasNext(!!currentSaved.hasNext);
        setLoadingFeed(false);
        if (typeof currentSaved.scrollY === "number") {
          setTimeout(() => {
            window.scrollTo({ top: currentSaved.scrollY, behavior: "instant" });
          }, 50);
        }
        return;
      }

      setLoadingFeed(true);
      try {
        const response = await apiClient.get("/news", {
          params: {
            category: "general",
            page: currentPage,
            limit: 10,
            language,
          },
        });
        if (response.data && response.data.success) {
          const fetchedNews = response.data.data;
          const fetchedTotal = response.data.totalPages || 1;
          const fetchedHasNext = !!response.data.hasNext;

          setNewsFeed(fetchedNews);
          setTotalPages(fetchedTotal);
          setHasNext(fetchedHasNext);

          setNavigationState("home", {
            newsFeed: fetchedNews,
            totalPages: fetchedTotal,
            hasNext: fetchedHasNext,
            currentPage,
            language,
          });
        }
      } catch (error) {
        console.error("Error loading main news feed:", error);
        setHasNext(false);
      } finally {
        setLoadingFeed(false);
      }
    };
    fetchMainFeed();
  }, [currentPage, language, getNavigationState, setNavigationState]);

  // Load Category Previews
  useEffect(() => {
    const fetchCategoryPreviews = async () => {
      const currentSaved = getNavigationState("home");
      if (
        currentSaved &&
        currentSaved.language === language &&
        currentSaved.businessNews &&
        currentSaved.businessNews.length > 0 &&
        currentSaved.techNews &&
        currentSaved.techNews.length > 0
      ) {
        setBusinessNews(currentSaved.businessNews);
        setTechNews(currentSaved.techNews);
        setLoadingSections(false);
        return;
      }

      setLoadingSections(true);
      try {
        const [businessRes, techRes] = await Promise.all([
          apiClient.get("/news", { params: { category: "business", limit: 3, language } }),
          apiClient.get("/news", { params: { category: "technology", limit: 3, language } }),
        ]);

        let updatedState = { language };
        if (businessRes.data?.success) {
          setBusinessNews(businessRes.data.data);
          updatedState.businessNews = businessRes.data.data;
        }
        if (techRes.data?.success) {
          setTechNews(techRes.data.data);
          updatedState.techNews = techRes.data.data;
        }
        if (Object.keys(updatedState).length > 0) {
          setNavigationState("home", updatedState);
        }
      } catch (error) {
        console.error("Error loading category previews:", error);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchCategoryPreviews();
  }, [language, getNavigationState, setNavigationState]);

  const handleBookmarkToggle = async (e, id) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please sign in to bookmark articles.");
      return;
    }
    if (isBookmarked(id)) {
      await removeBookmark(id);
    } else {
      await addBookmark(id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Divide homepage content
  // First 5 go to the hero slider; next 4 are the trending sidebar; rest fill the Latest feed
  const sliderArticles = newsFeed.slice(0, 5);
  const trendingArticles = newsFeed.slice(1, 5);
  const remainingArticles = currentPage === 1 ? newsFeed.slice(5) : newsFeed;

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* Welcome Header & Reading Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-charcoal-200 pb-5 sm:pb-6 gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-1 block">
            Welcome to NeuzGo
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold capitalize text-charcoal-950">
            Top Headlines
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto" title="Reading Language">
          <FiFilter className="text-charcoal-400 h-4 w-4" />
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              localStorage.setItem("readingLanguage", newLang);
              const langName = LANGUAGES.find((l) => l.code === newLang)?.name || newLang;
              toast.success(`Reading language changed to ${langName}`);
            }}
            className="bg-white border border-charcoal-200 rounded px-2.5 py-2 text-xs font-medium focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
            aria-label="Reading Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Breaking News Marquee */}
      {newsFeed.length > 0 && (
        <div className="w-full bg-charcoal-900 text-white py-3 px-4 rounded overflow-hidden flex items-center gap-3 sm:gap-4 text-xs font-semibold uppercase tracking-wider">
          <span className="bg-accent-amber text-charcoal-950 px-2 py-0.5 rounded-xs shrink-0 text-[10px] sm:text-xs">
            Breaking
          </span>
          <div className="relative flex overflow-x-hidden w-full">
            <div className="animate-marquee whitespace-nowrap flex gap-8 sm:gap-12">
              {newsFeed.slice(0, 3).map((art, idx) => (
                <Link key={art._id || idx} to={`/article/${art._id}`} className="hover:text-accent-amber transition-colors">
                  {art.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Slider + Trending Sidebar */}
      {loadingFeed ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 min-h-[320px] sm:min-h-[420px] skeleton rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-8 skeleton w-1/2"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 skeleton w-full"></div>
            ))}
          </div>
        </div>
      ) : (
        newsFeed.length > 0 && currentPage === 1 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Hero Slider — spans 2 of 3 columns */}
            <div className="lg:col-span-2">
              <HeroSlider articles={sliderArticles} />
            </div>

            {/* Trending Sidebar */}
            <div className="border border-charcoal-100 rounded-xl p-5 sm:p-6 flex flex-col lg:col-span-1">
              <h3 className="font-serif text-lg sm:text-xl font-extrabold text-charcoal-900 border-b border-charcoal-100 pb-3 mb-3">
                Trending Headlines
              </h3>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1 divide-y sm:divide-y-0 lg:divide-y divide-charcoal-100">
                {trendingArticles.map((art, idx) => (
                  <div key={art._id} className="py-3 first:pt-0 last:pb-0 sm:first:pt-3 sm:py-2 lg:first:pt-0 lg:py-3.5 border-b last:border-b-0 sm:border-b-0 lg:border-b last:pb-0 border-charcoal-100">
                    <span className="font-serif text-2xl sm:text-3xl font-black text-charcoal-200 block leading-none mb-1">
                      0{idx + 1}
                    </span>
                    <Link
                      to={`/article/${art._id}`}
                      className="font-sans text-sm font-bold text-charcoal-900 hover:text-accent-blue transition-colors line-clamp-2 leading-snug"
                    >
                      {art.title}
                    </Link>
                    <div className="flex items-center justify-between text-[11px] text-charcoal-400 mt-2">
                      <span>{art.source?.name}</span>
                      <button
                        onClick={(e) => handleBookmarkToggle(e, art._id)}
                        className="p-1.5 -m-1.5 hover:text-accent-amber touch-manipulation"
                        aria-label="Bookmark"
                      >
                        {isBookmarked(art._id) ? (
                          <FaBookmark className="h-3.5 w-3.5 text-accent-amber" />
                        ) : (
                          <FiBookmark className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* Popular Categories Showcase */}
      <section className="space-y-10 sm:space-y-12">
        {/* Business Section */}
        <div>
          <div className="flex items-center justify-between border-b border-charcoal-200 pb-3 sm:pb-4 mb-5 sm:mb-6">
            <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-charcoal-900">
              Business & Markets
            </h3>
            <Link
              to="/category/business"
              className="text-xs font-bold tracking-wider text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 uppercase block py-2 touch-manipulation"
            >
              View All <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingSections ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 skeleton w-full"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {businessNews.map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>
          )}
        </div>

        {/* Technology Section */}
        <div>
          <div className="flex items-center justify-between border-b border-charcoal-200 pb-3 sm:pb-4 mb-5 sm:mb-6">
            <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-charcoal-900">
              Tech & Innovation
            </h3>
            <Link
              to="/category/technology"
              className="text-xs font-bold tracking-wider text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 uppercase block py-2 touch-manipulation"
            >
              View All <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingSections ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 skeleton w-full"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {techNews.map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Latest News Feed */}
      <section className="space-y-6 sm:space-y-8">
        <div className="border-b border-charcoal-200 pb-3 sm:pb-4">
          <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-charcoal-900">
            Latest Reporting
          </h3>
        </div>

        {loadingFeed ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 skeleton w-full"></div>
            ))}
          </div>
        ) : (
          <>
            {remainingArticles.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-charcoal-200 rounded">
                <p className="text-charcoal-500">No additional articles available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {remainingArticles.map((art) => (
                  <ArticleCard key={art._id} article={art} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {(totalPages > 1 || hasNext) && (
              <div className="flex items-center justify-center gap-4 pt-6 sm:pt-8 border-t border-charcoal-100">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-5 py-3 text-xs font-bold border border-charcoal-200 rounded-lg hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider touch-manipulation min-w-[100px]"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="text-charcoal-800">{currentPage}</span>
                  <span className="text-charcoal-400">/</span>
                  <span className="text-charcoal-500">{totalPages}</span>
                </div>
                <button
                  disabled={!hasNext}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-5 py-3 text-xs font-bold border border-charcoal-200 rounded-lg hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider touch-manipulation min-w-[100px]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
