// /pages/api/Shifts/FetchApprovedBookings.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function fetchApprovedBookings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { location, date } = req.query; // optional filtering
    const db = await connectToDatabase();
    const collection = db.collection("RoomBookings");

    // Build query
    const query: any = { Status: "Approved" };

    if (location) query.Location = location;
    if (date) {
      // Filter bookings for the selected date
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);

      query.StartDate = { $lt: endOfDay };
      query.EndDate = { $gt: startOfDay };
    }

    const bookings = await collection.find(query).toArray();

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch approved bookings" });
  }
}
