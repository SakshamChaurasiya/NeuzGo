import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiArrowRight, FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const [newsFeed, setNewsFeed] = useState([]);
  const [businessNews, setBusinessNews] = useState([]);
  const [techNews, setTechNews] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);

  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();

  // Load Main Feed & Pagination
  useEffect(() => {
    const fetchMainFeed = async () => {
      setLoadingFeed(true);
      try {
        const response = await apiClient.get("/news", {
          params: {
            category: "general",
            page: currentPage,
            limit: 10,
          },
        });
        if (response.data && response.data.success) {
          setNewsFeed(response.data.data);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error loading main news feed:", error);
      } finally {
        setLoadingFeed(false);
      }
    };
    fetchMainFeed();
  }, [currentPage]);

  // Load Category Previews
  useEffect(() => {
    const fetchCategoryPreviews = async () => {
      setLoadingSections(true);
      try {
        const [businessRes, techRes] = await Promise.all([
          apiClient.get("/news", { params: { category: "business", limit: 3 } }),
          apiClient.get("/news", { params: { category: "technology", limit: 3 } }),
        ]);

        if (businessRes.data?.success) setBusinessNews(businessRes.data.data);
        if (techRes.data?.success) setTechNews(techRes.data.data);
      } catch (error) {
        console.error("Error loading category previews:", error);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchCategoryPreviews();
  }, []);

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

  // Divide homepage content (only on first page)
  const heroArticle = newsFeed[0];
  const trendingArticles = newsFeed.slice(1, 5);
  const remainingArticles = currentPage === 1 ? newsFeed.slice(5) : newsFeed;

  return (
    <div className="space-y-16">
      {/* Breaking News Marquee */}
      {newsFeed.length > 0 && (
        <div className="w-full bg-charcoal-900 text-white py-3 px-4 rounded overflow-hidden flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
          <span className="bg-accent-amber text-charcoal-950 px-2 py-0.5 rounded-xs shrink-0">
            Breaking
          </span>
          <div className="relative flex overflow-x-hidden w-full">
            <div className="animate-marquee whitespace-nowrap flex gap-12">
              {newsFeed.slice(0, 3).map((art, idx) => (
                <Link key={art._id || idx} to={`/article/${art._id}`} className="hover:text-accent-amber transition-colors">
                  {art.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Grid Section */}
      {loadingFeed ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-[16/9] w-full skeleton"></div>
            <div className="h-6 skeleton w-1/4"></div>
            <div className="h-8 skeleton w-3/4"></div>
            <div className="h-4 skeleton w-full"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 skeleton w-1/3"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 skeleton w-full"></div>
            ))}
          </div>
        </div>
      ) : (
        heroArticle && currentPage === 1 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Hero Lead */}
            <div className="lg:col-span-2 group relative flex flex-col justify-end overflow-hidden rounded-lg bg-charcoal-950 min-h-[420px] lg:min-h-[500px]">
              <img
                src={heroArticle.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"}
                alt={heroArticle.title}
                className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-101 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent"></div>
              
              <div className="relative p-6 sm:p-10 space-y-4">
                <span className="bg-accent-blue text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                  {heroArticle.category}
                </span>
                
                <Link to={`/article/${heroArticle._id}`} className="block">
                  <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight hover:text-charcoal-200 transition-colors">
                    {heroArticle.title}
                  </h2>
                </Link>
                
                <p className="text-charcoal-300 text-sm sm:text-base line-clamp-2 max-w-2xl font-light">
                  {heroArticle.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-charcoal-400">
                  <div className="flex items-center gap-4">
                    <span>{heroArticle.source?.name}</span>
                    <span>•</span>
                    <span>{formatDate(heroArticle.publishedAt)}</span>
                  </div>

                  <button
                    onClick={(e) => handleBookmarkToggle(e, heroArticle._id)}
                    className="text-white hover:text-accent-amber transition-colors"
                  >
                    {isBookmarked(heroArticle._id) ? (
                      <FaBookmark className="h-4.5 w-4.5 text-accent-amber" />
                    ) : (
                      <FiBookmark className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Trending Sidebar */}
            <div className="border border-charcoal-100 rounded-lg p-6 flex flex-col">
              <h3 className="font-serif text-xl font-extrabold text-charcoal-900 border-b border-charcoal-100 pb-3 mb-4">
                Trending Headlines
              </h3>
              <div className="flex-1 divide-y divide-charcoal-100">
                {trendingArticles.map((art, idx) => (
                  <div key={art._id} className="py-3.5 first:pt-0 last:pb-0">
                    <span className="font-serif text-3xl font-black text-charcoal-200 block leading-none mb-1">
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
                        className="hover:text-accent-amber"
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
      <section className="space-y-12">
        {/* Business Section */}
        <div>
          <div className="flex items-center justify-between border-b border-charcoal-200 pb-4 mb-6">
            <h3 className="font-serif text-2xl font-extrabold text-charcoal-900">
              Business & Markets
            </h3>
            <Link
              to="/category/business"
              className="text-xs font-bold tracking-wider text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 uppercase"
            >
              View All <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingSections ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 skeleton w-full"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessNews.map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>
          )}
        </div>

        {/* Technology Section */}
        <div>
          <div className="flex items-center justify-between border-b border-charcoal-200 pb-4 mb-6">
            <h3 className="font-serif text-2xl font-extrabold text-charcoal-900">
              Tech & Innovation
            </h3>
            <Link
              to="/category/technology"
              className="text-xs font-bold tracking-wider text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 uppercase"
            >
              View All <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingSections ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 skeleton w-full"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {techNews.map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Latest News Feed */}
      <section className="space-y-8">
        <div className="border-b border-charcoal-200 pb-4">
          <h3 className="font-serif text-2xl font-extrabold text-charcoal-900">
            Latest Reporting
          </h3>
        </div>

        {loadingFeed ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {remainingArticles.map((art) => (
                  <ArticleCard key={art._id} article={art} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="text-charcoal-800">{currentPage}</span>
                  <span className="text-charcoal-400">/</span>
                  <span className="text-charcoal-500">{totalPages}</span>
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 transition-colors uppercase tracking-wider"
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
