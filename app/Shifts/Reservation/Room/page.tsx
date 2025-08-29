"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import Table from "../../components/Reservation/Table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  Approved: "bg-blue-100 text-blue-800",
  Confirmed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const Room: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookNumber: string }>({
    open: false,
    bookNumber: "",
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Shifts/FetchBooking");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        setBookings([]);
        toast.error(data.error || "Failed to fetch bookings.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (bookNumber: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/Shifts/ApproveBooking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ BookNumber: bookNumber }),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(`Booking ${bookNumber} approved!`);
        setBookings((prev) =>
          prev.map((b) =>
            b.BookNumber === bookNumber ? { ...b, Status: "Approved" } : b
          )
        );
      } else {
        toast.error(result.error || "Failed to approve booking.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while approving booking.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookNumber: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/Shifts/CancelBooking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ BookNumber: bookNumber }),
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(`Booking ${bookNumber} cancelled!`);
        setBookings((prev) =>
          prev.map((b) =>
            b.BookNumber === bookNumber ? { ...b, Status: "Cancelled" } : b
          )
        );
      } else {
        toast.error(result.error || "Failed to cancel booking.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while cancelling booking.");
    } finally {
      setCancelModal({ open: false, bookNumber: "" });
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.BookNumber.toLowerCase().includes(q) ||
      b.Email.toLowerCase().includes(q) ||
      b.Fullname.toLowerCase().includes(q)
    );
  });

  return (
    <SessionChecker>
      <ParentLayout>
        <div className="container mx-auto p-4 text-gray-900">
          <h2 className="text-lg font-bold mb-4 text-center sm:text-left">Room Bookings</h2>

          {/* Search */}
          <div className="w-full max-w-md mb-4 mx-auto sm:mx-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Book Number, Email or Fullname"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-gray-500 mb-2 text-xs sm:text-sm">
              Loading...
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table
              bookings={filteredBookings}
              loading={loading}
              approveBooking={approveBooking}
              setCancelModal={setCancelModal}
              statusColors={statusColors}
            />
          </div>

          {/* Cancel Modal */}
          {cancelModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs sm:max-w-md text-center">
                <h3 className="font-bold text-gray-700 mb-4 text-sm sm:text-base">Cancel Booking</h3>
                <p className="mb-4 text-xs sm:text-sm">
                  Are you sure you want to cancel booking{" "}
                  <span className="font-semibold">{cancelModal.bookNumber}</span>?
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <button
                    onClick={() => cancelBooking(cancelModal.bookNumber)}
                    className="px-4 py-2 bg-red-500 text-white rounded text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setCancelModal({ open: false, bookNumber: "" })}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-xs sm:text-sm w-full sm:w-auto"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          <ToastContainer className="text-xs sm:text-sm" autoClose={1000} />
        </div>
      </ParentLayout>
    </SessionChecker>
  );
};

export default Room;
