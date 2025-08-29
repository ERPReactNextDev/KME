// /pages/api/Shifts/CancelBooking.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function CancelBooking(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { BookNumber } = req.body;

  if (!BookNumber) {
    return res.status(400).json({ error: "BookNumber is required" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("RoomBookings");

    const result = await collection.updateOne(
      { BookNumber }, // filter
      { $set: { Status: "Cancelled" } } // update
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Booking not found or already cancelled" });
    }

    res.status(200).json({ message: `Booking ${BookNumber} cancelled successfully` });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
}
