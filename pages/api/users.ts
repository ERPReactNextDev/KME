import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const db = await connectToDatabase();
  const { search, id, tsmRef } = req.query;

  try {
    // 1️⃣ Fetch single user by ID
    if (id) {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id as string) }, { projection: { password: 0 } });

      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    }

    // 2️⃣ Fetch TSA under a TSM
    if (tsmRef) {
      const tsaList = await db
        .collection("users")
        .find({ TSM: tsmRef as string }) // match TSA ReferenceID = TSM ReferenceID
        .project({ password: 0 })
        .toArray();

      return res.status(200).json(tsaList);
    }

    // 3️⃣ Search users
    const filter = search
      ? {
          $or: [
            { Firstname: { $regex: search, $options: "i" } },
            { Lastname: { $regex: search, $options: "i" } },
            { Email: { $regex: search, $options: "i" } },
            { userName: { $regex: search, $options: "i" } },
            { Position: { $regex: search, $options: "i" } },
            { Department: { $regex: search, $options: "i" } },
            { ReferenceID: { $regex: search, $options: "i" } },
            { Role: { $regex: search, $options: "i" } },
            { Manager: { $regex: search, $options: "i" } },
            { TSM: { $regex: search, $options: "i" } },
            { Status: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await db.collection("users").find(filter).project({ password: 0 }).toArray();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}
