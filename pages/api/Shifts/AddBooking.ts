import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function addBooking(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const {
      BookNumber,
      Email,
      Fullname,
      StartDate,
      EndDate,
      Attendance,
      Capacity,
      Purpose,
      Location, // added location
    } = req.body;

    // Basic validation
    if (!BookNumber || !Email || !Fullname || !StartDate || !EndDate || !Attendance || !Capacity || !Purpose || !Location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await connectToDatabase();
    const bookingsCollection = db.collection("RoomBookings");

    const newBooking = {
      BookNumber,
      Email,
      Fullname,
      StartDate: new Date(StartDate),
      EndDate: new Date(EndDate),
      Attendance,
      Capacity,
      Purpose,
      Location, // stored location
      Status: "Pending",
      date_created: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    if (!result.acknowledged) {
      throw new Error("Failed to insert booking");
    }

    return res.status(201).json({ message: "Booking created successfully", BookNumber });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ error: "Failed to create booking" });
  }
}
