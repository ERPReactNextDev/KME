// pages/api/Shifts/GetPendingBookings.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function getPendingBookings(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const db = await connectToDatabase();
    const bookingsCollection = db.collection("RoomBookings");

    // Fetch only pending bookings
    const pendingBookings = await bookingsCollection
      .find({ Status: "Pending" })
      .project({
        _id: 0,
        BookNumber: 1,
        Fullname: 1,
        Email: 1,
        StartDate: 1,
        EndDate: 1,
        Attendance: 1,
        Capacity: 1,
        Purpose: 1,
        Status: 1,
      })
      .sort({ StartDate: 1 }) // earliest first
      .toArray();

    return res.status(200).json({ bookings: pendingBookings });
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    return res.status(500).json({ error: "Failed to fetch pending bookings" });
  }
}
