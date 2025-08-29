"use client";

import React from "react";
import { toast } from "react-toastify";
import Link from "next/link";

interface FormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  fullname: string;
  setFullname: React.Dispatch<React.SetStateAction<string>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  attendance: string;
  setAttendance: React.Dispatch<React.SetStateAction<string>>;
  capacity: string;
  setCapacity: React.Dispatch<React.SetStateAction<string>>;
  purpose: string;
  setPurpose: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  bookNumber: string;
}

const Form: React.FC<FormProps> = ({
  email,
  setEmail,
  fullname,
  setFullname,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  attendance,
  setAttendance,
  capacity,
  setCapacity,
  purpose,
  setPurpose,
  loading,
  handleSubmit,
  bookNumber,
}) => {
  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {/* Book Number */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Book Number</label>
        <input
          type="text"
          value={bookNumber}
          readOnly
          className="w-full px-2 py-2 border rounded-lg bg-gray-100 text-gray-700 text-xs"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          required
        />
      </div>

      {/* Full Name */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          placeholder="John Doe"
          className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          required
        />
      </div>

      {/* Start & End Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
            required
          />
        </div>
      </div>

      {/* Attendance */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Number of Attendance</label>
        <div className="flex flex-wrap gap-3">
          {["1-5", "6-10", "11-20", "21+"].map((num) => (
            <label key={num} className="flex items-center gap-1">
              <input
                type="radio"
                name="attendance"
                value={num}
                checked={attendance === num}
                onChange={(e) => setAttendance(e.target.value)}
                className="form-radio text-cyan-500"
              />
              <span className="text-gray-700 text-xs">{num}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Room Capacity</label>
        <div className="flex flex-wrap gap-3">
          {["Small", "Medium", "Large"].map((cap) => (
            <label key={cap} className="flex items-center gap-1">
              <input
                type="radio"
                name="capacity"
                value={cap}
                checked={capacity === cap}
                onChange={(e) => setCapacity(e.target.value)}
                className="form-radio text-cyan-500"
              />
              <span className="text-gray-700 text-xs">{cap}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Purpose</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          required
        >
          <option value="">Select purpose</option>
          <option value="Meeting">Meeting</option>
          <option value="Training">Training</option>
          <option value="Workshop">Workshop</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all duration-300 shadow-md disabled:opacity-60 text-xs"
      >
        {loading ? "Booking..." : "Reserve"}
      </button>

      <Link
        href="/Shifts/MyBooking"
        className="w-full py-2 mt-2 bg-gray-300 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-300 text-xs text-center block"
      >
        View My Book Number
      </Link>
    </form>
  );
};

export default Form;
