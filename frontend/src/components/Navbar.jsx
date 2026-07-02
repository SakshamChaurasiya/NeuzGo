import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiBookmark, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-charcoal-600 hover:text-charcoal-900 md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-serif text-2xl font-black tracking-tight text-charcoal-900 hover:opacity-90 transition-opacity">
              NEUFEED
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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
              >
                {cat.name}
              </NavLink>
            ))}
          </nav>

          {/* Utility Controls */}
          <div className="flex items-center space-x-4">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="search"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-60 px-3 py-1.5 text-sm bg-charcoal-50 border border-charcoal-200 rounded-md focus:outline-none focus:border-charcoal-800 transition-all"
                    autoFocus
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                  aria-label="Search"
                >
                  <FiSearch className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Bookmarks */}
            <Link
              to="/bookmarks"
              className="relative p-2 text-charcoal-600 hover:text-charcoal-900 transition-colors"
              aria-label="Bookmarks"
            >
              <FiBookmark className="h-5 w-5" />
              {isAuthenticated && bookmarks.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-amber text-[9px] font-bold text-white">
                  {bookmarks.length}
                </span>
              )}
            </Link>

            {/* User Access */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-charcoal-700 hover:text-charcoal-900 transition-colors"
                >
                  <FiUser className="h-4.5 w-4.5" />
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-charcoal-600 hover:text-accent-amber transition-colors"
                  aria-label="Log out"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold tracking-wider text-white bg-charcoal-900 hover:bg-charcoal-850 rounded transition-colors uppercase"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-100 bg-white px-4 pt-2 pb-6 space-y-1 shadow-inner animate-fade-in">
          {CATEGORIES.map((cat) => (
            <NavLink
              key={cat.id}
              to={`/category/${cat.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded ${
                  isActive ? "bg-charcoal-50 text-charcoal-950" : "text-charcoal-600 hover:bg-charcoal-50/50 hover:text-charcoal-900"
                }`
              }
            >
              {cat.name}
            </NavLink>
          ))}
          {isAuthenticated && (
            <div className="pt-4 border-t border-charcoal-100 mt-4 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-charcoal-700 rounded hover:bg-charcoal-50"
              >
                <FiUser className="h-5 w-5" />
                <span>My Profile ({user?.username})</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-base font-medium text-charcoal-700 rounded hover:bg-charcoal-50 text-left"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
