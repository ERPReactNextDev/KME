"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Roboto } from "next/font/google";

// Load Roboto font with weights 400 & 700
const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

interface ParentLayoutProps {
  children: ReactNode;
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setUserId(id);

    // Detect mobile viewport width < 768px
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // If desktop, sidebar should always be open
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    } else {
      document.body.style.overflow = "";
    }
  }, [isSidebarOpen, isMobile]);

  return (
    <div
      className={`${roboto.variable} font-sans flex ${
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-screen z-50 transform transition-transform duration-300 
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} 
        ${isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        shadow-lg md:shadow-none`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Overlay for mobile only */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-grow transition-all duration-300 relative z-10 md:ml-64">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          isDarkMode={isDarkMode}
        />
        <main className="p-4 min-h-screen">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default ParentLayout;
