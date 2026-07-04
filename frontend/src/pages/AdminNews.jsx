import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
  FiX,
  FiEye,
  FiTrendingUp
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [previewArticle, setPreviewArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content: "",
    author: "",
    sourceName: "",
    sourceUrl: "",
    category: "general",
    imageUrl: "",
    status: "Approved"
  });

  const categoriesList = ["general", "business", "technology", "entertainment", "sports", "science", "health", "world"];

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        order,
        search: search.trim() || undefined,
        category: category || undefined,
        status: status || undefined,
        source: source.trim() || undefined
      };
      const response = await apiClient.get("/admin/news", { params });
      if (response.data && response.data.success) {
        setNews(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to load news articles.");
    } finally {
      setLoading(false);
    }
  };

  // URL Query Sync (for global search redirects)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const searchParam = queryParams.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [page, category, status, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  // Selection helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(news.map(n => n._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Single Action Helpers
  const handleApprove = async (id) => {
    try {
      const response = await apiClient.post(`/admin/news/${id}/approve`);
      if (response.data && response.data.success) {
        toast.success("News article approved.");
        fetchNews();
      }
    } catch (error) {
      toast.error("Failed to approve article.");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await apiClient.post(`/admin/news/${id}/reject`);
      if (response.data && response.data.success) {
        toast.success("News article rejected.");
        fetchNews();
      }
    } catch (error) {
      toast.error("Failed to reject article.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const response = await apiClient.delete(`/admin/news/${id}`);
      if (response.data && response.data.success) {
        toast.success("News article deleted.");
        fetchNews();
      }
    } catch (error) {
      toast.error("Failed to delete article.");
    }
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    try {
      const response = await apiClient.post("/admin/news/bulk-approve", { ids: selectedIds });
      if (response.data && response.data.success) {
        toast.success(`Approved ${selectedIds.length} articles.`);
        setSelectedIds([]);
        fetchNews();
      }
    } catch (error) {
      toast.error("Bulk approval failed.");
    }
  };

  const handleBulkReject = async () => {
    if (!selectedIds.length) return;
    try {
      const response = await apiClient.post("/admin/news/bulk-reject", { ids: selectedIds });
      if (response.data && response.data.success) {
        toast.success(`Rejected ${selectedIds.length} articles.`);
        setSelectedIds([]);
        fetchNews();
      }
    } catch (error) {
      toast.error("Bulk rejection failed.");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} articles?`)) return;
    try {
      const response = await apiClient.post("/admin/news/bulk-delete", { ids: selectedIds });
      if (response.data && response.data.success) {
        toast.success(`Deleted ${selectedIds.length} articles.`);
        setSelectedIds([]);
        fetchNews();
      }
    } catch (error) {
      toast.error("Bulk delete failed.");
    }
  };

  // Modal forms
  const openEditModal = (article) => {
    setEditingArticle(article);
    setEditForm({
      title: article.title,
      description: article.description || "",
      content: article.content || "",
      author: article.author || "Unknown",
      sourceName: article.source?.name || "",
      sourceUrl: article.source?.url || "",
      category: article.category || "general",
      imageUrl: article.imageUrl || "",
      status: article.status || "Approved"
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/admin/news/${editingArticle._id}`, editForm);
      if (response.data && response.data.success) {
        toast.success("Article updated successfully.");
        setEditingArticle(null);
        fetchNews();
      }
    } catch (error) {
      toast.error("Failed to update news article.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">News Articles Management</h2>
          <p className="text-sm text-gray-500">Manage, preview, edit status, and run bulk operations on synced news stories.</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left search inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search title, content, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </form>
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-48">
              <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by Source..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </form>
            <button type="submit" onClick={fetchNews} className="px-4 py-2 bg-gray-950 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              Search
            </button>
          </div>

          {/* Right select lists */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split("-");
                setSortBy(field);
                setOrder(dir);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="publishedAt-desc">Newest Published</option>
              <option value="publishedAt-asc">Oldest Published</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs animate-fade-in">
            <span className="font-semibold text-blue-800">
              {selectedIds.length} articles selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
              >
                <FiCheckCircle /> Bulk Approve
              </button>
              <button
                onClick={handleBulkReject}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 transition-colors"
              >
                <FiXCircle /> Bulk Reject
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded font-semibold hover:bg-rose-700 transition-colors"
              >
                <FiTrash2 /> Bulk Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-gray-500">Retrieving articles inventory...</span>
          </div>
        ) : news.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={news.length > 0 && selectedIds.length === news.length}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </th>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Source & Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Published Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {news.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleSelectRow(item._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-12 h-10 object-cover rounded-md flex-shrink-0 bg-gray-100 border border-gray-100" />
                        ) : (
                          <div className="w-12 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            No Img
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer" onClick={() => setPreviewArticle(item)}>{item.title}</p>
                          <p className="text-gray-400 text-[10px] truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{item.source?.name || "GNews"}</p>
                      <p className="text-gray-400 text-[10px]">{item.author || "Unknown"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === "Approved" ? "bg-emerald-50 text-emerald-700" :
                        item.status === "Pending" ? "bg-amber-50 text-amber-700" :
                        "bg-rose-50 text-rose-700"
                      }`}>
                        {item.status || "Approved"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(item.publishedAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewArticle(item)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Preview"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-3.5 h-3.5" />
                        </button>
                        {item.status !== "Approved" && (
                          <button
                            onClick={() => handleApprove(item._id)}
                            className="p-1.5 rounded hover:bg-gray-100 text-emerald-600 hover:text-emerald-700 transition-colors"
                            title="Approve"
                          >
                            <FiCheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status !== "Rejected" && (
                          <button
                            onClick={() => handleReject(item._id)}
                            className="p-1.5 rounded hover:bg-gray-100 text-amber-600 hover:text-amber-700 transition-colors"
                            title="Reject"
                          >
                            <FiXCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-rose-600 transition-colors"
                          title="Delete"
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
            No news articles found matching the options.
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-800">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-gray-800">{Math.min(page * limit, totalCount)}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalCount}</span> news articles
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

      {/* Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-xl overflow-hidden my-8 animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{previewArticle.category}</span>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider truncate max-w-md">Article Details</h3>
              </div>
              <button onClick={() => setPreviewArticle(null)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {previewArticle.imageUrl && (
                <img src={previewArticle.imageUrl} alt="" className="w-full h-64 object-cover rounded-lg bg-gray-50 border border-gray-100" />
              )}
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{previewArticle.title}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>By <strong>{previewArticle.author}</strong></span>
                <span>•</span>
                <span>Source: <strong>{previewArticle.source?.name}</strong></span>
                <span>•</span>
                <span>Published: <strong>{new Date(previewArticle.publishedAt).toLocaleString()}</strong></span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 bg-gray-50 p-4 border border-gray-100 rounded-lg">{previewArticle.description}</p>
              <div className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{previewArticle.content}</div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setPreviewArticle(null)} className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-100">
                Close
              </button>
              {previewArticle.articleUrl && (
                <a href={previewArticle.articleUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-xs font-semibold text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                  Visit Original Article
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-xl overflow-hidden my-8 animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Edit Article Content</h3>
              <button onClick={() => setEditingArticle(null)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 capitalize"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Author</label>
                  <input
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Source Name</label>
                  <input
                    type="text"
                    value={editForm.sourceName}
                    onChange={(e) => setEditForm({ ...editForm, sourceName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows="2"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Content Body</label>
                <textarea
                  rows="5"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-xs font-semibold text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
