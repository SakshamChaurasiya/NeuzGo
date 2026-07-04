import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiCalendar, FiClock, FiEye } from "react-icons/fi";
import apiClient from "../api/client";
import toast from "react-hot-toast";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await apiClient.get(`/blogs/${id}`);
        if (response.data?.success) {
          setBlog(response.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading blog article.");
        navigate("/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetails();
  }, [id, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-6 animate-pulse">
        <div className="h-4 bg-charcoal-100 rounded w-1/4"></div>
        <div className="h-12 bg-charcoal-100 rounded w-3/4"></div>
        <div className="h-64 bg-charcoal-100 rounded"></div>
        <div className="space-y-3">
          <div className="h-4 bg-charcoal-100 rounded w-full"></div>
          <div className="h-4 bg-charcoal-100 rounded w-5/6"></div>
          <div className="h-4 bg-charcoal-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/blogs")}
        className="flex items-center gap-2 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Journal
      </button>

      {/* Cover Image */}
      {blog.imageUrl && (
        <div className="aspect-[21/9] w-full rounded-xl overflow-hidden border border-charcoal-100 shadow-sm bg-charcoal-50">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
            {blog.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <FiClock className="h-3 w-3" /> {blog.readingTime || 1} min read
          </span>
          <span className="flex items-center gap-1 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <FiEye className="h-3 w-3" /> {blog.views || 0} views
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal-950 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-3 pt-2 text-sm text-charcoal-500 font-semibold">
          <span className="flex items-center gap-1.5 text-charcoal-700">
            <FiUser className="h-4 w-4" />
            {blog.author?.username || "Writer"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <FiCalendar className="h-4 w-4" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>
      </div>

      <hr className="border-charcoal-100" />

      {/* Description / Summary */}
      {blog.description && (
        <p className="font-serif text-lg text-charcoal-600 leading-relaxed italic border-l-4 border-indigo-200 pl-4 py-1">
          {blog.description}
        </p>
      )}

      {/* Content Body */}
      <div className="prose prose-charcoal max-w-none text-charcoal-800 text-base leading-relaxed whitespace-pre-wrap">
        {blog.content}
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-t border-charcoal-100">
          {blog.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-charcoal-50 text-charcoal-600 px-3 py-1 rounded text-xs font-semibold hover:bg-charcoal-100 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default BlogDetails;
