import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiGrid,
  FiFileText,
  FiEdit,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out from admin panel.");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: FiGrid },
    { name: "News Articles", path: "/admin/news", icon: FiFileText },
    { name: "User Blogs", path: "/admin/blogs", icon: FiEdit },
    { name: "Users", path: "/admin/users", icon: FiUsers },
    { name: "Approvals Queue", path: "/admin/requests", icon: FiCheckSquare },
    { name: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
    { name: "Settings", path: "/admin/settings", icon: FiSettings }
  ];

  const currentRouteName = menuItems.find(item => item.path === location.pathname)?.name || "Admin Panel";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/news?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* 1. Mobile Sidebar Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 2. Sidebar component (Desktop + Mobile drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 transform lg:static lg:translate-x-0 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-slate-950/40 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-3 font-serif font-black tracking-widest text-white">
            <span className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white font-sans text-sm font-bold">NG</span>
            {!collapsed && <span className="text-lg">NEUZGO</span>}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "hover:bg-slate-800/50 hover:text-slate-100"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/20">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/30">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs uppercase flex-shrink-0">
                  {user?.username?.substring(0, 2) || "AD"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.username || "Admin User"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || "admin@neuzgo.com"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200/80 shadow-sm shadow-gray-100/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500 lg:hidden"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 hidden lg:block"
            >
              {collapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
            </button>
            
            <h1 className="text-lg font-bold text-gray-800 hidden md:block">
              {currentRouteName}
            </h1>
          </div>

          {/* Search bar & profile menu */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Global news search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </form>

            {/* Notifications */}
            <Link to="/admin/requests" className="relative p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Link>

            {/* Admin Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user?.username?.substring(0, 2).toUpperCase() || "AD"}
                </div>
                <span className="text-xs font-semibold text-gray-700 hidden sm:block">
                  {user?.username || "Admin"}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.username}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiSettings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
