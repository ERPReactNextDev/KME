"use client";

import React, { useState } from "react";
import ViewBookModal from "./Modal/ViewBook";
import Filter from "./Control/Filter";
import { FcUpLeft } from 'react-icons/fc';

interface Booking {
  BookNumber: string;
  Fullname: string;
  StartDate: string;
  EndDate: string;
  Purpose?: string;
  Capacity?: string;
  Status?: string;
}

interface CalendarProps {
  approvedBookings: Booking[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const Calendar: React.FC<CalendarProps> = ({ approvedBookings, currentDate, setCurrentDate }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterCapacity, setFilterCapacity] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"month" | "day">("month");

  const prevPeriod = () => {
    if (viewMode === "month") setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    if (viewMode === "day") setCurrentDate(new Date(currentDate.getTime() - 86400000));
  };

  const nextPeriod = () => {
    if (viewMode === "month") setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    if (viewMode === "day") setCurrentDate(new Date(currentDate.getTime() + 86400000));
  };

  const filteredBookings = approvedBookings.filter(
    (b) => filterCapacity === "All" || b.Capacity === filterCapacity
  );

  const handleCardClick = (booking: Booking) => setSelectedBooking(booking);

  /** Format time as HH:MM */
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  /** Day view with stacked bookings */
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayBookings = filteredBookings.filter((b) => {
      const start = new Date(b.StartDate);
      return (
        start.getFullYear() === currentDate.getFullYear() &&
        start.getMonth() === currentDate.getMonth() &&
        start.getDate() === currentDate.getDate()
      );
    });

    const stackBookings = (bookings: Booking[]) => {
      const columns: Booking[][] = [];
      bookings.forEach((b) => {
        let placed = false;
        for (const col of columns) {
          const last = col[col.length - 1];
          if (new Date(last.EndDate) <= new Date(b.StartDate)) {
            col.push(b);
            placed = true;
            break;
          }
        }
        if (!placed) columns.push([b]);
      });
      return columns;
    };

    const columns = stackBookings(dayBookings);

    const formatHour12 = (hour: number) => {
      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour12}${suffix}`;
    };
    return (
      <div className="w-full flex flex-col border border-gray-200 rounded-lg overflow-auto">
        <div className="p-2 border-b border-gray-300 font-bold text-gray-700 flex justify-between items-center">
          <button
            className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 transition flex items-center gap-1"
            onClick={() => setViewMode("month")}
          >
            <FcUpLeft size={18} /> Back
          </button>
        </div>
        {hours.map((hour) => (
          <div key={hour} className="relative h-16 border-b border-gray-100 flex items-start w-full">
            <span className="text-xs text-gray-700 font-semibold w-16 pl-2 mt-2">{formatHour12(hour)}</span>
            <div className="flex-1 relative w-full">
              {columns.map((col, colIndex) =>
                col.map((b) => {
                  const start = new Date(b.StartDate);
                  const end = new Date(b.EndDate);
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const endMinutes = end.getHours() * 60 + end.getMinutes();
                  const top = ((startMinutes - hour * 60) / 60) * 64;
                  const height = ((endMinutes - startMinutes) / 60) * 64;
                  if (hour * 60 > endMinutes || (hour + 1) * 60 < startMinutes) return null;
                  const widthPercent = 100 / columns.length;
                  return (
                    <div
                      key={b.BookNumber}
                      className="absolute bg-cyan-50 border-l-4 border-cyan-400 rounded px-2 py-1 text-xs shadow-sm cursor-pointer hover:bg-cyan-100"
                      style={{
                        top: Math.max(0, top),
                        height: Math.max(8, height),
                        left: `${colIndex * widthPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      onClick={() => handleCardClick(b)}
                    >
                      <p className="font-semibold text-gray-700">{b.Fullname}</p>
                      <p className="text-[10px] text-gray-500">
                        {b.Capacity} | {formatTime(b.StartDate)} - {formatTime(b.EndDate)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /** Month view */
  const renderDays = (): React.ReactNode[] => {
    const numDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days: React.ReactNode[] = [];

    for (let i = 1; i <= numDays; i++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);

      const dayBookings = filteredBookings.filter((b) => {
        const start = new Date(b.StartDate);
        const end = new Date(b.EndDate);
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const dayDateOnly = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
        return dayDateOnly >= startDateOnly && dayDateOnly <= endDateOnly;
      });

      const handleDateClick = () => {
        setCurrentDate(dayDate);
        setViewMode("day");
      };

      days.push(
        <div
          key={i}
          className="h-36 p-2 bg-white border border-gray-200 rounded-lg flex flex-col gap-1 overflow-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleDateClick}
        >
          <span className="text-xs font-bold text-gray-600">{dayDate.getDate()}</span>
          {dayBookings.map((b) => (
            <div
              key={b.BookNumber}
              className="bg-cyan-50 border-l-4 border-cyan-400 rounded px-2 py-1 text-xs shadow-sm hover:bg-cyan-100 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent switching view when clicking card
                handleCardClick(b);
              }}
            >
              <p className="font-semibold text-gray-700">{b.Fullname}</p>
              <p className="text-[10px] text-gray-500">
                {b.Capacity} | {formatTime(b.StartDate)} - {formatTime(b.EndDate)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white min-h-[500px] overflow-auto">
      {/* Controls */}
      <Filter
        filterCapacity={filterCapacity}
        setFilterCapacity={setFilterCapacity}
        viewMode={viewMode}
        setViewMode={setViewMode}
        prevPeriod={prevPeriod}
        nextPeriod={nextPeriod}
        currentDate={currentDate}
      />

      {/* Calendar Grid */}
      {viewMode === "day" ? (
        <div className="w-full">{renderDayView()}</div>
      ) : (
        <div className="grid grid-cols-7 md:grid-cols-7 gap-2">{renderDays()}</div>
      )}

      {/* Booking Modal */}
      {selectedBooking && (
        <ViewBookModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
};

export default Calendar;
