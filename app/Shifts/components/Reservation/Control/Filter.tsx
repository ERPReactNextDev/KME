"use client";

import React from "react";
import { FcPrevious, FcNext } from 'react-icons/fc';

interface FilterProps {
  filterCapacity: string;
  setFilterCapacity: React.Dispatch<React.SetStateAction<string>>;
  viewMode: "month" | "day";
  setViewMode: React.Dispatch<React.SetStateAction<"month" | "day">>;
  prevPeriod: () => void;
  nextPeriod: () => void;
  currentDate: Date;
}

const Filter: React.FC<FilterProps> = ({
  filterCapacity,
  setFilterCapacity,
  viewMode,
  setViewMode,
  prevPeriod,
  nextPeriod,
  currentDate
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2 md:gap-0">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div className="flex gap-2">
          <button 
            onClick={prevPeriod} 
            className="px-3 py-2 bg-gray-50 rounded text-xs hover:bg-gray-300 transition flex items-center justify-center"
          >
            <FcPrevious />
          </button>
          <button 
            onClick={nextPeriod} 
            className="px-3 py-2 bg-gray-50 rounded text-xs hover:bg-gray-300 transition flex items-center justify-center"
          >
            <FcNext />
          </button>
        </div>

        <select
          value={filterCapacity}
          onChange={e => setFilterCapacity(e.target.value)}
          className="px-4 py-2 border rounded-full text-xs w-full sm:w-auto"
        >
          <option value="All">All Capacities</option>
          <option value="Integrity">Integrity</option>
          <option value="Competence">Competence</option>
          <option value="Discipline">Discipline</option>
          <option value="Teamwork">Teamwork</option>
          <option value="Room 211 - Meeting Room">Room 211 - Meeting Room</option>
        </select>

        <select
          value={viewMode}
          onChange={e => setViewMode(e.target.value as "month" | "day")}
          className="px-4 py-2 border rounded-full text-xs w-full sm:w-auto"
        >
          <option value="month">Month</option>
          <option value="day">Day</option>
        </select>
      </div>

      {/* Current Date */}
      <h2 className="text-sm font-semibold text-gray-700 mt-2 md:mt-0">
        {viewMode === "month"
          ? currentDate.toLocaleString("default", { month: "long", year: "numeric" })
          : currentDate.toLocaleString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </h2>
    </div>
  );
};

export default Filter;
