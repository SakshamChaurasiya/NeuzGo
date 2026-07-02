import React from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiCalendar, FiUser } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useAuth } from "../contexts/AuthContext";

const ArticleCard = ({ article }) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();

  const id = article._id;
  const bookmarked = isBookmarked(id);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please sign in to bookmark articles.");
      return;
    }
    if (bookmarked) {
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

  // Fallback high quality image from unsplash
  const displayImage =
    article.imageUrl ||
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";

  return (
    <article className="group relative flex flex-col bg-white border border-charcoal-100 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Article Image wrapper */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-50">
        <img
          src={displayImage}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-900 rounded-sm">
          {article.category}
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center justify-between text-xs text-charcoal-400 mb-2.5">
          <span className="font-semibold text-charcoal-600">{article.source?.name}</span>
          <span className="flex items-center gap-1">
            <FiCalendar className="h-3 w-3" />
            {formatDate(article.publishedAt)}
          </span>
        </div>

        <Link to={`/article/${id}`} className="block flex-1">
          <h3 className="font-serif text-lg font-bold text-charcoal-950 leading-snug group-hover:text-accent-blue transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-charcoal-500 line-clamp-3 leading-relaxed">
            {article.description}
          </p>
        </Link>

        {/* Footer info & bookmark toggle */}
        <div className="mt-6 pt-4 border-t border-charcoal-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
            <FiUser className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">{article.author || "Unknown"}</span>
          </div>

          <button
            onClick={handleBookmarkToggle}
            className="p-1.5 rounded-full hover:bg-charcoal-50 text-charcoal-400 hover:text-charcoal-900 transition-colors"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {bookmarked ? (
              <FaBookmark className="h-4 w-4 text-accent-amber animate-scale-up" />
            ) : (
              <FiBookmark className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
