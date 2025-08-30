"use client";

import React from "react";
import { MdClose } from "react-icons/md";

interface SuccessBookProps {
  submittedBookNumber: string;
  handleClose: () => void;
  handleCopy: () => void;
}

const SuccessBook: React.FC<SuccessBookProps> = ({
  submittedBookNumber,
  handleClose,
  handleCopy,
}) => {
  return (
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
          onClick={handleClose}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1"
        >
          <MdClose /> Close
        </button>
      </div>
    </div>
  );
};

export default SuccessBook;
