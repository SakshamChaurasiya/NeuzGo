import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useAuth } from "../contexts/AuthContext";

const SLIDE_INTERVAL = 5000; // 5 seconds

const HeroSlider = ({ articles = [] }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();

  const slides = articles.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length === 0) return;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [next, paused, slides.length]);

  const handleBookmark = async (e, id) => {
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
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (slides.length === 0) return null;

  const article = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-charcoal-950 min-h-[300px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[520px] group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images — stack all and fade the active one */}
      {slides.map((art, idx) => (
        <div
          key={art._id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: idx === current ? 1 : 0 }}
        >
          <img
            src={
              art.imageUrl ||
              "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80"
            }
            alt={art.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/50 to-transparent" />
        </div>
      ))}

      {/* Content — always shows active article */}
      <div className="relative flex flex-col justify-end h-full min-h-[300px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[520px] p-5 sm:p-10 space-y-3 sm:space-y-4">
        {/* Category badge */}
        <span className="bg-gray-100/40 text-gray-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm w-fit"> 
          {article.category} 
        </span>

        {/* Title */}
        <Link to={`/article/${article._id}`}>
          <h2 className="font-serif text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight hover:text-charcoal-200 transition-colors max-w-3xl">
            {article.title}
          </h2>
        </Link>

        {/* Description */}
        <p className="text-charcoal-300 text-xs sm:text-sm md:text-base line-clamp-2 max-w-2xl font-light">
          {article.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-charcoal-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-charcoal-300">{article.source?.name}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <button
            onClick={(e) => handleBookmark(e, article._id)}
            className="p-2 rounded-full hover:bg-white/10 text-white hover:text-accent-amber transition-colors"
          >
            {isBookmarked(article._id) ? (
              <FaBookmark className="h-4.5 w-4.5 text-accent-amber" />
            ) : (
              <FiBookmark className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center gap-2 pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-white w-6 h-2"
                  : "bg-white/40 hover:bg-white/60 w-2 h-2"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}

          {/* Slide counter */}
          <span className="ml-auto text-xs font-semibold text-charcoal-400">
            {current + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Prev / Next arrow buttons — show on hover on large screens */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Next slide"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
