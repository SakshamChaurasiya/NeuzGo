import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Premium Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <Footer />
    </div>
  );
};

export default RootLayout;
