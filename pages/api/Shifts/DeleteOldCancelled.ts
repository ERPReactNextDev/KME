// pages/api/deleteOldCancelled.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("RoomBookings");

    // Delete cancelled bookings older than 1 day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await collection.deleteMany({
      Status: "Cancelled",
      date_created: { $lt: oneDayAgo },
    });

    return res.status(200).json({
      message: `Deleted ${result.deletedCount} cancelled bookings older than 1 day.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to delete old cancelled bookings",
    });
  }
}
