"use client";

import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MdCancel, MdCheck, MdCloudDownload } from "react-icons/md";

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
  date_created: string; // ✅ dagdag para sorting
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
      { header: "Date Created", key: "date_created", width: 20 }, // ✅ dagdag
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
        date_created: new Date(b.date_created).toLocaleString(),
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `RoomBookings_${new Date().toISOString()}.xlsx`);
  };

  // ✅ sort bookings by latest date_created
  const sortedBookings = [...bookings].sort(
    (a, b) =>
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  );

  return (
    <div className="w-full">
      {/* Export Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded text-xs sm:text-xs flex items-center gap-1"
        >
          <MdCloudDownload /> Download as Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full rounded-lg shadow-md border border-gray-200">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white sticky top-0 z-10 shadow">
            <tr className="text-xs text-left whitespace-nowrap">
              <th className="px-6 py-4 font-semibold">Action</th>
              <th className="px-6 py-4 font-semibold">Book Number</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Fullname</th>
              <th className="px-6 py-4 font-semibold">Start Date</th>
              <th className="px-6 py-4 font-semibold">End Date</th>
              <th className="px-6 py-4 font-semibold">Attendance</th>
              <th className="px-6 py-4 font-semibold">Capacity</th>
              <th className="px-6 py-4 font-semibold">Purpose</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date Created</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.length === 0 && !loading ? (
              <tr>
                <td colSpan={11} className="text-center p-4 text-gray-400">
                  No bookings found.
                </td>
              </tr>
            ) : (
              sortedBookings.map((b, idx) => (
                <tr key={`${b.BookNumber}-${idx}`} className="hover:bg-gray-50 whitespace-nowrap">
                  <td className="px-6 py-4 text-xs p-2 sm:p-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
                    {b.Status === "Pending" && (
                      <>
                        <button
                          onClick={() => approveBooking(b.BookNumber)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs sm:text-xs w-full sm:w-auto flex items-center gap-1"
                        >
                          <MdCheck /> Approve
                        </button>
                        <button
                          onClick={() =>
                            setCancelModal({ open: true, bookNumber: b.BookNumber })
                          }
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs sm:text-xs w-full sm:w-auto flex items-center gap-1"
                        >
                          <MdCancel /> Cancel
                        </button>
                      </>
                    )}

                    {b.Status === "Approved" && (
                      <button
                        onClick={() =>
                          setCancelModal({ open: true, bookNumber: b.BookNumber })
                        }
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs sm:text-xs w-full sm:w-auto flex items-center gap-1"
                      >
                        <MdCancel /> Cancel
                      </button>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs">{b.BookNumber}</td>
                  <td className="px-6 py-4 text-xs">{b.Email}</td>
                  <td className="px-6 py-4 text-xs">{b.Fullname}</td>
                  <td className="px-6 py-4 text-xs">{new Date(b.StartDate).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs">{new Date(b.EndDate).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs">{b.Attendance}</td>
                  <td className="px-6 py-4 text-xs">{b.Capacity}</td>
                  <td className="px-6 py-4 text-xs">{b.Purpose}</td>
                  <td className="px-6 py-4 text-xs">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] ${
                        statusColors[b.Status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {b.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(b.date_created).toLocaleString()}
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
