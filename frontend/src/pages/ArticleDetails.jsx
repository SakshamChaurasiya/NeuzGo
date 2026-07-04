import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiUser, FiBookmark, FiShare2, FiArrowLeft, FiArrowUp } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import toast from "react-hot-toast";
import apiClient from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslationStream } from "../hooks/useTranslationStream";

const languageNames = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  es: "Spanish",
  fr: "French",
  de: "German"
};
const getLanguageName = (code) => languageNames[code] || String(code).toUpperCase();

const readMoreLabels = {
  en: "read more here",
  hi: "और पढ़ें",
  ta: "மேலும் படிக்க",
  te: "మరింత చదవండి",
  bn: "আরও পড়ুন",
  mr: "अधिक वाचा",
  es: "leer más aquí",
  fr: "lire la suite ici",
  de: "hier weiterlesen"
};
const getReadMoreLabel = (code) => readMoreLabels[code] || "read more here";

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

  const language = localStorage.getItem("readingLanguage") || "en";

  const handleTranslationUpdate = useCallback((data) => {
    // 1. Update main article if matches
    setArticle((prev) => {
      if (prev && prev._id === data.articleId) {
        return {
          ...prev,
          title: data.title,
          description: data.description,
          content: data.content || prev.content,
          translationPending: false,
          language: data.language,
        };
      }
      return prev;
    });

    // 2. Update related articles if matches
    setRelated((prev) =>
      prev.map((art) =>
        art._id === data.articleId
          ? {
              ...art,
              title: data.title,
              description: data.description,
              translationPending: false,
            }
          : art
      )
    );
  }, []);

  useTranslationStream(language, handleTranslationUpdate);

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
        const readingLang = localStorage.getItem("readingLanguage") || "en";
        const response = await apiClient.get(`/news/${id}`, {
          params: { language: readingLang }
        });
        if (response.data && response.data.success) {
          const art = response.data.data;
          setArticle(art);
          
          // Fetch related articles in the same category, translating them too
          const relatedRes = await apiClient.get("/news", {
            params: { category: art.category, limit: 4, language: readingLang },
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

  const renderContent = (content) => {
    if (!content) return null;
    // Matches bracket suffixes in any language (e.g., [+467 chars], [+467 caracteres], [+467 वर्ण])
    const charsPattern = /\s*\[\+?\d+\s+[^\]]+\]\s*$/i;
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, idx) => {
      const isLastParagraph = idx === paragraphs.length - 1;
      if (isLastParagraph) {
        const hasSuffix = charsPattern.test(para);
        const cleanedPara = hasSuffix ? para.replace(charsPattern, "") : para;
        return (
          <p key={idx}>
            {cleanedPara}
            {article.articleUrl && (
              <>
                {" "}
                <a
                  href={article.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-blue hover:underline font-semibold text-xs ml-1"
                >
                  {getReadMoreLabel(article.language || "en")}
                </a>
              </>
            )}
          </p>
        );
      }
      return <p key={idx}>{para}</p>;
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
      {/* Reading Progress Bar (Fixed just below sticky header — h-16/top-16 on mobile, h-20/top-20 on sm+) */}
      <div className="fixed top-16 sm:top-20 left-0 w-full h-[3px] bg-charcoal-100 z-50">
        <div
          className="h-full bg-accent-amber transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Article Main Content (680px max-width reading column) */}
          <article className="lg:col-span-8 space-y-6 sm:space-y-8 max-w-article mx-auto lg:mx-0 px-4 sm:px-0">
            {/* Category Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-blue">
              <Link to="/" className="hover:underline text-charcoal-400">Home</Link>
              <span className="text-charcoal-350">/</span>
              <Link to={`/category/${article.category}`} className="hover:underline">
                {article.category}
              </Link>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-950 leading-tight">
              {article.translationPending ? (
                <div className="h-12 bg-charcoal-100 skeleton w-full"></div>
              ) : (
                article.title
              )}
            </h1>

            {article.originalLanguage && article.language && article.originalLanguage !== article.language && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-50 border border-charcoal-150 rounded text-xs text-charcoal-600 font-medium">
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                Original: <span className="font-semibold">{getLanguageName(article.originalLanguage)}</span>
                <span className="text-charcoal-300">|</span>
                Translated to: <span className="font-semibold">{getLanguageName(article.language)}</span>
              </div>
            )}

            {/* Author, Date & Actions Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-y border-charcoal-100 gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-charcoal-500">
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
                  className="flex items-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 border border-charcoal-200 rounded-lg text-xs font-semibold hover:bg-charcoal-50 transition-colors touch-manipulation"
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
                  className="flex items-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 border border-charcoal-200 rounded-lg text-xs font-semibold hover:bg-charcoal-50 transition-colors text-charcoal-700 touch-manipulation"
                  aria-label="Share"
                >
                  <FiShare2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Feature Image */}
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-charcoal-50">
              <img
                src={article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Source Attribution */}
            <p className="text-xs text-charcoal-450 italic px-1 sm:px-0">
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
            <div className="border-l-3 border-charcoal-800 pl-4">
              {article.translationPending ? (
                <div className="space-y-2">
                  <div className="h-5 bg-charcoal-100 skeleton w-full"></div>
                  <div className="h-5 bg-charcoal-100 skeleton w-5/6"></div>
                </div>
              ) : (
                <p className="font-sans text-base sm:text-lg text-charcoal-800 leading-relaxed font-semibold">
                  {article.description}
                </p>
              )}
            </div>

            {/* Article Content Body (High-quality serif font, comfortable spacing scaled for mobile) */}
            <div className="font-serif text-base sm:text-lg text-charcoal-850 leading-relaxed sm:leading-loose space-y-6 pt-2 sm:pt-4">
              {article.translationPending ? (
                <div className="space-y-4">
                  <div className="h-5 bg-charcoal-100 skeleton w-full"></div>
                  <div className="h-5 bg-charcoal-100 skeleton w-full"></div>
                  <div className="h-5 bg-charcoal-100 skeleton w-4/5"></div>
                  <div className="h-5 bg-charcoal-100 skeleton w-full mt-6"></div>
                  <div className="h-5 bg-charcoal-100 skeleton w-5/6"></div>
                </div>
              ) : article.content ? (
                renderContent(article.content)
              ) : (
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut convallis ex, id euismod ex. Pellentesque quis sodales ex. Aliquam elementum, urna et porttitor hendrerit, neque felis hendrerit nunc, sit amet euismod elit eros et arcu. Mauris id arcu nec eros imperdiet molestie. Sed imperdiet ex dolor, in sollicitudin est molestie ut.
                </p>
              )}
            </div>
          </article>

          {/* Related Articles Sidebar Column (4 grid units width) */}
          <aside className="lg:col-span-4 space-y-6 sm:space-y-8 border-t lg:border-t-0 lg:border-l border-charcoal-100 pt-6 sm:pt-8 lg:pt-0 lg:pl-8 px-4 sm:px-6 lg:px-0">
            <h3 className="font-serif text-lg sm:text-xl font-extrabold text-charcoal-900 pb-3 border-b border-charcoal-100 mt-2 lg:mt-5">
              Related Coverage
            </h3>

            {related.length === 0 ? (
              <p className="text-sm text-charcoal-400">No related articles found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
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
          className="fixed bottom-6 right-6 p-3 bg-charcoal-900 text-white rounded-full shadow-lg hover:bg-charcoal-800 hover:scale-105 transition-all duration-200 z-40 touch-manipulation"
          aria-label="Scroll to top"
        >
          <FiArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default ArticleDetails;
