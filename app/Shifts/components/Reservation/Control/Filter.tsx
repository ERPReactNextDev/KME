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
    <div className="flex justify-between items-center mb-3 gap-2">
      <div className="flex gap-2">
        <button onClick={prevPeriod} className="px-3 py-3 bg-gray-50 rounded text-xs hover:bg-gray-300 transition"><FcPrevious /></button>
        <button onClick={nextPeriod} className="px-3 py-3 bg-gray-50 rounded text-xs hover:bg-gray-300 transition"><FcNext /></button>

        <select
          value={filterCapacity}
          onChange={e => setFilterCapacity(e.target.value)}
          className="px-4 py-3 border rounded-full text-xs"
        >
          <option value="All">All Capacities</option>
          <option value="Integrity">Integrity</option>
          <option value="Competence">Competence</option>
          <option value="Discipline">Discipline</option>
          <option value="Teamwork">Teamwork</option>
          <option value="Meeting Room">Meeting Room</option>
        </select>

        <select
          value={viewMode}
          onChange={e => setViewMode(e.target.value as "month" | "day")}
          className="px-4 py-3 border rounded-full text-xs"
        >
          <option value="month">Month</option>
          <option value="day">Day</option>
        </select>
      </div>

      <h2 className="text-sm font-semibold text-gray-700">
        {viewMode === "month"
          ? currentDate.toLocaleString("default", { month: "long", year: "numeric" })
          : currentDate.toLocaleString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </h2>
    </div>
  );
};

export default Filter;
