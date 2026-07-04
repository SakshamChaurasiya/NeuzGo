import React from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

const BlogPostCard = ({ blog }) => {
  if (!blog) return null;

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
  
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

  const displayImage = getOptimizedImageUrl(blog.imageUrl, 600, 375) || FALLBACK_IMAGE;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <article className="group flex flex-col bg-white border border-charcoal-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Blog Cover Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-50">
        <img
          src={displayImage}
          alt={blog.title}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-900 rounded-sm">
          {blog.category}
        </span>
      </div>

      {/* Blog Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Category & Date Metadata in Small Caps */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">
          <span className="flex items-center gap-1 text-charcoal-600">
            <FiUser className="h-3 w-3" />
            {blog.author?.username || "Writer"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FiCalendar className="h-3 w-3" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/blogs/${blog._id}`} className="block group-hover:text-indigo-600 transition-colors">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-950 leading-snug line-clamp-2 mb-2">
            {blog.title}
          </h3>
        </Link>

        {/* Description / Excerpt */}
        <p className="text-sm text-charcoal-500 line-clamp-3 leading-relaxed mb-4 flex-1">
          {blog.description}
        </p>

        {/* Card Footer: Read time & "Read More" CTA */}
        <div className="pt-4 border-t border-charcoal-50 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-charcoal-400 font-semibold tracking-wide uppercase">
            <FiClock className="h-3.5 w-3.5" />
            {blog.readingTime || 1} min read
          </span>
          <Link
            to={`/blogs/${blog._id}`}
            className="relative inline-flex flex-col text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors py-1"
          >
            <span className="flex items-center gap-1">
              Read More <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
            </span>
            {/* Animated accent underline detail */}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
