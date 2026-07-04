import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLogOut,
  FiBookmark,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiBarChart2,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import toast from "react-hot-toast";
import apiClient from "../api/client";

const Profile = () => {
  const { user, logout, refreshProfile } = useAuth();
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  const [zodiacSign, setZodiacSign] = useState(user?.zodiacSign || "");
  const [savingZodiac, setSavingZodiac] = useState(false);

  // Blog states
  const [myBlogs, setMyBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // Admin states
  const [adminBlogs, setAdminBlogs] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const fetchMyBlogs = useCallback(async () => {
    try {
      const res = await apiClient.get("/blogs/my-blogs");
      if (res.data?.success) {
        setMyBlogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your blogs.");
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  const fetchAdminDashboard = useCallback(async () => {
    if (user?.role !== "admin") return;
    setLoadingAdmin(true);
    try {
      const [blogsRes, statsRes] = await Promise.all([
        apiClient.get("/admin/blogs?status=Pending"),
        apiClient.get("/admin/blogs/stats"),
      ]);
      if (blogsRes.data?.success) {
        setAdminBlogs(blogsRes.data.data);
      }
      if (statsRes.data?.success) {
        setAdminStats(statsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin dashboard.");
    } finally {
      setLoadingAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.zodiacSign) {
      setZodiacSign(user.zodiacSign);
    }
    fetchMyBlogs();
    if (user?.role === "admin") {
      fetchAdminDashboard();
    }
  }, [user, fetchMyBlogs, fetchAdminDashboard]);

  const handleLogout = () => {
    logout();
    toast.success("You have been signed out.");
    navigate("/");
  };

  const handleSaveZodiac = async () => {
    if (!zodiacSign) {
      toast.error("Please select a valid zodiac sign.");
      return;
    }
    setSavingZodiac(true);
    try {
      const response = await apiClient.put("/auth/zodiac", { zodiacSign });
      if (response.data?.success) {
        toast.success("Zodiac sign updated successfully!");
        await refreshProfile();
      } else {
        toast.error("Failed to update zodiac sign.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save zodiac sign.");
    } finally {
      setSavingZodiac(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    try {
      const res = await apiClient.delete(`/blogs/${blogId}`);
      if (res.data?.success) {
        toast.success("Blog deleted successfully.");
        fetchMyBlogs();
        if (user?.role === "admin") fetchAdminDashboard();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting blog.");
    }
  };

  const handleAdminDeleteBlog = async (blogId) => {
    if (!window.confirm("Delete this blog as admin? This action cannot be undone.")) return;
    try {
      const res = await apiClient.delete(`/admin/blogs/${blogId}`);
      if (res.data?.success) {
        toast.success("Blog deleted by admin.");
        fetchAdminDashboard();
        fetchMyBlogs();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting blog.");
    }
  };

  const handleApproveBlog = async (blogId) => {
    try {
      const res = await apiClient.post(`/admin/blogs/${blogId}/approve`);
      if (res.data?.success) {
        toast.success("Blog approved and published!");
        fetchAdminDashboard();
        fetchMyBlogs(); // Refresh public list in case of author matches
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving blog.");
    }
  };

  const handleRejectBlog = async (blogId) => {
    const reason = window.prompt("Please enter a reason for rejection:");
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    try {
      const res = await apiClient.post(`/admin/blogs/${blogId}/reject`, { reason });
      if (res.data?.success) {
        toast.success("Blog rejected successfully.");
        fetchAdminDashboard();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting blog.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Draft":
      default:
        return "bg-charcoal-50 text-charcoal-600 border-charcoal-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 space-y-8 sm:space-y-12">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 justify-between border-b border-charcoal-100 pb-6 sm:pb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-charcoal-950 flex items-center justify-center shrink-0">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase">
              {user?.username?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal-950">{user?.username}</h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">{user?.email}</p>
            {user?.role === "admin" && (
              <span className="inline-block mt-2 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                Admin Panel Access Active
              </span>
            )}
          </div>
        </div>

        <Link
          to="/blogs/new"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow touch-manipulation"
        >
          <FiPlus className="h-4.5 w-4.5" /> Write New Blog
        </Link>
      </div>

      {/* Grid: Account Info + My Bookmarks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Account Info */}
        <div className="md:col-span-2 border border-charcoal-100 rounded-xl bg-white p-5 sm:p-6 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500 border-b border-charcoal-100 pb-3">
            Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <FiUser className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Username</p>
                <p className="text-sm font-semibold text-charcoal-900">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Email Address</p>
                <p className="text-sm font-semibold text-charcoal-900 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Mobile Number</p>
                <p className="text-sm font-semibold text-charcoal-900">{user?.phoneNumber || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiCalendar className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Zodiac Sign Preference</p>
                <div className="flex gap-2 mt-1">
                  <select
                    value={zodiacSign}
                    onChange={(e) => setZodiacSign(e.target.value)}
                    className="px-2 py-1.5 text-xs bg-charcoal-50 border border-charcoal-200 rounded focus:outline-none focus:border-charcoal-800 touch-manipulation"
                  >
                    <option value="">Select sign</option>
                    <option value="aries">Aries (♈)</option>
                    <option value="taurus">Taurus (♉)</option>
                    <option value="gemini">Gemini (♊)</option>
                    <option value="cancer">Cancer (♋)</option>
                    <option value="leo">Leo (♌)</option>
                    <option value="virgo">Virgo (♍)</option>
                    <option value="libra">Libra (♎)</option>
                    <option value="scorpio">Scorpio (♏)</option>
                    <option value="sagittarius">Sagittarius (♐)</option>
                    <option value="capricorn">Capricorn (♑)</option>
                    <option value="aquarius">Aquarius (♒)</option>
                    <option value="pisces">Pisces (♓)</option>
                  </select>
                  <button
                    onClick={handleSaveZodiac}
                    disabled={savingZodiac || zodiacSign === (user?.zodiacSign || "")}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-charcoal-900 hover:bg-charcoal-850 rounded disabled:opacity-50 transition-colors touch-manipulation"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarks & Quick stats */}
        <div className="border border-charcoal-100 rounded-xl bg-white p-5 sm:p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500 border-b border-charcoal-100 pb-3">
              Favorites
            </h2>
            <div className="flex items-center justify-between p-4 border border-charcoal-100 rounded-lg">
              <div>
                <span className="font-serif text-3xl font-black text-charcoal-900">{bookmarks.length}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mt-1">Saved Articles</p>
              </div>
              <Link
                to="/bookmarks"
                className="flex items-center justify-center h-10 w-10 rounded-full border border-charcoal-100 hover:bg-charcoal-50 text-charcoal-700 transition-all touch-manipulation"
              >
                <FiBookmark className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors touch-manipulation"
          >
            <FiLogOut className="h-4.5 w-4.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Admin Dashboard Section */}
      {user?.role === "admin" && (
        <div className="border border-charcoal-100 rounded-xl bg-white p-5 sm:p-6 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500 border-b border-charcoal-100 pb-3 flex items-center gap-2">
            <FiBarChart2 className="h-4 w-4" /> Admin Blog Moderation Board
          </h2>

          {/* Stats grid */}
          {adminStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="border border-charcoal-100 rounded-lg p-3 sm:p-4 text-center">
                <span className="font-serif text-xl sm:text-2xl font-black text-amber-600">{adminStats.Pending || 0}</span>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mt-0.5">Pending Review</p>
              </div>
              <div className="border border-charcoal-100 rounded-lg p-3 sm:p-4 text-center">
                <span className="font-serif text-xl sm:text-2xl font-black text-green-600">{adminStats.Approved || 0}</span>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mt-0.5">Approved</p>
              </div>
              <div className="border border-charcoal-100 rounded-lg p-3 sm:p-4 text-center">
                <span className="font-serif text-xl sm:text-2xl font-black text-charcoal-800">{adminStats.totalViews || 0}</span>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mt-0.5">Total Views</p>
              </div>
              <div className="border border-charcoal-100 rounded-lg p-3 sm:p-4 text-center">
                <span className="font-serif text-xl sm:text-2xl font-black text-red-600">{adminStats.Rejected || 0}</span>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mt-0.5">Rejected</p>
              </div>
            </div>
          )}

          {/* Pending Submissions Table/List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-charcoal-800">Pending Approvals</h3>
            {loadingAdmin ? (
              <div className="text-center py-6 text-charcoal-400 text-xs">Loading board...</div>
            ) : adminBlogs.length === 0 ? (
              <div className="text-center py-8 bg-charcoal-50/50 rounded-lg text-charcoal-400 text-xs font-semibold">
                No articles currently pending review. Good job!
              </div>
            ) : (
              <div className="divide-y divide-charcoal-100 border border-charcoal-100 rounded-lg overflow-hidden">
                {adminBlogs.map((blog) => (
                  <div key={blog._id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 hover:bg-charcoal-50/50 transition-colors">
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-charcoal-900 truncate">{blog.title}</h4>
                      <p className="text-xs text-charcoal-500 mt-1">
                        By <span className="font-semibold">{blog.author?.username}</span> • {blog.category}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <Link
                        to={`/blogs/${blog._id}`}
                        target="_blank"
                        className="flex-1 md:flex-none text-center px-3 py-2 border border-charcoal-200 rounded text-xs font-semibold text-charcoal-700 hover:bg-white touch-manipulation"
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() => handleApproveBlog(blog._id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors touch-manipulation"
                      >
                        <FiCheck className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectBlog(blog._id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-650 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors touch-manipulation"
                      >
                        <FiX className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleAdminDeleteBlog(blog._id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-charcoal-900 text-white rounded text-xs font-semibold hover:bg-charcoal-800 transition-colors touch-manipulation"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Dashboard Panel ("My Blogs") */}
      <div className="border border-charcoal-100 rounded-xl bg-white p-5 sm:p-6 space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500 border-b border-charcoal-100 pb-3">
          My Publications & Drafts
        </h2>

        {loadingBlogs ? (
          <div className="text-center py-10 text-charcoal-400 text-xs">Loading publications...</div>
        ) : myBlogs.length === 0 ? (
          <div className="text-center py-12 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200 space-y-3">
            <p className="text-charcoal-500 font-medium text-sm">You haven't written any blogs yet.</p>
            <Link
              to="/blogs/new"
              className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 hover:underline touch-manipulation"
            >
              Write your first story →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myBlogs.map((blog) => (
              <div
                key={blog._id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-charcoal-100 rounded-lg hover:shadow-xs transition-shadow gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900">{blog.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(
                        blog.status
                      )}`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    Category: <span className="font-semibold text-charcoal-700">{blog.category}</span> • Edited:{" "}
                    {new Date(blog.updatedAt).toLocaleDateString("en-US")}
                  </p>
                  {blog.status === "Rejected" && blog.rejectionReason && (
                    <p className="text-xs text-red-650 bg-red-50 p-2 rounded border border-red-100 font-medium">
                      Rejection Reason: {blog.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  {blog.status === "Approved" && (
                    <Link
                      to={`/blogs/${blog._id}`}
                      className="flex-1 md:flex-none text-center px-3 py-2 border border-charcoal-200 rounded text-xs font-semibold text-charcoal-700 hover:bg-charcoal-55 touch-manipulation"
                    >
                      View
                    </Link>
                  )}
                  {(blog.status === "Draft" || blog.status === "Rejected") && (
                    <Link
                      to={`/blogs/edit/${blog._id}`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 border border-charcoal-200 rounded text-xs font-semibold text-charcoal-700 hover:bg-charcoal-55 touch-manipulation"
                    >
                      <FiEdit2 className="h-3 w-3" /> Edit
                    </Link>
                  )}
                  {blog.status !== "Deleted" && (
                    <button
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 border border-red-200 rounded text-xs font-semibold text-red-600 hover:bg-red-50 touch-manipulation"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
