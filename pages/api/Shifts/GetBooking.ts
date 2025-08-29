import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function getBooking(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const db = await connectToDatabase();
    const bookingsCollection = db.collection("RoomBookings");

    // Case-insensitive regex search for BookNumber, Email, or Fullname
    const regex = new RegExp(query, "i");

    const bookings = await bookingsCollection
      .find({
        $or: [
          { BookNumber: regex },
          { Email: regex },
          { Fullname: regex },
        ],
      })
      .sort({ date_created: -1 }) // newest first
      .toArray();

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
}
