import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { FiFilter, FiGlobe, FiInfo } from "react-icons/fi";
import usePrefetch from "../hooks/usePrefetch";
import { useNavigationState } from "../contexts/NavigationStateContext";
import toast from "react-hot-toast";

const COUNTRIES = [
  { code: "in", name: "India" },
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
];

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

const Category = () => {
  const { categoryId } = useParams();
  const sessionKey = `category-${categoryId}`;
  const { getNavigationState, setNavigationState } = useNavigationState();

  const savedState = getNavigationState(sessionKey) || {};

  const [articles, setArticles] = useState(savedState.articles || []);
  const [loading, setLoading] = useState(!savedState.articles);

  // Country is per-category session (user can change per-page)
  const [country, setCountry] = useState(savedState.country || "in");

  // Language is a GLOBAL preference — always read from localStorage, never per-category session.
  // This ensures switching pages never resets the user's chosen reading language.
  const [language, setLanguage] = useState(
    localStorage.getItem("readingLanguage") || "en"
  );




  // Pagination state
  const [page, setPage] = useState(savedState.page || 1);
  const [totalPages, setTotalPages] = useState(savedState.totalPages || 1);
  const [hasNext, setHasNext] = useState(savedState.hasNext || false);

  // Prefetch hook — used to retrieve any pre-warmed data from Navbar hovers (Task 5.1)
  const { getCachedData } = usePrefetch();

  const isInitial = useRef(true);

  // Reset page when category, country or language changes, skipping initial render to preserve restoration
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    setPage(1);
  }, [categoryId, country, language]);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      const currentSaved = getNavigationState(sessionKey);
      if (
        currentSaved &&
        currentSaved.page === page &&
        currentSaved.country === country &&
        currentSaved.language === language &&
        currentSaved.articles &&
        currentSaved.articles.length > 0
      ) {
        // Restore articles but NEVER restore language from session (it's global via localStorage)
        setArticles(currentSaved.articles);
        setTotalPages(currentSaved.totalPages || 1);
        setHasNext(!!currentSaved.hasNext);
        setLoading(false);
        if (typeof currentSaved.scrollY === "number") {
          setTimeout(() => {
            window.scrollTo({ top: currentSaved.scrollY, behavior: "instant" });
          }, 50);
        }
        return;
      }

      setLoading(true);
      try {
        // Task 5.1: Check prefetch cache for page 1 before making a network request.
        // Only applies to the first page because prefetch always fetches page 1.
        if (page === 1) {
          const cachedData = getCachedData(categoryId, { country, language, limit: 12 });
          if (cachedData) {
            console.log(`[Category] ⚡ Using prefetched cache for "${categoryId}" — skipping API call`);
            setArticles(cachedData.data);
            setTotalPages(cachedData.totalPages || 1);
            setHasNext(!!cachedData.hasNext);
            setLoading(false);
            setNavigationState(sessionKey, {
              articles: cachedData.data,
              totalPages: cachedData.totalPages || 1,
              hasNext: !!cachedData.hasNext,
              page,
              country,
              language,
            });
            return; // Skip API call entirely
          }
          console.log(`[Category] 📡 No prefetch cache for "${categoryId}" — fetching from API`);
        }

        const response = await apiClient.get("/news", {
          params: {
            category: categoryId,
            country,
            language,
            page,
            limit: 12,
          },
        });
        if (response.data && response.data.success) {
          const fetchedArticles = response.data.data;
          const fetchedTotal = response.data.totalPages || 1;
          const fetchedHasNext = !!response.data.hasNext;

          // If we navigated to a deeper page and got nothing back, go back
          if (fetchedArticles.length === 0 && page > 1) {
            toast.error("No more articles available for this category.");
            setPage((prev) => Math.max(prev - 1, 1));
            setLoading(false);
            return;
          }

          setArticles(fetchedArticles);
          setTotalPages(fetchedTotal);
          setHasNext(fetchedHasNext);

          setNavigationState(sessionKey, {
            articles: fetchedArticles,
            totalPages: fetchedTotal,
            hasNext: fetchedHasNext,
            page,
            country,
            language,
          });
        }
      } catch (error) {
        console.error("Error loading category news:", error);
        setArticles([]);
        setTotalPages(1);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryArticles();
  }, [categoryId, country, language, page, getCachedData, getNavigationState, sessionKey, setNavigationState]);

  return (
    <div className="space-y-10">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-charcoal-200 pb-6 gap-6">
        <div>
          <span className="text-xs font-bold tracking-widest text-accent-blue uppercase mb-1.5 block">
            Category
          </span>
          <h1 className="font-serif text-4xl font-extrabold capitalize text-charcoal-950">
            {categoryId} News
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FiGlobe className="text-charcoal-400 h-4 w-4" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-white border border-charcoal-200 rounded px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-charcoal-900 transition-colors"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2" title="Reading Language">
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
              className="bg-white border border-charcoal-200 rounded px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-charcoal-900 transition-colors"
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
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 skeleton w-full"></div>
          ))}
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-charcoal-250 rounded-lg text-center p-6">
              <FiInfo className="h-8 w-8 text-charcoal-400 mb-3" />
              <h3 className="font-serif text-lg font-bold text-charcoal-800 mb-1">
                No Articles Found
              </h3>
              <p className="text-sm text-charcoal-500 max-w-sm">
                No matching articles could be found for this category with your current country and language settings. Try changing filters or sync the news database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {articles.map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {(totalPages > 1 || hasNext) && (
            <div className="flex items-center justify-center gap-2 pt-10 border-t border-charcoal-100">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-xs font-bold border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider"
              >
                Previous
              </button>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-charcoal-800">{page}</span>
                <span className="text-charcoal-400">/</span>
                <span className="text-charcoal-500">{totalPages}</span>
              </div>
              <button
                disabled={!hasNext || loading}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-bold border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider"
              >
                {loading ? "Loading…" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
