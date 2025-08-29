"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Form from "../Shifts/components/Reservation/Form";

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
  date_created: string; // <- dagdag na field
}

const Book: React.FC = () => {
  const [bookNumber, setBookNumber] = useState("");
  const [submittedBookNumber, setSubmittedBookNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendance, setAttendance] = useState("1-5");
  const [capacity, setCapacity] = useState("Small");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    generateBookNumber();
    fetchApprovedBookings();
  }, []);

  const generateBookNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setBookNumber(`BK-${timestamp}-${random}`);
  };

  const fetchApprovedBookings = async () => {
    try {
      const res = await fetch("/api/Shifts/DisplayBooking?status=Approved");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: Booking[] = await res.json();
      setApprovedBookings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load approved bookings");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(submittedBookNumber);
    toast.success("Book Number copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullname || !startDate || !endDate || !attendance || !capacity || !purpose) {
      toast.error("Please fill out all fields!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/Shifts/AddBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          BookNumber: bookNumber,
          Email: email,
          Fullname: fullname,
          StartDate: startDate,
          EndDate: endDate,
          Attendance: attendance,
          Capacity: capacity,
          Purpose: purpose,
          Status: "Pending",
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmittedBookNumber(bookNumber);
        setShowModal(true);
        toast.success(`Booking ${bookNumber} created successfully!`);

        await fetch("/api/Shifts/SendBookingEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullname, bookNumber, startDate, endDate, attendance, capacity, purpose }),
        });

        setEmail("");
        setFullname("");
        setStartDate("");
        setEndDate("");
        setAttendance("1-5");
        setCapacity("Small");
        setPurpose("");
        generateBookNumber();

        fetchApprovedBookings();
      } else {
        toast.error(result.error || "Failed to create booking.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  /** Calendar Helpers **/
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const firstDayIndex = startOfMonth.getDay();
  const lastDayIndex = endOfMonth.getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const calendarDays: React.ReactNode[] = [];

  // Fill empty days before first day
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border border-gray-100 h-20"></div>);
  }

  // Fill calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    // Filter bookings by date_created
    const dayBookings = approvedBookings.filter((b) => {
      const created = new Date(b.date_created);
      return (
        created.getFullYear() === dayDate.getFullYear() &&
        created.getMonth() === dayDate.getMonth() &&
        created.getDate() === dayDate.getDate()
      );
    });

    calendarDays.push(
      <div key={day} className="border border-gray-200 h-28 p-1 bg-white flex flex-col gap-1 overflow-y-auto">
        <span className="text-xs font-bold text-gray-500">{day}</span>
        {dayBookings.map((b) => (
          <div key={b.BookNumber} className="bg-cyan-100 rounded px-1 py-0.5 text-xs shadow-sm">
            <p className="font-semibold">{b.Fullname}</p>
            <p>{b.BookNumber}</p>
          </div>
        ))}
      </div>
    );
  }

  // Fill empty days after last day to complete week row
  for (let i = lastDayIndex + 1; i < 7; i++) {
    calendarDays.push(<div key={`empty-end-${i}`} className="border border-gray-100 h-20"></div>);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-xs">
      <ToastContainer className="text-xs" autoClose={2000} />

      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6">
        {/* Left Column – Full Month Calendar */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 min-h-[500px] bg-white">
          <div className="flex justify-between items-center mb-3">
            <button onClick={prevMonth} className="px-2 py-1 bg-gray-200 rounded text-xs">Prev</button>
            <h2 className="text-sm font-semibold text-gray-600">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="px-2 py-1 bg-gray-200 rounded text-xs">Next</button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-bold text-gray-500 text-xs mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
        </div>

        {/* Right Column – Booking Form */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 md:p-6 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Book a Room</h2>

          <div className="mb-3">
            <label className="block font-medium text-gray-700 mb-1">Book Number</label>
            <input
              type="text"
              value={bookNumber}
              readOnly
              className="w-full px-2 py-2 border rounded-lg bg-gray-100 text-gray-700 text-xs"
            />
          </div>

          <Form
            email={email}
            setEmail={setEmail}
            fullname={fullname}
            setFullname={setFullname}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            attendance={attendance}
            setAttendance={setAttendance}
            capacity={capacity}
            setCapacity={setCapacity}
            purpose={purpose}
            setPurpose={setPurpose}
            loading={loading}
            handleSubmit={handleSubmit}
            bookNumber={bookNumber}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-gray-700 mb-2">Booking Successful!</h3>
            <p className="mb-4">Your Book Number is:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={submittedBookNumber}
                className="w-full px-2 py-2 border rounded-lg text-center text-gray-700 text-xs"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-xs"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="mt-4 text-center text-gray-400 text-xs">
        Shifts © {new Date().getFullYear()} - Room Reservation System
      </footer>
    </div>
  );
};

export default Book;
