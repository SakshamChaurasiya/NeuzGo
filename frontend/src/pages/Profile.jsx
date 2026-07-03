import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLogOut, FiBookmark, FiCalendar } from "react-icons/fi";
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

  useEffect(() => {
    if (user?.zodiacSign) {
      setZodiacSign(user.zodiacSign);
    }
  }, [user]);

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
            <div className="flex items-start gap-3 pt-2">
              <span className="text-xl leading-none">✨</span>
              <div className="flex-1 space-y-1">
                <label htmlFor="zodiacSelect" className="text-[11px] uppercase font-bold tracking-wider text-charcoal-400">Zodiac Sign</label>
                <div className="flex gap-2">
                  <select
                    id="zodiacSelect"
                    value={zodiacSign}
                    onChange={(e) => setZodiacSign(e.target.value)}
                    className="w-full max-w-xs px-3 py-1.5 text-sm bg-charcoal-50 border border-charcoal-200 rounded-md focus:outline-none focus:border-charcoal-800"
                  >
                    <option value="">Select Zodiac Sign</option>
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
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-charcoal-900 hover:bg-charcoal-850 rounded disabled:opacity-50 transition-colors uppercase cursor-pointer"
                  >
                    {savingZodiac ? "Saving..." : "Save"}
                  </button>
                </div>
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
