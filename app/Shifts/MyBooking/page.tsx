"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiOutlineMail, HiOutlineUser, HiOutlineCalendar, HiOutlineUsers, HiOutlineClipboardList, HiOutlineBriefcase } from "react-icons/hi";

interface Booking {
  BookNumber: string;
  Email: string;
  Fullname: string;
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

const MyBooking: React.FC = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/Shifts/GetBooking?query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.bookings || []);
      } else {
        setResults([]);
        alert(data.error || "Failed to fetch bookings.");
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      alert("An error occurred while fetching bookings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-xs flex flex-col items-center">
      <h2 className="text-lg font-bold text-gray-700 mb-6">My Bookings</h2>

      {/* Search + Back Button */}
      <div className="w-full max-w-md flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Book Number, Email, or Fullname"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg text-xs"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        <Link
          href="/Book"
          className="px-4 py-2 bg-gray-300 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs flex items-center justify-center"
        >
          Back to Home
        </Link>
      </div>

      {/* Results */}
      <div className="w-full max-w-3xl space-y-4">
        {results.length === 0 && !loading && (
          <p className="text-gray-400 text-xs text-center">No bookings found.</p>
        )}

        {results.map((booking, index) => (
          <div
            key={`${booking.BookNumber}-${index}`}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-sm">Book Number: {booking.BookNumber}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  statusColors[booking.Status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.Status}
              </span>
            </div>

            <div className="space-y-1 text-gray-700">
              <p className="flex items-center gap-1"><HiOutlineMail className="inline" /> {booking.Email}</p>
              <p className="flex items-center gap-1"><HiOutlineUser className="inline" /> {booking.Fullname}</p>
              <p className="flex items-center gap-1"><HiOutlineCalendar className="inline" /> Start: {new Date(booking.StartDate).toLocaleString()}</p>
              <p className="flex items-center gap-1"><HiOutlineCalendar className="inline" /> End: {new Date(booking.EndDate).toLocaleString()}</p>
              <p className="flex items-center gap-1"><HiOutlineUsers className="inline" /> Attendance: {booking.Attendance}</p>
              <p className="flex items-center gap-1"><HiOutlineClipboardList className="inline" /> Capacity: {booking.Capacity}</p>
              <p className="flex items-center gap-1"><HiOutlineBriefcase className="inline" /> Purpose: {booking.Purpose}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBooking;
