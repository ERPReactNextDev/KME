"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Form from "../Shifts/components/Reservation/Form";
import Calendar from "../Shifts/components/Reservation/Calendar";
import SuccessBook from "../Shifts/components/Reservation/Modal/SuccessBook";
import { FcPlus } from "react-icons/fc";
import { MdClose, MdSchool } from "react-icons/md";

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
  const [showTutorialWelcome, setShowTutorialWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

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
      toast.success(`Booking ${bookNumber} created successfully!`);
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

  const tutorialSteps = [
    "😀 🆔 Book Number: This is auto-generated and read-only. You can copy it after booking for reference.",
    "😊 📧 Email: Enter your valid email address where booking confirmations will be sent.",
    "😃 👤 Full Name: Provide your full name as it should appear in the booking record.",
    "😎 📅 Start & End Date: Choose the start and end date/time for your booking. Note: Past Days and Sundays are not selectable.",
    "🤝 👥 Attendance & 🏢 Room Capacity: Select the expected number of attendees and choose an appropriate room based on capacity.",
    "🎯 📍 Purpose & Location: Select the purpose of the booking. If 'Others', specify the purpose manually. Choose the building location for the meeting.",
    "✅ 🎉 Reserve: Click 'Reserve' to submit your booking. Make sure all fields are correctly filled before submitting."
  ];


  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 text-xs bg-cover bg-center relative"
      style={{ backgroundImage: "url('/ecoshipt-wallpaper.jpg')" }}
    >
      <ToastContainer className="text-xs" autoClose={2000} />

      {/* CREATE & TUTORIAL BUTTONS */}
      <div className="w-full max-w-7xl mb-4 flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-50 border text-black rounded-lg text-sm hover:bg-gray-100 transition flex item-center gap-1"
          onClick={() => setShowFormModal(true)}
        >
          <FcPlus size={20} /> Create Booking
        </button>
        <button
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500 transition flex items-center gap-2"
          onClick={() => setShowTutorialWelcome(true)}
        >
          <MdSchool size={18} /> Tutorial
        </button>
      </div>

      {/* CALENDAR */}
      <div className="w-full max-w-7xl">
        <Calendar
          approvedBookings={approvedBookings}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>

      {/* TUTORIAL WELCOME MODAL */}
      {showTutorialWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-gray-700 mb-2">Welcome to Booking Tutorial!</h3>
            <p className="text-xs mb-4">We will guide you step by step to fill the booking form.</p>
            <button
              onClick={() => {
                setShowTutorialWelcome(false);
                setShowFormModal(true);
                setShowTutorial(true);
                setTutorialStep(0);
              }}
              className="px-4 py-3 bg-cyan-600 text-white rounded-lg text-xs hover:bg-cyan-500"
            >
              Start Tutorial
            </button>
            <button
              onClick={() => setShowTutorialWelcome(false)}
              className="ml-2 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg overflow-auto relative">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Book a Room</h2>
            <Form
              email={email} setEmail={setEmail}
              fullname={fullname} setFullname={setFullname}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              attendance={attendance} setAttendance={setAttendance}
              capacity={capacity} setCapacity={setCapacity}
              purpose={purpose} setPurpose={setPurpose}
              otherPurpose={otherPurpose} setOtherPurpose={setOtherPurpose}
              location={location} setLocation={setLocation}
              loading={loading}
              handleSubmit={handleSubmit}
              bookNumber={bookNumber}
              showTutorial={showTutorial}
              tutorialStep={tutorialStep}
              setTutorialStep={setTutorialStep}
            />

            <button
              onClick={() => setShowFormModal(false)}
              className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <MdClose /> Close
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showModal && (
        <SuccessBook
          submittedBookNumber={submittedBookNumber}
          handleClose={() => setShowModal(false)}
          handleCopy={handleCopy}
        />
      )}

      {/* TUTORIAL OVERLAY */}
      {showTutorial && (
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center p-4 z-[9999]">
          <div className="bg-white p-4 rounded-lg max-w-xs text-center shadow-lg">
            <p className="text-sm mb-4">{tutorialSteps[tutorialStep]}</p>
            <div className="flex justify-between">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-200 text-xs"
                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                disabled={tutorialStep === 0}
              >
                Back
              </button>
              {tutorialStep === tutorialSteps.length - 1 ? (
                <button
                  className="px-4 py-3 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-xs"
                  onClick={() => setShowTutorial(false)}
                >
                  Finish
                </button>
              ) : (
                <button
                  className="px-4 py-3 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-xs"
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                >
                  Next
                </button>
              )}
            </div>
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
