import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiBookmark, FiUser, FiLogOut, FiMenu, FiX, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import usePrefetch from "../hooks/usePrefetch";

const CATEGORIES = [
  { id: "general", name: "General" },
  { id: "business", name: "Business" },
  { id: "technology", name: "Technology" },
  { id: "science", name: "Science" },
  { id: "health", name: "Health" },
  { id: "sports", name: "Sports" },
  { id: "entertainment", name: "Entertainment" },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { bookmarks } = useBookmarks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Prefetch hook — only wired to desktop links (Task 4.1)
  const { handleMouseEnter, handleMouseLeave } = usePrefetch();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-charcoal-100/80 backdrop-blur-md bg-white/95">
      {/* ─── Main header row ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ── Mobile: Left side — Hamburger (hidden md+) ─────────── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 -ml-3 text-charcoal-600 hover:text-charcoal-900 md:hidden transition-colors touch-manipulation"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className={`transition-transform duration-300 ${mobileMenuOpen ? "rotate-90" : "rotate-0"}`}>
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </div>
          </button>

          {/* ── Logo ───────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-charcoal-900 hover:opacity-90 transition-opacity">
              NEUZGO
            </span>
          </Link>

          {/* ── Desktop Navigation Links (hidden below md) ─────────── */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {CATEGORIES.map((cat) => (
              <NavLink
                key={cat.id}
                to={`/category/${cat.id}`}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-150 border-b-2 ${
                    isActive
                      ? "border-charcoal-900 text-charcoal-900"
                      : "border-transparent text-charcoal-500 hover:text-charcoal-900"
                  }`
                }
                onMouseEnter={() =>
                  handleMouseEnter(cat.id, { country: "in", language: "en", limit: 12 })
                }
                onMouseLeave={handleMouseLeave}
              >
                {cat.name}
              </NavLink>
            ))}
            <NavLink
              to="/horoscope"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-150 border-b-2 ${
                  isActive
                    ? "border-charcoal-900 text-charcoal-900"
                    : "border-transparent text-charcoal-500 hover:text-charcoal-900"
                }`
              }
            >
              Horoscope
            </NavLink>
            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-150 border-b-2 ${
                  isActive
                    ? "border-charcoal-900 text-charcoal-900"
                    : "border-transparent text-charcoal-500 hover:text-charcoal-900"
                }`
              }
            >
              Journal
            </NavLink>
          </nav>

          {/* ── Utility Controls ───────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search trigger — desktop inline expansion / mobile: icon only (overlay handles it) */}
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="search"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 md:w-60 px-3 py-2 text-sm bg-charcoal-50 border border-charcoal-200 rounded-md focus:outline-none focus:border-charcoal-800 transition-all"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                  aria-label="Search"
                >
                  <FiSearch className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mobile search icon — opens the full-width overlay */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-charcoal-600 hover:text-charcoal-900 transition-colors sm:hidden touch-manipulation"
              aria-label="Search"
            >
              <FiSearch className="h-5 w-5" />
            </button>

            {/* Bookmarks */}
            <Link
              to="/bookmarks"
              className="relative p-2.5 text-charcoal-600 hover:text-charcoal-900 transition-colors touch-manipulation"
              aria-label={`Bookmarks${isAuthenticated && bookmarks.length > 0 ? `, ${bookmarks.length} saved` : ""}`}
            >
              <FiBookmark className="h-5 w-5" />
              {isAuthenticated && bookmarks.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-amber text-[9px] font-bold text-white pointer-events-none">
                  {bookmarks.length > 9 ? "9+" : bookmarks.length}
                </span>
              )}
            </Link>

            {/* User Access */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-charcoal-700 hover:text-charcoal-900 transition-colors rounded"
                >
                  <FiUser className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline truncate max-w-[100px]">{user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 text-charcoal-600 hover:text-accent-amber transition-colors touch-manipulation"
                  aria-label="Log out"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 px-3 sm:px-4 py-2 text-xs font-semibold tracking-wider text-white bg-charcoal-900 hover:bg-charcoal-800 rounded transition-colors uppercase touch-manipulation"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Full-Width Search Overlay ────────────────────── */}
      {searchOpen && (
        <div className="sm:hidden absolute inset-x-0 top-0 z-50 bg-white border-b border-charcoal-200 shadow-md">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 h-16 px-3"
          >
            {/* Back / close button */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="p-2.5 text-charcoal-600 hover:text-charcoal-900 flex-shrink-0 touch-manipulation"
              aria-label="Close search"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>

            {/* Input — takes remaining space */}
            <input
              type="search"
              placeholder="Search articles, sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 px-4 py-2.5 text-base bg-charcoal-50 border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-800 transition-all"
              autoFocus
            />

            {/* Submit */}
            <button
              type="submit"
              className="flex-shrink-0 px-4 py-2.5 bg-charcoal-900 text-white text-sm font-semibold rounded-lg hover:bg-charcoal-800 transition-colors touch-manipulation"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* ─── Mobile Menu Drawer ───────────────────────────────────── */}
      {/* Backdrop — tap anywhere outside drawer to close */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-charcoal-950/20 md:hidden"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`md:hidden relative z-40 overflow-hidden transition-all duration-300 ease-in-out border-t border-charcoal-100 bg-white shadow-inner ${
          mobileMenuOpen ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrollable drawer body */}
        <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">

          {/* User identity strip — only when authenticated */}
          {isAuthenticated && (
            <div className="px-4 py-4 bg-charcoal-50 border-b border-charcoal-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                <FiUser className="h-4 w-4 text-charcoal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal-900 truncate">{user?.username}</p>
                <p className="text-xs text-charcoal-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div className="px-3 py-3 space-y-0.5">
            {CATEGORIES.map((cat) => (
              <NavLink
                key={cat.id}
                to={`/category/${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-charcoal-50 text-charcoal-950 font-semibold"
                      : "text-charcoal-600 hover:bg-charcoal-50/70 hover:text-charcoal-900"
                  }`
                }
              >
                {cat.name}
              </NavLink>
            ))}
            <NavLink
              to="/horoscope"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-charcoal-50 text-charcoal-950 font-semibold"
                    : "text-charcoal-600 hover:bg-charcoal-50/70 hover:text-charcoal-900"
                }`
              }
            >
              Horoscope
            </NavLink>
            <NavLink
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-charcoal-50 text-charcoal-950 font-semibold"
                    : "text-charcoal-600 hover:bg-charcoal-50/70 hover:text-charcoal-900"
                }`
              }
            >
              Journal
            </NavLink>
          </div>

          {/* Authenticated user actions */}
          {isAuthenticated ? (
            <div className="px-3 pb-4 pt-1 border-t border-charcoal-100 mt-1 space-y-0.5">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-base font-medium text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
              >
                <FiUser className="h-5 w-5 flex-shrink-0" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/bookmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-base font-medium text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
              >
                <FiBookmark className="h-5 w-5 flex-shrink-0" />
                <span>Saved Articles</span>
                {bookmarks.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent-amber text-[10px] font-bold text-white">
                    {bookmarks.length > 9 ? "9+" : bookmarks.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-3 text-base font-medium text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors text-left touch-manipulation"
              >
                <FiLogOut className="h-5 w-5 flex-shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* Not authenticated — show sign-in CTA in drawer */
            <div className="px-4 pb-5 pt-2 border-t border-charcoal-100 mt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-charcoal-950 text-white text-sm font-bold rounded-lg hover:bg-charcoal-800 transition-colors uppercase tracking-wider touch-manipulation"
              >
                Sign In
              </Link>
              <p className="text-center text-xs text-charcoal-400 mt-3">
                New here?{" "}
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-charcoal-700 hover:text-charcoal-900"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
