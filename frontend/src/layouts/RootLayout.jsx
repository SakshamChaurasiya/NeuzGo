import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigationState } from "../contexts/NavigationStateContext";

const getSessionKey = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/category/")) {
    const parts = pathname.split("/");
    const catId = parts[2];
    return `category-${catId}`;
  }
  if (pathname.startsWith("/search")) return "search";
  return null;
};

const RootLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const { getNavigationState, setNavigationState } = useNavigationState();
  const prevPathnameRef = useRef(pathname);

  // Scroll handler and scroll-saver on route change
  useEffect(() => {
    const prevPath = prevPathnameRef.current;
    if (prevPath !== pathname) {
      const prevKey = getSessionKey(prevPath);
      if (prevKey) {
        setNavigationState(prevKey, { scrollY: window.scrollY });
      }
      prevPathnameRef.current = pathname;
    }

    // Only scroll to top if there is no saved scroll position for the destination page
    const newKey = getSessionKey(pathname);
    const savedState = newKey ? getNavigationState(newKey) : null;
    if (!savedState || typeof savedState.scrollY !== "number") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, getNavigationState, setNavigationState]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Sticky Premium Navbar */}
      <Navbar />

      {/* Main Content Area — animated on each page load */}
      <main
        key={pathname}
        className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in"
      >
        <Outlet />
      </main>

      {/* Premium Footer */}
      <Footer />
    </div>
  );
};

export default RootLayout;
