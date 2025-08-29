"use client";

import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

interface TableProps {
  bookings: Booking[];
  loading: boolean;
  approveBooking: (bookNumber: string) => void;
  setCancelModal: (modal: { open: boolean; bookNumber: string }) => void;
  statusColors: Record<string, string>;
}

const Table: React.FC<TableProps> = ({
  bookings,
  loading,
  approveBooking,
  setCancelModal,
  statusColors,
}) => {
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    worksheet.columns = [
      { header: "Book Number", key: "BookNumber", width: 20 },
      { header: "Email", key: "Email", width: 25 },
      { header: "Fullname", key: "Fullname", width: 25 },
      { header: "Start Date", key: "StartDate", width: 20 },
      { header: "End Date", key: "EndDate", width: 20 },
      { header: "Attendance", key: "Attendance", width: 12 },
      { header: "Capacity", key: "Capacity", width: 12 },
      { header: "Purpose", key: "Purpose", width: 25 },
      { header: "Status", key: "Status", width: 12 },
    ];

    bookings.forEach((b) => {
      worksheet.addRow({
        BookNumber: b.BookNumber,
        Email: b.Email,
        Fullname: b.Fullname,
        StartDate: new Date(b.StartDate).toLocaleString(),
        EndDate: new Date(b.EndDate).toLocaleString(),
        Attendance: b.Attendance,
        Capacity: b.Capacity,
        Purpose: b.Purpose,
        Status: b.Status,
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `RoomBookings_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="w-full">
      {/* Export Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded text-xs sm:text-sm"
        >
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 sm:p-3 text-left">Action</th>
              <th className="border p-2 sm:p-3 text-left">Book Number</th>
              <th className="border p-2 sm:p-3 text-left">Email</th>
              <th className="border p-2 sm:p-3 text-left">Fullname</th>
              <th className="border p-2 sm:p-3 text-left">Start Date</th>
              <th className="border p-2 sm:p-3 text-left">End Date</th>
              <th className="border p-2 sm:p-3 text-left">Attendance</th>
              <th className="border p-2 sm:p-3 text-left">Capacity</th>
              <th className="border p-2 sm:p-3 text-left">Purpose</th>
              <th className="border p-2 sm:p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && !loading ? (
              <tr>
                <td colSpan={10} className="text-center p-4 text-gray-400">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((b, idx) => (
                <tr key={`${b.BookNumber}-${idx}`} className="hover:bg-gray-50">
                  <td className="border p-2 sm:p-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    {b.Status === "Pending" && (
                      <>
                        <button
                          onClick={() => approveBooking(b.BookNumber)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs sm:text-sm w-full sm:w-auto"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setCancelModal({ open: true, bookNumber: b.BookNumber })
                          }
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs sm:text-sm w-full sm:w-auto"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                  <td className="border p-2 sm:p-3">{b.BookNumber}</td>
                  <td className="border p-2 sm:p-3">{b.Email}</td>
                  <td className="border p-2 sm:p-3">{b.Fullname}</td>
                  <td className="border p-2 sm:p-3">{new Date(b.StartDate).toLocaleString()}</td>
                  <td className="border p-2 sm:p-3">{new Date(b.EndDate).toLocaleString()}</td>
                  <td className="border p-2 sm:p-3">{b.Attendance}</td>
                  <td className="border p-2 sm:p-3">{b.Capacity}</td>
                  <td className="border p-2 sm:p-3">{b.Purpose}</td>
                  <td className="border p-2 sm:p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] ${
                        statusColors[b.Status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {b.Status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
