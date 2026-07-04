import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import {
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiEdit,
  FiEye,
  FiClock,
  FiInfo,
  FiX
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminRequests = () => {
  const [activeTab, setActiveTab] = useState("blogs"); // "blogs" or "news"
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [pendingNews, setPendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Blog rejection state
  const [rejectionBlog, setRejectionBlog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Detail preview state
  const [previewItem, setPreviewItem] = useState(null);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch pending blogs
      const blogResponse = await apiClient.get("/admin/blogs", { params: { status: "Pending", limit: 30 } });
      if (blogResponse.data && blogResponse.data.success) {
        setPendingBlogs(blogResponse.data.data);
      }

      // 2. Fetch pending news
      const newsResponse = await apiClient.get("/admin/news", { params: { status: "Pending", limit: 30 } });
      if (newsResponse.data && newsResponse.data.success) {
        setPendingNews(newsResponse.data.data);
      }
      
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error("Failed to load approval queues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  // Blog Handlers
  const handleApproveBlog = async (id) => {
    try {
      const response = await apiClient.post(`/admin/blogs/${id}/approve`);
      if (response.data && response.data.success) {
        toast.success("Blog approved and published.");
        fetchPendingItems();
      }
    } catch (error) {
      toast.error("Failed to approve blog.");
    }
  };

  const handleOpenRejectBlog = (blog) => {
    setRejectionBlog(blog);
    setRejectReason("");
  };

  const handleRejectBlogSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    try {
      const response = await apiClient.post(`/admin/blogs/${rejectionBlog._id}/reject`, { reason: rejectReason.trim() });
      if (response.data && response.data.success) {
        toast.success("Blog rejected with feedback.");
        setRejectionBlog(null);
        fetchPendingItems();
      }
    } catch (error) {
      toast.error("Failed to reject blog.");
    }
  };

  // News Handlers
  const handleApproveNews = async (id) => {
    try {
      const response = await apiClient.post(`/admin/news/${id}/approve`);
      if (response.data && response.data.success) {
        toast.success("News article approved.");
        fetchPendingItems();
      }
    } catch (error) {
      toast.error("Failed to approve news.");
    }
  };

  const handleRejectNews = async (id) => {
    try {
      const response = await apiClient.post(`/admin/news/${id}/reject`);
      if (response.data && response.data.success) {
        toast.success("News article rejected.");
        fetchPendingItems();
      }
    } catch (error) {
      toast.error("Failed to reject news.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Approvals Queue</h2>
        <p className="text-sm text-gray-500">Review pending blog submissions and flagged news articles.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("blogs")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "blogs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <FiEdit />
          Pending Blogs ({pendingBlogs.length})
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "news"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <FiFileText />
          Pending News ({pendingNews.length})
        </button>
      </div>

      {/* Content queue */}
      {loading ? (
        <div className="p-16 text-center flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-gray-500">Checking pending requests...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "blogs" ? (
            pendingBlogs.length > 0 ? (
              pendingBlogs.map((blog) => (
                <div key={blog._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="p-5 space-y-4">
                    {/* Author block */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock />
                        {new Date(blog.submittedAt || blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold uppercase tracking-wider text-[9px]">
                        Pending Review
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 cursor-pointer" onClick={() => setPreviewItem({ ...blog, type: "blog" })}>
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{blog.description}</p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {blog.author?.username?.substring(0,2).toUpperCase() || "US"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-800 truncate">{blog.author?.username}</p>
                        <p className="text-[10px] text-gray-400 truncate">{blog.author?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-gray-100 bg-gray-50/50 p-3 justify-end gap-2">
                    <button
                      onClick={() => setPreviewItem({ ...blog, type: "blog" })}
                      className="p-2 border border-gray-200 hover:border-gray-300 rounded text-gray-600 hover:bg-white transition-colors"
                      title="Preview Blog"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenRejectBlog(blog)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded transition-colors"
                    >
                      <FiXCircle /> Reject
                    </button>
                    <button
                      onClick={() => handleApproveBlog(blog._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors shadow-sm"
                    >
                      <FiCheckCircle /> Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 text-center text-gray-400 border border-gray-200 rounded-xl shadow-sm text-xs font-medium">
                No pending blog submissions require attention.
              </div>
            )
          ) : (
            pendingNews.length > 0 ? (
              pendingNews.map((article) => (
                <div key={article._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold uppercase tracking-wider text-[9px]">
                        Review Flagged
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 cursor-pointer" onClick={() => setPreviewItem({ ...article, type: "news" })}>
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{article.description}</p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500 justify-between">
                      <span>Source: <strong>{article.source?.name}</strong></span>
                      <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-[10px] font-semibold">{article.category}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-gray-100 bg-gray-50/50 p-3 justify-end gap-2">
                    <button
                      onClick={() => setPreviewItem({ ...article, type: "news" })}
                      className="p-2 border border-gray-200 hover:border-gray-300 rounded text-gray-600 hover:bg-white transition-colors"
                      title="Preview Article"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectNews(article._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded transition-colors"
                    >
                      <FiXCircle /> Reject
                    </button>
                    <button
                      onClick={() => handleApproveNews(article._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors shadow-sm"
                    >
                      <FiCheckCircle /> Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 text-center text-gray-400 border border-gray-200 rounded-xl shadow-sm text-xs font-medium">
                No flagged news articles pending approval.
              </div>
            )
          )}
        </div>
      )}

      {/* Reject Dialog */}
      {rejectionBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Reject Pending Submission</h3>
              <button onClick={() => setRejectionBlog(null)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectBlogSubmit} className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Provide constructive feedback for: <strong>{rejectionBlog.title}</strong>
              </p>
              <textarea
                required
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Please add images or verify writing tone before publication."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectionBlog(null)}
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-xs font-semibold text-white rounded-lg hover:bg-amber-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-100 shadow-2xl flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden animate-scale-up">
            {/* Header (Sticky) */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">{previewItem.category}</span>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{previewItem.type === "blog" ? "Blog Submission" : "News Article"}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow text-xs leading-relaxed text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {previewItem.imageUrl && (
                  <div className="md:col-span-1">
                    <img src={previewItem.imageUrl} alt="Cover" className="w-full h-32 md:h-36 object-cover rounded-xl border border-gray-100 shadow-sm bg-gray-50" />
                  </div>
                )}
                <div className={previewItem.imageUrl ? "md:col-span-2 space-y-3" : "col-span-full space-y-3"}>
                  <h2 className="text-base font-extrabold text-gray-900 leading-snug">{previewItem.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-gray-400 font-medium">
                    <span>Submitted: <strong className="text-gray-600">{new Date(previewItem.createdAt || previewItem.publishedAt).toLocaleString()}</strong></span>
                    <span>•</span>
                    {previewItem.type === "news" && <span>Source: <strong className="text-gray-600">{previewItem.source?.name}</strong></span>}
                    {previewItem.type === "blog" && <span>Author: <strong className="text-gray-600">{previewItem.author?.username}</strong></span>}
                  </div>
                  <p className="text-gray-600 bg-gray-50/50 p-3.5 border border-gray-200/50 rounded-xl italic leading-relaxed">
                    "{previewItem.description}"
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Article Content</h4>
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-xs bg-gray-50/30 border border-gray-100 p-5 rounded-xl font-sans antialiased">
                  {previewItem.content}
                </div>
              </div>
            </div>

            {/* Footer (Sticky) */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/80 backdrop-blur-sm flex-shrink-0">
              <button onClick={() => setPreviewItem(null)} className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                Close
              </button>
              {previewItem.type === "blog" ? (
                <>
                  <button
                    onClick={() => {
                      handleApproveBlog(previewItem._id);
                      setPreviewItem(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleOpenRejectBlog(previewItem);
                      setPreviewItem(null);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleApproveNews(previewItem._id);
                      setPreviewItem(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleRejectNews(previewItem._id);
                      setPreviewItem(null);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
