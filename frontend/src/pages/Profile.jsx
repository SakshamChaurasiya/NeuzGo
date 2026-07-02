import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLogOut, FiBookmark, FiCalendar } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, logout } = useAuth();
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("You have been signed out.");
    navigate("/");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-10">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-charcoal-950 flex items-center justify-center shrink-0">
          <span className="font-serif text-3xl font-bold text-white uppercase">
            {user?.username?.charAt(0) || "?"}
          </span>
        </div>

        <div>
          <h1 className="font-serif text-3xl font-extrabold text-charcoal-950">{user?.username}</h1>
          <p className="text-sm text-charcoal-500 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border border-charcoal-100 rounded-lg p-5 text-center space-y-1">
          <span className="font-serif text-3xl font-black text-charcoal-900">{bookmarks.length}</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">Saved Articles</p>
        </div>
        <div className="border border-charcoal-100 rounded-lg p-5 text-center space-y-1">
          <span className="font-serif text-3xl font-black text-charcoal-900">∞</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">Stories Available</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="border border-charcoal-100 rounded-lg divide-y divide-charcoal-100">
        <div className="px-6 py-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500 mb-4">
            Account Information
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <FiUser className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Username</p>
                <p className="text-sm font-semibold text-charcoal-900">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Email Address</p>
                <p className="text-sm font-semibold text-charcoal-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="h-5 w-5 text-charcoal-400 shrink-0" />
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Mobile Number</p>
                <p className="text-sm font-semibold text-charcoal-900">{user?.phoneNumber || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="px-6 py-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-500 mb-4">
            Quick Access
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/bookmarks"
              className="flex items-center gap-2 px-4 py-2 border border-charcoal-200 rounded-lg text-sm font-semibold text-charcoal-800 hover:bg-charcoal-50 transition-colors"
            >
              <FiBookmark className="h-4 w-4" />
              My Bookmarks
              {bookmarks.length > 0 && (
                <span className="ml-1 bg-accent-amber text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {bookmarks.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-charcoal-100 pt-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="h-4.5 w-4.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
