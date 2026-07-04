import React, { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import BlogSectionHeader from "../components/BlogSectionHeader";
import FeaturedPostCard from "../components/FeaturedPostCard";
import BlogPostCard from "../components/BlogPostCard";
import CategoryFilterPills from "../components/CategoryFilterPills";

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

  const featuredBlog = page === 1 && blogs.length > 0 ? blogs[0] : null;
  const gridBlogs = page === 1 ? blogs.slice(1) : blogs;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-charcoal-950 tracking-tight">
          The Reader's Journal
        </h1>
        <p className="text-charcoal-500 font-medium text-sm sm:text-base px-2">
          Explore thought-provoking articles, tutorials, and stories written by our community.
        </p>
      </div>

      {/* Category Filters */}
      <CategoryFilterPills
        categories={CATEGORIES}
        selectedCategory={category}
        onChangeCategory={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
      />

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-8 sm:space-y-12">
          {page === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 animate-pulse rounded-2xl border border-charcoal-100 overflow-hidden">
              <div className="min-h-[260px] sm:min-h-[400px] lg:col-span-7 bg-charcoal-100"></div>
              <div className="p-6 sm:p-8 lg:p-12 lg:col-span-5 bg-charcoal-900 space-y-6">
                <div className="h-6 bg-charcoal-800 rounded w-1/4"></div>
                <div className="h-10 bg-charcoal-800 rounded w-3/4"></div>
                <div className="h-20 bg-charcoal-800 rounded"></div>
                <div className="h-4 bg-charcoal-800 rounded w-1/2"></div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[16/10] bg-charcoal-100 rounded-lg"></div>
                <div className="h-4 bg-charcoal-100 rounded w-1/4"></div>
                <div className="h-6 bg-charcoal-100 rounded w-3/4"></div>
                <div className="h-4 bg-charcoal-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200 p-6">
          <p className="text-charcoal-500 font-medium">No published blogs found in this category.</p>
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {/* Featured Post Hero */}
          {featuredBlog && (
            <div className="space-y-4 sm:space-y-6">
              <BlogSectionHeader label="Editor's Choice" title="Featured Story" />
              <FeaturedPostCard blog={featuredBlog} />
            </div>
          )}

          {/* Grid of Latest Stories */}
          {gridBlogs.length > 0 && (
            <div className="pt-4 sm:pt-6">
              <BlogSectionHeader label="Browse and read the latest stuff" title="Latest Stories" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {gridBlogs.map((blog) => (
                  <BlogPostCard key={blog._id} blog={blog} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-8 border-t border-charcoal-100">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-3 border border-charcoal-200 rounded-lg text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50 touch-manipulation min-w-[100px]"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-charcoal-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-3 border border-charcoal-200 rounded-lg text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 disabled:opacity-50 touch-manipulation min-w-[100px]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogFeed;
