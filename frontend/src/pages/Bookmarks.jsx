import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiTrash2, FiArrowRight, FiCalendar, FiUser, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { useBookmarks } from "../contexts/BookmarkContext";

const Bookmarks = () => {
  const { bookmarks, removeBookmark, loading } = useBookmarks();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (newsId) => {
    setRemovingId(newsId);
    const result = await removeBookmark(newsId);
    setRemovingId(null);
    if (result.success) {
      toast.success("Bookmark removed.");
    } else {
      toast.error(result.message || "Failed to remove bookmark.");
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-charcoal-100 rounded w-1/3"></div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-36 bg-charcoal-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-charcoal-200 pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal-950">Saved Articles</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            {bookmarks.length} {bookmarks.length === 1 ? "article" : "articles"} saved to your reading list
          </p>
        </div>
        {bookmarks.length > 0 && (
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-600">
            <FiBookmark className="h-4 w-4 text-accent-amber" />
            {bookmarks.length}
          </span>
        )}
      </div>

      {/* Empty State */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 border border-dashed border-charcoal-200 rounded-xl text-center px-6 gap-5">
          <div className="h-16 w-16 rounded-full bg-charcoal-50 flex items-center justify-center">
            <FiBookmark className="h-7 w-7 text-charcoal-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-charcoal-800">Your reading list is empty</h3>
            <p className="text-sm text-charcoal-500 max-w-sm">
              Browse the latest headlines and tap the bookmark icon to save articles you want to read later.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 bg-charcoal-950 text-white text-xs font-bold rounded-lg hover:bg-charcoal-800 transition-colors uppercase tracking-wider touch-manipulation"
          >
            Browse Headlines <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        /* Bookmarks Feed */
        <div className="divide-y divide-charcoal-100">
          {bookmarks.map((bookmark) => {
            const article = bookmark.newsId;
            if (!article) return null;

            const articleId = article._id;
            const newsId = articleId;
            const isRemoving = removingId === newsId;

            return (
              <div
                key={bookmark._id}
                className={`py-5 sm:py-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start group transition-opacity duration-200 ${isRemoving ? "opacity-40 pointer-events-none" : ""}`}
              >
                {/* Thumbnail */}
                <Link
                  to={`/article/${articleId}`}
                  className="shrink-0 overflow-hidden rounded-lg w-full sm:w-32 aspect-[16/10] sm:h-24 bg-charcoal-50"
                >
                  <img
                    src={article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=70"}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                  {/* Category & Source */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className="bg-charcoal-100 text-charcoal-700 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="text-charcoal-400">{article.source?.name}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/article/${articleId}`}>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-charcoal-950 leading-snug hover:text-accent-blue transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-charcoal-500 line-clamp-2 leading-relaxed hidden sm:block">
                    {article.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-charcoal-400">
                    <span className="flex items-center gap-1">
                      <FiUser className="h-3 w-3" />
                      {article.author || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(newsId)}
                  disabled={isRemoving}
                  className="p-3 -m-3 sm:m-0 self-end sm:self-start text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors touch-manipulation"
                  aria-label="Remove bookmark"
                >
                  {isRemoving ? (
                    <FiLoader className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <FiTrash2 className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
