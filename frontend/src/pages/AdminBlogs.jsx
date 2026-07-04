import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiEye,
  FiEdit,
  FiFileText,
  FiLock
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Modal views
  const [previewBlog, setPreviewBlog] = useState(null);
  const [rejectionBlog, setRejectionBlog] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        status: status || undefined,
        search: search.trim() || undefined
      };
      const response = await apiClient.get("/admin/blogs", { params });
      if (response.data && response.data.success) {
        setBlogs(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load user blogs list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const handleApprove = async (blogId) => {
    try {
      const response = await apiClient.post(`/admin/blogs/${blogId}/approve`);
      if (response.data && response.data.success) {
        toast.success("Blog approved and published successfully.");
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Failed to approve blog.");
    }
  };

  const handleOpenReject = (blog) => {
    setRejectionBlog(blog);
    setRejectReason("");
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      const response = await apiClient.post(`/admin/blogs/${rejectionBlog._id}/reject`, { reason: rejectReason.trim() });
      if (response.data && response.data.success) {
        toast.success("Blog rejected successfully.");
        setRejectionBlog(null);
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Failed to reject blog.");
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const response = await apiClient.delete(`/admin/blogs/${blogId}`);
      if (response.data && response.data.success) {
        toast.success("Blog soft-deleted successfully.");
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Failed to delete blog.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">User Blogs Management</h2>
        <p className="text-sm text-gray-500">Approve pending community blogs, moderate published ones, and review statistics.</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title, description, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Quick Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-600"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
            <option value="Deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Blogs Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-gray-500">Retrieving blogs list...</span>
          </div>
        ) : blogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Blog Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        {blog.imageUrl ? (
                          <img src={blog.imageUrl} alt="" className="w-12 h-10 object-cover rounded-md flex-shrink-0 bg-gray-100 border border-gray-100" />
                        ) : (
                          <div className="w-12 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <FiFileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer" onClick={() => setPreviewBlog(blog)}>
                            {blog.title}
                          </p>
                          <p className="text-gray-400 text-[10px] truncate">{blog.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{blog.author?.username || "Unknown"}</p>
                      <p className="text-gray-400 text-[10px]">{blog.author?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(blog.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {blog.views || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        blog.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                        blog.status === "Pending" ? "bg-amber-50 text-amber-700" :
                        blog.status === "Rejected" ? "bg-rose-50 text-rose-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewBlog(blog)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Preview Blog"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </button>
                        {blog.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(blog._id)}
                              className="p-1.5 rounded hover:bg-gray-100 text-emerald-600 hover:text-emerald-700 transition-colors"
                              title="Approve Blog"
                            >
                              <FiCheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenReject(blog)}
                              className="p-1.5 rounded hover:bg-gray-100 text-amber-600 hover:text-amber-700 transition-colors"
                              title="Reject Blog"
                            >
                              <FiXCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-rose-600 transition-colors"
                          title="Delete Blog"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400">
            No user blogs found matching the filter options.
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-800">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-gray-800">{Math.min(page * limit, totalCount)}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalCount}</span> blogs
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Blog Modal */}
      {previewBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-xl overflow-hidden my-8 animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Author Story Preview</span>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider truncate max-w-md">Blog Preview</h3>
              </div>
              <button onClick={() => setPreviewBlog(null)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {previewBlog.imageUrl && (
                <img src={previewBlog.imageUrl} alt="" className="w-full h-64 object-cover rounded-lg border border-gray-100 shadow-sm" />
              )}
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{previewBlog.title}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Written by: <strong>{previewBlog.author?.username}</strong></span>
                <span>•</span>
                <span>Category: <strong>{previewBlog.category}</strong></span>
                <span>•</span>
                <span>Created: <strong>{new Date(previewBlog.createdAt).toLocaleString()}</strong></span>
              </div>
              {previewBlog.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                  <strong>Rejection Reason:</strong> {previewBlog.rejectionReason}
                </div>
              )}
              <p className="text-xs leading-relaxed text-gray-600 bg-gray-50 p-4 border border-gray-100 rounded-lg italic">"{previewBlog.description}"</p>
              <div className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{previewBlog.content}</div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setPreviewBlog(null)} className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-100">
                Close
              </button>
              {previewBlog.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(previewBlog._id);
                      setPreviewBlog(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white rounded-lg"
                  >
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => {
                      handleOpenReject(previewBlog);
                      setPreviewBlog(null);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white rounded-lg"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectionBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Provide Rejection Reason</h3>
              <button onClick={() => setRejectionBlog(null)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Please enter a reason for rejecting the blog: <strong>{rejectionBlog.title}</strong>. This will help the user revise and resubmit.
              </p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reason for Rejection</label>
                <textarea
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Needs better formatting, content contains promotional links..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectionBlog(null)}
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-xs font-semibold text-white rounded-lg hover:bg-amber-700 shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
