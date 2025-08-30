import { connectToDatabase } from "@/lib/MongoDB";

export async function deleteOldCancelledBookings() {
  const db = await connectToDatabase();
  const collection = db.collection("RoomBookings");

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const result = await collection.deleteMany({
    Status: "Cancelled",
    date_created: { $lt: oneDayAgo },
  });

  return result.deletedCount;
}
