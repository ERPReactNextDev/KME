"use client";

import React from "react";

interface SearchDateRangeProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  capacityFilter: string;
  setCapacityFilter: (val: string) => void;
  startDateFilter: string;
  setStartDateFilter: (val: string) => void;
  endDateFilter: string;
  setEndDateFilter: (val: string) => void;
  clearFilters: () => void;
}

const SearchDateRange: React.FC<SearchDateRangeProps> = ({
  searchQuery,
  setSearchQuery,
  capacityFilter,
  setCapacityFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  clearFilters,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
      {/* 🔍 Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by Book Number, Email or Fullname"
        className="w-full sm:w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
      />

      {/* 🏢 Capacity */}
      <select
        value={capacityFilter}
        onChange={(e) => setCapacityFilter(e.target.value)}
        className="w-full sm:w-1/4 px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">All Capacities</option>
        <option value="Integrity">Integrity</option>
        <option value="Competence">Competence</option>
        <option value="Discipline">Discipline</option>
        <option value="Teamwork">Teamwork</option>
        <option value="Meeting Room">Meeting Room</option>
      </select>

      {/* 📅 Start Date */}
      <input
        type="date"
        value={startDateFilter}
        onChange={(e) => setStartDateFilter(e.target.value)}
        className="w-full sm:w-1/4 px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      {/* 📅 End Date */}
      <input
        type="date"
        value={endDateFilter}
        onChange={(e) => setEndDateFilter(e.target.value)}
        className="w-full sm:w-1/4 px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      {/* ❌ Clear */}
      <button
        onClick={clearFilters}
        className="px-3 py-2 bg-gray-200 rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition"
      >
        Clear
      </button>
    </div>
  );
};

export default SearchDateRange;
