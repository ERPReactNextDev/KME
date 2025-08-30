"use client";

import React, { useState, useEffect, useRef } from "react";
import { IoMenu, IoNotificationsOutline, IoClose } from "react-icons/io5";

interface NavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

interface Booking {
  BookNumber: string;
  Fullname: string;
  Email: string;
  StartDate: string;
  EndDate: string;
  Attendance: string;
  Capacity: string;
  Purpose: string;
  Status: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onToggleTheme, isDarkMode }) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [prevCount, setPrevCount] = useState(0); // Track previous pending count

  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch pending bookings every 10 seconds (or desired interval)
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/Shifts/GetPendingBooking");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        const bookings: Booking[] = data.bookings || [];

        // Play sound if new bookings arrived
        if (bookings.length > prevCount && bookings.length > 0) {
          audioRef.current?.play();
        }

        setPrevCount(bookings.length);
        setPendingBookings(bookings);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 10000); // every 10s
    return () => clearInterval(interval);
  }, [prevCount]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Notifications"
        >
          <IoNotificationsOutline size={24} />
          {pendingBookings.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {pendingBookings.length}
            </span>
          )}
        </button>

        {/* Notification Modal */}
        {showNotifications && (
          <div
            ref={notificationRef}
            className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm">Pending Bookings</h4>
              <button onClick={() => setShowNotifications(false)} className="p-1">
                <IoClose size={18} />
              </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingBookings.length === 0 ? (
                <li className="p-4 text-xs text-gray-500 text-center">No pending bookings</li>
              ) : (
                pendingBookings.map((b, idx) => (
                  <li
                    key={`${b.BookNumber}-${idx}`}
                    className="px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{b.Fullname}</p>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-semibold ${
                          statusColors[b.Status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {b.Status}
                      </span>
                    </div>
                    <p>Book #: {b.BookNumber}</p>
                    <p>Email: {b.Email}</p>
                    <p>Attendance: {b.Attendance}</p>
                    <p>Capacity: {b.Capacity}</p>
                    <p>Purpose: {b.Purpose}</p>
                    <p>Start: {new Date(b.StartDate).toLocaleString()}</p>
                    <p>End: {new Date(b.EndDate).toLocaleString()}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Audio element */}
      <audio ref={audioRef} src="/new-notification.mp3" preload="auto" />
    </nav>
  );
};

export default Navbar;
