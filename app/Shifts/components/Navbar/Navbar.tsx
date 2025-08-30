"use client";

import React, { useState, useEffect, useRef } from "react";
import { IoMenu } from "react-icons/io5";

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

interface UserData {
  Firstname: string;
  Email: string;
  ReferenceID?: string;
  TargetQuota?: string;
  Role?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onToggleTheme,
  isDarkMode,
}) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userReferenceId, setUserReferenceId] = useState("");
  const [targetQuota, setTargetQuota] = useState("");
  const [role, setRole] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sync dark mode class and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");
      if (!userId) return;

      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data: UserData = await res.json();

        setUserName(data.Firstname);
        setUserEmail(data.Email);
        setUserReferenceId(data.ReferenceID || "");
        setTargetQuota(data.TargetQuota || "");
        setRole(data.Role || "");
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <nav
      className={`sticky top-0 z-[999] flex justify-between items-center p-4 transition-all duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center space-x-4">
        {/* Menu button → visible only on mobile */}
        <button
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          aria-label="Toggle sidebar menu"
          className="lg:hidden flex items-center gap-2 bg-cyan-600 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <IoMenu size={20} />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
