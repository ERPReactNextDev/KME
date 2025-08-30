"use client";

import React, { useState, useMemo } from "react";
import { FaCaretLeft, FaCaretRight, FaCalendarAlt } from 'react-icons/fa';

interface Booking {
  BookNumber: string;
  Fullname: string;
  Purpose: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Capacity: string; // ✅ make sure Capacity exists in Booking
}

interface ViewFullCalendarProps {
  viewMode: "month" | "day";
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: "month" | "day") => void;
  statusColors: Record<string, string>;
  approvedBookings: Booking[];
}

const ViewFullCalendar: React.FC<ViewFullCalendarProps> = ({
  viewMode,
  currentDate,
  setCurrentDate,
  setViewMode,
  statusColors,
  approvedBookings,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [capacityFilter, setCapacityFilter] = useState<string>(""); // ✅ Capacity filter state

  // --- Month Helpers ---
  const { weeks, monthlyApproved, dailyApproved } = useMemo(() => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const daysInMonth = Array.from(
      { length: endOfMonth.getDate() },
      (_, i) => i + 1
    );

    const firstDayOfWeek = startOfMonth.getDay();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) week.push(null);

    daysInMonth.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    // ✅ Apply capacity filter
    const filteredBookings = capacityFilter
      ? approvedBookings.filter(b => b.Capacity === capacityFilter)
      : approvedBookings;

    const monthlyApproved = filteredBookings.filter((b) => {
      const start = new Date(b.StartDate);
      return (
        start.getMonth() === currentDate.getMonth() &&
        start.getFullYear() === currentDate.getFullYear()
      );
    });

    const dailyApproved = filteredBookings.filter((b) => {
      const start = new Date(b.StartDate);
      return start.toDateString() === currentDate.toDateString();
    });

    return { weeks, monthlyApproved, dailyApproved };
  }, [currentDate, approvedBookings, capacityFilter]);

  // --- Navigation ---
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // --- Unique Capacities for dropdown
  const capacities = Array.from(new Set(approvedBookings.map(b => b.Capacity))).sort();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Collapse Toggle + Capacity Filter */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1"><FaCalendarAlt /> Calendar</h2>
        <div className="flex items-center gap-2">
          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="px-2 py-1 border rounded text-xs"
          >
            <option value="">All Capacities</option>
            {capacities.map(cap => (
              <option key={cap} value={cap}>{cap}</option>
            ))}
          </select>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            {isCollapsed ? "Show Calendar ▼" : "Hide Calendar ▲"}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrev}
              className="px-3 py-3 bg-gray-200 rounded hover:bg-gray-300 text-xs"
            >
              <FaCaretLeft />
            </button>
            <h3 className="font-semibold text-sm sm:text-base">
              {viewMode === "month"
                ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h3>
            <button
              onClick={handleNext}
              className="px-3 py-3 bg-gray-200 rounded hover:bg-gray-300 text-xs"
            >
              <FaCaretRight />
            </button>
          </div>

          {/* Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded text-xs ${viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-xs ${viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Day View
            </button>
          </div>

          {/* Month View */}
          {viewMode === "month" && (
            <>
              <div className="grid grid-cols-7 text-center text-xs font-semibold mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {weeks.map((week, wi) =>
                  week.map((day, di) => {
                    const dayBookings = day
                      ? monthlyApproved.filter(
                          (b) => new Date(b.StartDate).getDate() === day
                        )
                      : [];
                    return (
                      <div
                        key={`${wi}-${di}`}
                        className="h-20 border rounded p-1 flex flex-col items-start overflow-hidden cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          if (day) {
                            setCurrentDate(
                              new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                            );
                            setViewMode("day");
                          }
                        }}
                      >
                        {day && (
                          <span className="text-[10px] font-bold">{day}</span>
                        )}
                        <div className="flex flex-col gap-1 overflow-y-auto w-full">
                          {dayBookings.map((b) => (
                            <div
                              key={b.BookNumber}
                              className="bg-blue-100 text-blue-800 rounded px-1 text-[10px] truncate"
                            >
                              {b.Fullname} ({b.Capacity})
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Day View */}
          {viewMode === "day" && (
            <div className="border rounded divide-y max-h-[600px] overflow-y-auto">
              {hours.map((h) => {
                const label = new Date(0, 0, 0, h).toLocaleTimeString([], {
                  hour: "numeric",
                  hour12: true,
                });

                const hourBookings = dailyApproved.filter((b) => {
                  const start = new Date(b.StartDate);
                  const end = new Date(b.EndDate);
                  return start.getHours() <= h && end.getHours() >= h;
                });

                return (
                  <div key={h} className="flex items-start gap-2 p-2">
                    <div className="w-16 text-right text-xs text-gray-500">
                      {label}
                    </div>
                    <div className="flex-1 space-y-1">
                      {hourBookings.length === 0 ? (
                        <div className="h-6 border-b border-dashed border-gray-200"></div>
                      ) : (
                        hourBookings.map((b) => (
                          <div
                            key={b.BookNumber}
                            className="border rounded px-2 py-1 text-xs flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold">{b.Fullname}</p>
                              <p className="text-[10px]">{b.Purpose}</p>
                              <p className="text-[10px] text-gray-500">Capacity: {b.Capacity}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-[10px] ${
                                statusColors[b.Status] || ""
                              }`}
                            >
                              {b.Status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewFullCalendar;
