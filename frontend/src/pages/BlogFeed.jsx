import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUser, FiEye, FiClock } from "react-icons/fi";
import apiClient from "../api/client";

const CATEGORIES = ["All", "General", "Technology", "Health", "Business", "Sports", "Politics", "Entertainment"];

const BlogFeed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/blogs", {
        params: {
          category: category === "All" ? undefined : category,
          page,
          limit: 9,
        },
      });
      if (response.data?.success) {
        setBlogs(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-950 tracking-tight">
          The Reader's Journal
        </h1>
        <p className="text-charcoal-500 font-medium text-base">
          Explore thought-provoking articles, tutorials, and stories written by our community.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-charcoal-100 pb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              category === cat
                ? "bg-charcoal-900 text-white shadow-sm"
                : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[16/10] bg-charcoal-100 rounded-lg"></div>
              <div className="h-4 bg-charcoal-100 rounded w-1/4"></div>
              <div className="h-6 bg-charcoal-100 rounded w-3/4"></div>
              <div className="h-4 bg-charcoal-100 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
          <p className="text-charcoal-500 font-medium">No published blogs found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="group relative flex flex-col bg-white border border-charcoal-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              {/* Blog Cover */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-50">
                <img
                  src={blog.imageUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60"}
                  alt={blog.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-900 rounded-sm">
                  {blog.category}
                </span>
              </div>

              {/* Blog Info */}
              <div className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-charcoal-400 mb-3">
                  <span className="flex items-center gap-1 font-semibold text-charcoal-600">
                    <FiUser className="h-3 w-3" />
                    {blog.author?.username || "Writer"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="h-3 w-3" />
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                </div>

                <Link to={`/blogs/${blog._id}`} className="block flex-1 group-hover:text-indigo-600 transition-colors">
                  <h3 className="font-serif text-xl font-bold text-charcoal-950 leading-snug line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-charcoal-500 line-clamp-3 leading-relaxed">
                    {blog.description}
                  </p>
                </Link>

                <div className="pt-4 mt-4 border-t border-charcoal-50 flex items-center justify-between text-xs text-charcoal-400 font-medium">
                  <span className="flex items-center gap-1">
                    <FiClock className="h-3.5 w-3.5" />
                    {blog.readingTime || 1} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye className="h-3.5 w-3.5" />
                    {blog.views || 0} views
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-charcoal-200 rounded-lg text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-charcoal-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-charcoal-200 rounded-lg text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogFeed;
