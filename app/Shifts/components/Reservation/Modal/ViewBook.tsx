"use client";

import React from "react";
import { MdClose } from "react-icons/md";

interface Booking {
  BookNumber: string;
  Fullname: string;
  StartDate: string;
  EndDate: string;
  Purpose?: string;
  Capacity?: string;
  Status?: string;
}

interface ViewBookModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const ViewBookModal: React.FC<ViewBookModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const start = new Date(booking.StartDate);
  const end = new Date(booking.EndDate);

  // Compute duration
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative space-y-2">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded-full transition"
        >
          <MdClose size={24} />
        </button>

        <h2 className="font-bold text-gray-800 text-lg">{booking.Fullname}</h2>

        <div className="text-gray-600 text-sm space-y-1">
          <p>Book Number: <span className="font-medium">{booking.BookNumber}</span></p>
          <p>Start: {start.toLocaleString()}</p>
          <p>End: {end.toLocaleString()}</p>
          <p>
            Duration: {hours > 0 ? `${hours} hr ` : ""}{minutes} min
          </p>
          {booking.Purpose && <p>Purpose: {booking.Purpose}</p>}
          {booking.Capacity && <p>Capacity: {booking.Capacity}</p>}
        </div>

        {booking.Status === "Approved" && (
          <span className="inline-block mt-2 px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">
            Reserved
          </span>
        )}
      </div>
    </div>
  );
};

export default ViewBookModal;
