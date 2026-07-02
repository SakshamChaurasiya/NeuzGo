import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiUser, FiBookmark, FiShare2, FiArrowLeft, FiArrowUp } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useAuth } from "../contexts/AuthContext";

const ArticleDetails = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const bookmarked = article ? isBookmarked(article._id) : false;

  // Track Reading Progress and Scroll-to-Top visibility
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.pageYOffset / totalHeight) * 100;
        setScrollProgress(progress);
      }
      if (window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Article Details & Related Articles
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/news/${id}`);
        if (response.data && response.data.success) {
          const art = response.data.data;
          setArticle(art);
          
          // Fetch related articles in the same category
          const relatedRes = await apiClient.get("/news", {
            params: { category: art.category, limit: 4 },
          });
          if (relatedRes.data && relatedRes.data.success) {
            // Exclude current article
            const filteredRelated = relatedRes.data.data.filter((r) => r._id !== art._id);
            setRelated(filteredRelated.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Error loading article details:", error);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0); // Scroll to top on load
      }
    };
    fetchDetails();
  }, [id]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark articles.");
      return;
    }
    if (bookmarked) {
      await removeBookmark(article._id);
      toast.success("Bookmark removed!");
    } else {
      await addBookmark(article._id);
      toast.success("Bookmark added!");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-article mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-6 bg-charcoal-100 rounded w-16"></div>
        <div className="h-12 bg-charcoal-100 rounded w-3/4"></div>
        <div className="h-4 bg-charcoal-100 rounded w-1/3"></div>
        <div className="aspect-video bg-charcoal-100 rounded w-full"></div>
        <div className="space-y-4">
          <div className="h-6 bg-charcoal-100 rounded w-full"></div>
          <div className="h-6 bg-charcoal-100 rounded w-full"></div>
          <div className="h-6 bg-charcoal-100 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900 mb-2">Article Not Found</h2>
        <p className="text-charcoal-500 mb-6">The article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-accent-blue hover:underline inline-flex items-center gap-1">
          <FiArrowLeft /> Back to Homepage
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Reading Progress Bar (Fixed just below sticky header) */}
      <div className="fixed top-20 left-0 w-full h-[3px] bg-charcoal-100 z-50">
        <div
          className="h-full bg-accent-amber transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article Main Content (680px max-width reading column) */}
          <article className="lg:col-span-8 space-y-8 max-w-article mx-auto lg:mx-0">
            {/* Category Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-blue">
              <Link to="/" className="hover:underline text-charcoal-400">Home</Link>
              <span className="text-charcoal-350">/</span>
              <Link to={`/category/${article.category}`} className="hover:underline">
                {article.category}
              </Link>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-charcoal-950 leading-tight">
              {article.title}
            </h1>

            {/* Author, Date & Actions Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-y border-charcoal-100 gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500">
                <span className="flex items-center gap-1.5">
                  <FiUser className="h-4 w-4" />
                  {article.author || "Unknown"}
                </span>
                <span className="text-charcoal-250">•</span>
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBookmarkToggle}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-charcoal-200 rounded text-xs font-semibold hover:bg-charcoal-50 transition-colors"
                  aria-label="Bookmark"
                >
                  {bookmarked ? (
                    <>
                      <FaBookmark className="h-3.5 w-3.5 text-accent-amber" />
                      <span className="text-charcoal-900">Saved</span>
                    </>
                  ) : (
                    <>
                      <FiBookmark className="h-3.5 w-3.5" />
                      <span className="text-charcoal-700">Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-charcoal-200 rounded text-xs font-semibold hover:bg-charcoal-50 transition-colors text-charcoal-700"
                  aria-label="Share"
                >
                  <FiShare2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Feature Image */}
            <div className="aspect-video w-full overflow-hidden rounded bg-charcoal-50">
              <img
                src={article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Source Attribution */}
            <p className="text-xs text-charcoal-450 italic">
              Reported by <span className="font-semibold">{article.source?.name}</span>. Original coverage can be found at{" "}
              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent-blue"
              >
                {article.source?.name || "Original Source"}
              </a>.
            </p>

            {/* Description / Summary */}
            <p className="font-sans text-lg text-charcoal-800 leading-relaxed font-semibold border-l-3 border-charcoal-800 pl-4">
              {article.description}
            </p>

            {/* Article Content Body (High-quality serif font, comfortable spacing) */}
            <div className="font-serif text-lg text-charcoal-850 leading-loose space-y-6 pt-4">
              {article.content ? (
                article.content.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))
              ) : (
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut convallis ex, id euismod ex. Pellentesque quis sodales ex. Aliquam elementum, urna et porttitor hendrerit, neque felis hendrerit nunc, sit amet euismod elit eros et arcu. Mauris id arcu nec eros imperdiet molestie. Sed imperdiet ex dolor, in sollicitudin est molestie ut.
                </p>
              )}
            </div>
          </article>

          {/* Related Articles Sidebar Column (4 grid units width) */}
          <aside className="lg:col-span-4 space-y-8 border-t lg:border-t-0 lg:border-l border-charcoal-100 pt-8 lg:pt-0 lg:pl-8">
            <h3 className="font-serif text-xl font-extrabold text-charcoal-900 pb-3 border-b border-charcoal-100">
              Related Coverage
            </h3>

            {related.length === 0 ? (
              <p className="text-sm text-charcoal-400">No related articles found.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {related.map((art) => (
                  <ArticleCard key={art._id} article={art} />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-charcoal-900 text-white rounded-full shadow-lg hover:bg-charcoal-800 hover:scale-105 transition-all duration-200 z-40"
          aria-label="Scroll to top"
        >
          <FiArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Toaster element for react-hot-toast notifications */}
      <Toaster position="bottom-right" />
    </>
  );
};

export default ArticleDetails;
