import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiSearch, FiX, FiInfo, FiLoader } from "react-icons/fi";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const suggestionRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync state if URL changes directly
  useEffect(() => {
    setSearchQuery(queryParam);
    if (queryParam) {
      fetchResults(queryParam, page);
    } else {
      setResults([]);
      setTotalPages(1);
      setHasNext(false);
    }
  }, [queryParam, page]);

  // Debounced suggestions handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await apiClient.get("/news", {
          params: { search: searchQuery, limit: 5 },
        });
        if (response.data && response.data.success) {
          setSuggestions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchResults = async (searchVal, currentPage) => {
    setLoadingResults(true);
    try {
      const response = await apiClient.get("/news", {
        params: {
          search: searchVal,
          page: currentPage,
          limit: 12,
        },
      });
      if (response.data && response.data.success) {
        setResults(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setHasNext(!!response.data.hasNext);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
      setTotalPages(1);
      setHasNext(false);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setPage(1);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    setSearchParams({ q: title });
    setPage(1);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setResults([]);
    setSuggestions([]);
  };

  return (
    <div className="space-y-12">
      {/* Search Header and Input */}
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <h1 className="font-serif text-4xl font-extrabold text-charcoal-950">
          Search the News
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative" ref={suggestionRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by keywords, title, or source..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-5 py-3.5 pl-12 pr-12 text-sm bg-white border border-charcoal-200 rounded-lg shadow-sm focus:outline-none focus:border-charcoal-900 transition-all font-medium"
            />
            <FiSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
            
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-800 transition-all"
              >
                <FiX className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className="absolute top-full left-0 w-full bg-white border border-charcoal-250 rounded-b-lg shadow-lg mt-1 z-30 divide-y divide-charcoal-50 text-left">
              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-4 text-xs text-charcoal-400 gap-2">
                  <FiLoader className="h-4 w-4 animate-spin text-accent-blue" />
                  <span>Searching headlines...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-charcoal-400">
                  No suggestions matching query. Press enter to search anyway.
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    onClick={() => handleSuggestionClick(suggestion.title)}
                    className="px-4 py-3 hover:bg-charcoal-50 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <span className="text-xs font-bold text-charcoal-900 truncate flex-1">
                      {suggestion.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-accent-blue tracking-wider shrink-0 bg-charcoal-50 px-1.5 py-0.5 rounded">
                      {suggestion.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {queryParam && (
          <div className="border-b border-charcoal-100 pb-3 flex items-center justify-between text-sm text-charcoal-500">
            <span>
              Showing results for: <span className="font-bold text-charcoal-800">"{queryParam}"</span>
            </span>
            <span>{results.length} stories found</span>
          </div>
        )}

        {loadingResults ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 skeleton w-full"></div>
            ))}
          </div>
        ) : (
          <>
            {results.length === 0 ? (
              queryParam && (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-charcoal-250 rounded-lg text-center p-6">
                  <FiInfo className="h-8 w-8 text-charcoal-400 mb-3" />
                  <h3 className="font-serif text-lg font-bold text-charcoal-800 mb-1">
                    No Results Found
                  </h3>
                  <p className="text-sm text-charcoal-500 max-w-sm">
                    No articles matched your keywords. Try checking spelling, using more general terms, or syncing latest news headlines.
                  </p>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {results.map((art) => (
                  <ArticleCard key={art._id} article={art} />
                ))}
              </div>
            )}

            {/* Search Pagination */}
            {(totalPages > 1 || hasNext) && results.length > 0 && (
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
                  disabled={!hasNext}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-2 text-xs font-bold border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
