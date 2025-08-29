import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function approveBooking(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { BookNumber } = req.body;
    if (!BookNumber) return res.status(400).json({ error: "BookNumber is required" });

    const db = await connectToDatabase();
    const collection = db.collection("RoomBookings");

    const result = await collection.updateOne(
      { BookNumber },
      { $set: { Status: "Approved" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Booking not found or already approved" });
    }

    return res.status(200).json({ message: "Booking approved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to approve booking" });
  }
}
