// cron.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/MongoDB";

export async function GET() {
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

    console.log(`Vercel Cron: Deleted ${result.deletedCount} cancelled bookings older than 1 day.`);
    return NextResponse.json({ message: `Deleted ${result.deletedCount} cancelled bookings older than 1 day.` });
  } catch (error) {
    console.error("Vercel Cron failed:", error);
    return NextResponse.json({ error: "Failed to delete old cancelled bookings" }, { status: 500 });
  }
}
