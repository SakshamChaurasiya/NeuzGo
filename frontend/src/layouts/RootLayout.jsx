import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RootLayout = () => {
  const { pathname } = useLocation();

  // Scroll to top on every route change for clean navigation UX
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

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
