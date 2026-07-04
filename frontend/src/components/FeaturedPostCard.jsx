import React from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

const FeaturedPostCard = ({ blog }) => {
  if (!blog) return null;

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60";
  
  const getOptimizedImageUrl = (url, width, height, quality = 90) => {
    if (!url) return url;
    if (url.includes("ik.imagekit.io")) {
      const separator = url.includes("?") ? "&" : "?";
      const transform = height 
        ? `tr=w-${width},h-${height},fo-auto,q-${quality}`
        : `tr=w-${width},q-${quality}`;
      return `${url}${separator}${transform}`;
    }
    return url;
  };

  const displayImage = getOptimizedImageUrl(blog.imageUrl, 1000, 625) || FALLBACK_IMAGE;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-charcoal-100 bg-white hover:shadow-lg transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Full-bleed Image */}
        <div className="relative min-h-[300px] sm:min-h-[400px] lg:col-span-7 overflow-hidden bg-charcoal-50">
          <img
            src={displayImage}
            alt={blog.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
          />
          {/* Mobile Category Tag overlay */}
          <div className="absolute top-4 left-4 lg:hidden bg-white/90 backdrop-blur-xs px-4.5 py-2 text-xs font-bold uppercase tracking-wider text-charcoal-900 rounded-sm">
            {blog.category}
          </div>
        </div>

        {/* Right Side: Dark Contrasting Panel */}
        <div className="flex flex-col justify-between p-5 sm:p-8 lg:p-12 lg:col-span-5 bg-charcoal-900 text-white">
          <div className="space-y-4 sm:space-y-6">
            {/* Desktop Category Tag */}
            <div className="hidden lg:block">
              <span className="bg-indigo-600/90 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full">
                {blog.category}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 sm:space-y-3">
              <Link to={`/blogs/${blog._id}`} className="block group-hover:text-indigo-300 transition-colors">
                <h3 className="font-serif text-xl sm:text-3xl xl:text-4xl font-black leading-tight tracking-tight">
                  {blog.title}
                </h3>
              </Link>
              <p className="text-xs sm:text-base text-charcoal-300 line-clamp-4 leading-relaxed font-normal">
                {blog.description}
              </p>
            </div>

            {/* Author / Date Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-charcoal-400 font-semibold tracking-wide uppercase pt-2 border-t border-charcoal-800">
              <span className="flex items-center gap-1 text-charcoal-200">
                <FiUser className="h-3.5 w-3.5" />
                {blog.author?.username || "Writer"}
              </span>
              <span className="hidden sm:inline text-charcoal-700">•</span>
              <span className="flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5" />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
              <span className="hidden sm:inline text-charcoal-700">•</span>
              <span className="flex items-center gap-1">
                <FiClock className="h-3.5 w-3.5" />
                {blog.readingTime || 1} Min Read
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-5 sm:pt-8 lg:pt-0">
            <Link
              to={`/blogs/${blog._id}`}
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal-900 bg-white rounded-lg hover:bg-indigo-50 transition-colors duration-300 touch-manipulation"
            >
              Read Article
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default FeaturedPostCard;
