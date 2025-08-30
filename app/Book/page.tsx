"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Form from "../Shifts/components/Reservation/Form";
import Calendar from "../Shifts/components/Reservation/Calendar";
import { FcPlus } from 'react-icons/fc';

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
  date_created: string;
  Location: string;
}

const Book: React.FC = () => {
  const [bookNumber, setBookNumber] = useState("");
  const [submittedBookNumber, setSubmittedBookNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendance, setAttendance] = useState("1-5");
  const [capacity, setCapacity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [otherPurpose, setOtherPurpose] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
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

    if (!email || !fullname || !startDate || !endDate || !attendance || !capacity || !purpose || !location) {
      toast.error("Please fill out all fields!");
      return;
    }

    const finalPurpose = purpose === "Others" ? otherPurpose : purpose;

    setLoading(true);
    try {
      // STEP 1: Create booking in DB
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
          Purpose: finalPurpose,
          Location: location,
          Status: "Pending",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create booking");

      // STEP 2: Send email via Mailjet
      const emailRes = await fetch("/api/Shifts/SendBookingEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullname,
          bookNumber,
          startDate,
          endDate,
          attendance,
          capacity,
          purpose: finalPurpose,
          location,
        }),
      });

      const emailResult = await emailRes.json();

      if (emailResult.success) {
        toast.success(`Booking ${bookNumber} created & email sent successfully!`);
      } else {
        toast.warning(`Booking ${bookNumber} created, but failed to send email.`);
        console.warn("Email send failed:", emailResult.message || emailResult);
      }


      // Show modal
      setSubmittedBookNumber(bookNumber);
      setShowModal(true);
      setShowFormModal(false);

      // Reset form
      setEmail(""); setFullname(""); setStartDate(""); setEndDate("");
      setAttendance("1-5"); setCapacity(""); setPurpose(""); setOtherPurpose(""); setLocation("");
      generateBookNumber();
      fetchApprovedBookings();
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 text-xs bg-cover bg-center"
      style={{ backgroundImage: "url('/ecoshipt-wallpaper.jpg')" }}
    >
      <ToastContainer className="text-xs" autoClose={2000} />

      {/* CREATE BUTTON */}
      <div className="w-full max-w-7xl mb-4 flex justify-end">
        <button
          className="px-4 py-2 bg-gray-50 border text-black rounded-lg text-sm hover:bg-gray-100 transition flex item-center gap-1"
          onClick={() => setShowFormModal(true)}
        >
          <FcPlus size={20} /> Create Booking
        </button>
      </div>

      {/* CALENDAR FULL WIDTH */}
      <div className="w-full max-w-7xl">
        <Calendar
          approvedBookings={approvedBookings}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg overflow-auto">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Book a Room</h2>
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
              otherPurpose={otherPurpose}
              setOtherPurpose={setOtherPurpose}
              location={location}
              setLocation={setLocation}
              loading={loading}
              handleSubmit={handleSubmit}
              bookNumber={bookNumber}
            />
            <button
              onClick={() => setShowFormModal(false)}
              className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
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

      <footer className="mt-4 text-center text-gray-900 text-xs">
        Shifts © {new Date().getFullYear()} - Room Reservation System - Taskflow Team
      </footer>
    </div>
  );
};

export default Book;
