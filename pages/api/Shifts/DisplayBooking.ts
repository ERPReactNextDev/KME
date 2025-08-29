import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";

export default async function getBooking(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const query = req.query.query as string | undefined;
  const status = req.query.status as string | undefined; // NEW: filter by status

  try {
    const db = await connectToDatabase();
    const bookingsCollection = db.collection("RoomBookings");

    const filter: any = {};
    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ BookNumber: regex }, { Email: regex }, { Fullname: regex }];
    }
    if (status) {
      filter.Status = status;
    }

    const bookings = await bookingsCollection
      .find(filter)
      .sort({ date_created: -1 })
      .toArray();

    return res.status(200).json(bookings); // return array directly
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
}
