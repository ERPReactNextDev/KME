"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { MdSave, MdVisibility } from "react-icons/md";

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
  otherPurpose: string;
  setOtherPurpose: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  bookNumber: string;
  showTutorial: boolean;
  tutorialStep: number;
  setTutorialStep: React.Dispatch<React.SetStateAction<number>>;
}

const Form: React.FC<FormProps> = ({
  email, setEmail,
  fullname, setFullname,
  startDate, setStartDate,
  endDate, setEndDate,
  attendance, setAttendance,
  capacity, setCapacity,
  purpose, setPurpose,
  otherPurpose, setOtherPurpose,
  location, setLocation,
  loading, handleSubmit,
  bookNumber,
  showTutorial, tutorialStep, setTutorialStep
}) => {
  const [roomOptions, setRoomOptions] = useState<string[]>([]);
  const [durationText, setDurationText] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");

  const todayISOString = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    if (location === "JNL Building") setRoomOptions(["Room 211 - Meeting Room"]);
    else if (location === "Primex Building")
      setRoomOptions(["Integrity", "Competence", "Discipline", "Teamwork"]);
    else setRoomOptions([]);
    setCapacity(""); // reset selected room
  }, [location]);

  // Helper: check if date is Sunday
  const isSunday = (dateStr: string) => new Date(dateStr).getDay() === 0;

  // Helper: skip to next non-Sunday date
  const skipSunday = (dateStr: string) => {
    let d = new Date(dateStr);
    while (d.getDay() === 0) { // Sunday
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().slice(0, 16);
  };

  // Adjust startDate & endDate to skip Sundays automatically
  useEffect(() => {
    if (startDate && isSunday(startDate)) {
      setStartDate(skipSunday(startDate));
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate && isSunday(endDate)) {
      setEndDate(skipSunday(endDate));
    }
  }, [endDate]);

  // Compute duration & validate
  useEffect(() => {
    if (!startDate || !endDate) {
      setDurationText("");
      setTimeError("");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      setTimeError("Start date/time cannot be in the past.");
      setDurationText("");
      return;
    }

    if (start.getTime() === end.getTime()) {
      setTimeError("Start and End date/time cannot be the same.");
      setDurationText("");
      return;
    } else if (end < start) {
      setTimeError("End date/time cannot be before Start date/time.");
      setDurationText("");
      return;
    }

    setTimeError("");
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    setDurationText(`Duration: ${hours > 0 ? `${hours} hr ` : ""}${minutes} min`);
  }, [startDate, endDate]);

  // Auto-adjust endDate if startDate changes
  useEffect(() => {
    if (startDate && (!endDate || new Date(endDate) < new Date(startDate))) {
      setEndDate(startDate);
    }
  }, [startDate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeError) {
      toast.error("Please fix the date/time errors before submitting.");
      return;
    }
    await handleSubmit(e);
  };

  useEffect(() => {
    let rooms: string[] = [];

    if (location === "JNL Building") {
      rooms = ["Room 211 - Meeting Room"];
    } else if (location === "Primex Building") {
      switch (attendance) {
        case "1-6":
          rooms = ["Integrity", "Competence", "Discipline"];
          break;
        case "7-12":
        case "13-18":
        case "19+":
          rooms = ["Teamwork", "Room 213 - Meeting Room"];
          break;
        default:
          rooms = [];
      }
    }

    setRoomOptions(rooms);
    setCapacity(""); // reset selected room
  }, [location, attendance]);

  const highlightClass = (step: number) => tutorialStep === step ? "ring-2 ring-cyan-500 p-2 rounded" : "";

  return (
    <form className="space-y-3 relative" onSubmit={onSubmit}>
      {/* Book Number */}
      <div>
        <input
          type="text"
          value={bookNumber}
          readOnly
          className={`w-full px-2 py-6 text-center border border-dashed rounded-lg bg-cyan-50 text-gray-700 text-lg font-bold ${highlightClass(0)}`}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="shifts@ecoshiftcorp.com"
          className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs ${highlightClass(1)}`}
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
          className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs ${highlightClass(2)}`}
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
            min={todayISOString}
            className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs ${highlightClass(3)}`}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || todayISOString}
            className={`w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs ${highlightClass(3)}`}
            required
          />
        </div>
      </div>

      {timeError && <p className="text-xs text-red-500">{timeError}</p>}
      {durationText && !timeError && <p className="text-xs text-gray-600">{durationText}</p>}

      {/* Attendance */}
      <div className={highlightClass(4)}>
        <label className="block font-medium text-gray-700 mb-1">Number of Attendance</label>
        <div className="flex flex-wrap gap-3">
          {["1-6", "7-12", "13-18", "19+"].map((num) => (
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

      {/* Location */}
      <div className={highlightClass(5)}>
        <label className="block font-medium text-gray-700 mb-1">Select Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          required
        >
          <option value="">Select location</option>
          <option value="JNL Building">JNL Building</option>
          <option value="Primex Building">Primex Building</option>
        </select>
      </div>

      {/* Room Capacity */}
      <div className={highlightClass(4)}>
        <label className="block font-medium text-gray-700 mb-1">Room Capacity</label>
        <div className="flex flex-wrap gap-3">
          {roomOptions.map((cap) => (
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
      <div className={highlightClass(5)}>
        <label className="block font-medium text-gray-700 mb-1">Purpose</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          required
        >
          <option value="">Select purpose</option>
          <option value="Board Meeting">Board Meeting</option>
          <option value="Client Meeting">Client Meeting</option>
          <option value="Interview">Interview</option>
          <option value="Staff Meeting">Staff Meeting</option>
          <option value="Management Committee Meeting">Management Committee Meeting</option>
          <option value="Onboarding">Onboarding</option>
          <option value="Training Session">Training Session</option>
          <option value="Others">Others</option>
        </select>

        {purpose === "Others" && (
          <input
            type="text"
            value={otherPurpose}
            onChange={(e) => setOtherPurpose(e.target.value)}
            placeholder="Specify other purpose"
            className="w-full mt-2 px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          />
        )}
      </div>

      <div className={highlightClass(6)}>
        <button
          type="submit"
          disabled={loading || !!timeError}
          className={`w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all duration-300 shadow-md disabled:opacity-60 text-xs flex items-center justify-center gap-1 ${highlightClass(6)}`}
        >
          <MdSave /> {loading ? "Booking..." : "Reserve"}
        </button>
      </div>
    </form>
  );
};

export default Form;
