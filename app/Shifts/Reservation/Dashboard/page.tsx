"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../components/Layouts/ParentLayout";
import SessionChecker from "../../components/Session/SessionChecker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface Booking {
  BookNumber: string;
  Email: string;
  Fullname: string;
  Status: string;
  Attendance: number;
  Capacity: number;
  Location: string;
  Purpose: string;
  StartDate: string;
  EndDate: string;
  date_created?: string;
}

const DashboardContent: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Shifts/FetchBooking");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.error || "Failed to fetch bookings.");
        setBookings([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Filter bookings by exact date range ---
  const filteredBookings = bookings.filter((b) => {
    if (!b.date_created) return false;
    const bookingDate = new Date(b.date_created).setHours(0, 0, 0, 0);

    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      return bookingDate >= start && bookingDate <= end;
    }

    if (startDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      return bookingDate === start;
    }

    if (endDate) {
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      return bookingDate === end;
    }

    return true;
  });

  // --- Counts ---
  const total = filteredBookings.length;
  const approved = filteredBookings.filter((b) => b.Status === "Approved").length;
  const pending = filteredBookings.filter((b) => b.Status === "Pending").length;
  const rejected = filteredBookings.filter((b) => b.Status === "Rejected").length;

  // --- Chart Data ---
  const pieData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
  ];

  const barData = [
    { name: "Approved", count: approved },
    { name: "Pending", count: pending },
    { name: "Rejected", count: rejected },
  ];

  const locationData = Object.values(
    filteredBookings.reduce((acc: any, b) => {
      acc[b.Location] = acc[b.Location] || { name: b.Location, count: 0 };
      acc[b.Location].count += 1;
      return acc;
    }, {})
  );

  const purposeData = Object.values(
    filteredBookings.reduce((acc: any, b) => {
      acc[b.Purpose] = acc[b.Purpose] || { name: b.Purpose, count: 0 };
      acc[b.Purpose].count += 1;
      return acc;
    }, {})
  );

  const attendanceCapacityData = filteredBookings.map((b) => ({
    name: b.BookNumber,
    Attendance: b.Attendance,
    Capacity: b.Capacity,
  }));

  const bookingsByMonth = Object.values(
    filteredBookings.reduce((acc: any, b) => {
      const date = new Date(b.StartDate);
      const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      acc[key] = acc[key] || { month: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  );

  const COLORS = ["#22c55e", "#facc15", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

  // --- Hover Modal Component ---
  const ChartCard: React.FC<{ title: string; children: React.ReactNode; summary: string }> = ({
    title,
    children,
    summary,
  }) => {
    const [hover, setHover] = useState(false);
    return (
      <div
        className="relative bg-white shadow rounded-lg p-4"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <h2 className="text-sm font-semibold mb-4">{title}</h2>
        {children}
        {hover && (
          <div className="absolute top-2 right-2 bg-black text-white text-xs rounded px-2 py-1 shadow-lg z-50">
            {summary}
          </div>
        )}
      </div>
    );
  };

  return (
    <SessionChecker>
      <ParentLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-extrabold mb-6">Dashboard</h1>

          {/* Date Range Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-600">Start Date</label>
              <input
                type="date"
                className="border rounded px-3 py-1 text-xs"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">End Date</label>
              <input
                type="date"
                className="border rounded px-3 py-1 text-xs"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs">
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <p className="text-gray-500">Total</p>
              <h2 className="text-xl font-bold">{total}</h2>
            </div>
            <div className="bg-green-100 shadow rounded-lg p-4 text-center">
              <p className="text-gray-500">Approved</p>
              <h2 className="text-xl font-bold text-green-700">{approved}</h2>
            </div>
            <div className="bg-yellow-100 shadow rounded-lg p-4 text-center">
              <p className="text-gray-500">Pending</p>
              <h2 className="text-xl font-bold text-yellow-700">{pending}</h2>
            </div>
            <div className="bg-red-100 shadow rounded-lg p-4 text-center">
              <p className="text-gray-500">Rejected</p>
              <h2 className="text-xl font-bold text-red-700">{rejected}</h2>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Status Distribution" summary={`Approved: ${approved}, Pending: ${pending}, Rejected: ${rejected}`}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Status Counts" summary="Bar chart showing booking counts by status">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Bookings by Location" summary="Bar chart showing distribution of bookings per location">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Bookings by Purpose" summary="Pie chart showing distribution of bookings per purpose">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={purposeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Attendance vs Capacity" summary="Comparison between attendance and capacity per booking">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceCapacityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Attendance" fill="#22c55e" />
                  <Bar dataKey="Capacity" fill="#facc15" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Bookings Over Time" summary="Line chart showing total bookings per month">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingsByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        <ToastContainer className="text-xs" autoClose={1000} />
      </ParentLayout>
    </SessionChecker>
  );
};

export default DashboardContent;
