"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import Table from "../../components/Reservation/Table";
import SearchDateRange from "../../components/Reservation/Control/SearchDateRange";
import CancelModal from "../../components/Reservation/Modal/CancelBook";
import ViewFullCalendar from "../../components/Reservation/FullCalendar";
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
  date_created: string;
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

  // filters
  const [capacityFilter, setCapacityFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "day">("month");

  // fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Shifts/FetchBooking");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.error || "Failed to fetch bookings.");
        setBookings([]);
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

  // approve booking
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

  // cancel booking
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

  // Auto-delete Cancelled bookings older than 1 day
  useEffect(() => {
    const deleteOldCancelled = async () => {
      try {
        const res = await fetch("/api/Shifts/DeleteOldCancelled", { method: "DELETE" });
        if (res.ok) fetchBookings(); // refresh bookings after deletion
      } catch (err) {
        console.error("Failed to delete old cancelled bookings", err);
      }
    };

    deleteOldCancelled();
  }, []);

  // filters
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.BookNumber.toLowerCase().includes(q) ||
      b.Email.toLowerCase().includes(q) ||
      b.Fullname.toLowerCase().includes(q);

    const matchesCapacity = capacityFilter ? b.Capacity === capacityFilter : true;

    const bookingStart = new Date(b.StartDate).setHours(0, 0, 0, 0);
    const bookingEnd = new Date(b.EndDate).setHours(0, 0, 0, 0);

    const filterStart = startDateFilter
      ? new Date(startDateFilter).setHours(0, 0, 0, 0)
      : null;
    const filterEnd = endDateFilter
      ? new Date(endDateFilter).setHours(23, 59, 59, 999)
      : null;

    const matchesDate =
      (!filterStart || bookingStart >= filterStart) &&
      (!filterEnd || bookingEnd <= filterEnd);

    return matchesSearch && matchesCapacity && matchesDate;
  });

  // approved bookings only for calendar
  const approvedBookings = bookings.filter((b) => b.Status === "Approved");

  return (
    <SessionChecker>
      <ParentLayout>
        <div className="container mx-auto p-4 text-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-1">
            <h2 className="text-lg font-bold mb-4 text-center sm:text-left">
              Room Bookings
            </h2>

            {/* Filters */}
            <SearchDateRange
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              capacityFilter={capacityFilter}
              setCapacityFilter={setCapacityFilter}
              startDateFilter={startDateFilter}
              setStartDateFilter={setStartDateFilter}
              endDateFilter={endDateFilter}
              setEndDateFilter={setEndDateFilter}
              clearFilters={() => {
                setSearchQuery("");
                setCapacityFilter("");
                setStartDateFilter("");
                setEndDateFilter("");
              }}
            />

            {/* Calendar */}
            <ViewFullCalendar
              viewMode={viewMode}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              setViewMode={setViewMode}
              statusColors={statusColors}
              approvedBookings={approvedBookings}
            />

            {/* Table */}
            <div className="overflow-x-auto">
              <Table
                bookings={filteredBookings} // ✅ filtered
                loading={loading}
                approveBooking={approveBooking}
                setCancelModal={setCancelModal}
                statusColors={statusColors}
                refreshBookings={fetchBookings} // ✅ refreshBookings passed properly
              />
            </div>

            {/* Cancel Modal */}
            {cancelModal.open && (
              <CancelModal
                bookNumber={cancelModal.bookNumber}
                onConfirm={() => cancelBooking(cancelModal.bookNumber)}
                onClose={() => setCancelModal({ open: false, bookNumber: "" })}
              />
            )}
          </div>
          <ToastContainer className="text-xs sm:text-sm" autoClose={1000} />
        </div>
      </ParentLayout>
    </SessionChecker>
  );
};

export default Room;
