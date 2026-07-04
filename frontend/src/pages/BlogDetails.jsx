import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiCalendar, FiClock, FiEye, FiHeart, FiFlag, FiTrash2, FiShare2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import apiClient from "../api/client";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeAnimated, setLikeAnimated] = useState(false);

  const getOptimizedImageUrl = (url, width, height, quality = 95) => {
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

  const handleLike = async () => {
    setLikeAnimated(true);
    setTimeout(() => setLikeAnimated(false), 400);
    try {
      const response = await apiClient.post(`/blogs/${id}/like`);
      if (response.data?.success) {
        setBlog((prev) => ({
          ...prev,
          likes: response.data.likes,
          likedBy: response.data.liked
            ? [...(prev.likedBy || []), user?.id]
            : (prev.likedBy || []).filter((uid) => uid !== user?.id),
        }));
        toast.success(response.data.message);
      }
    } catch (err) {
      console.error("Like error:", err);
      toast.error(err.response?.data?.message || "Failed to like article.");
    }
  };

  const handleReport = async () => {
    if (window.confirm("Are you sure you want to report this blog post?")) {
      try {
        const response = await apiClient.post(`/blogs/${id}/report`);
        if (response.data?.success) {
          if (response.data.flagged) {
            toast.success("Blog has been flagged and removed from the feed for admin review.");
            navigate("/blogs");
          } else {
            setBlog((prev) => ({
              ...prev,
              reportedBy: [...(prev.reportedBy || []), user?.id],
            }));
            toast.success("Blog reported successfully.");
          }
        }
      } catch (err) {
        console.error("Report error:", err);
        toast.error(err.response?.data?.message || "Failed to report article.");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    try {
      const isAdmin = user?.role === "admin";
      const endpoint = isAdmin ? `/admin/blogs/${id}` : `/blogs/${id}`;
      const response = await apiClient.delete(endpoint);
      if (response.data?.success) {
        toast.success("Blog deleted successfully.");
        navigate("/blogs");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete blog.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Blog post link copied!");
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

  const hasLiked = blog.likedBy?.includes(user?.id);
  const hasReported = blog.reportedBy?.includes(user?.id);
  const isAuthor = user && blog.author?._id && (blog.author._id === user.id || blog.author._id === user._id);
  const isAdmin = user?.role === "admin";
  const canDelete = isAuthor || isAdmin;

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
        <div className="w-full rounded-xl overflow-hidden border border-charcoal-100 shadow-sm bg-charcoal-50/50 flex justify-center items-center max-h-[480px]">
          <img 
            src={getOptimizedImageUrl(blog.imageUrl, 1200, null, 95)} 
            alt={blog.title} 
            className="max-h-[480px] w-full object-contain rounded-xl" 
          />
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

            {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                hasLiked ? "text-red-500 hover:text-red-600" : "text-charcoal-400 hover:text-charcoal-600"
              }`}
              aria-label={hasLiked ? "Unlike blog post" : "Like blog post"}
            >
              {hasLiked ? (
                <FaHeart className={`h-4 w-4 text-red-500 ${likeAnimated ? "animate-like" : ""}`} />
              ) : (
                <FiHeart className={`h-4 w-4 ${likeAnimated ? "animate-like" : ""}`} />
              )}
              <span>{blog.likes || 0} Likes</span>
            </button>

            <button
              onClick={handleReport}
              disabled={hasReported}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                hasReported ? "text-amber-500 cursor-not-allowed" : "text-charcoal-400 hover:text-red-500"
              }`}
              aria-label="Report blog post"
            >
              <FiFlag className="h-4 w-4" />
              <span>{hasReported ? "Reported" : "Report"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-400 hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label="Share blog post"
            >
              <FiShare2 className="h-4 w-4" />
              <span>Share</span>
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-400 hover:text-red-600 transition-colors cursor-pointer"
                aria-label="Delete blog post"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
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
