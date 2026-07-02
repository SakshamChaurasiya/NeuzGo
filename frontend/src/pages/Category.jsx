import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { FiFilter, FiGlobe, FiInfo } from "react-icons/fi";
import usePrefetch from "../hooks/usePrefetch";

const COUNTRIES = [
  { code: "in", name: "India" },
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

const Category = () => {
  const { categoryId } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [country, setCountry] = useState("in");
  const [language, setLanguage] = useState("en");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Prefetch hook — used to retrieve any pre-warmed data from Navbar hovers (Task 5.1)
  const { getCachedData } = usePrefetch();

  // Reset page when category, country or language changes
  useEffect(() => {
    setPage(1);
  }, [categoryId, country, language]);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
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
            setLoading(false);
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
          setArticles(response.data.data);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error loading category news:", error);
        setArticles([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryArticles();
  }, [categoryId, country, language, page, getCachedData]);

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

          <div className="flex items-center gap-2">
            <FiFilter className="text-charcoal-400 h-4 w-4" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-charcoal-200 rounded px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-charcoal-900 transition-colors"
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
          {totalPages > 1 && (
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
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 text-xs font-bold border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
