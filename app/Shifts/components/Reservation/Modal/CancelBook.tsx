"use client";

import React from "react";

interface CancelModalProps {
  bookNumber: string;
  onConfirm: () => void;
  onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ bookNumber, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs sm:max-w-md text-center">
        <h3 className="font-bold text-gray-700 mb-4 text-sm sm:text-base">
          Cancel Booking
        </h3>
        <p className="mb-4 text-xs sm:text-sm">
          Are you sure you want to cancel booking{" "}
          <span className="font-semibold">{bookNumber}</span>?
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded text-xs sm:text-sm w-full sm:w-auto"
          >
            Yes, Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-xs sm:text-sm w-full sm:w-auto"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
