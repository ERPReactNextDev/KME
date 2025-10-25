import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Validate environment variable and initialize database client
const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET() {
  try {
    // Fetch all progress records
    const Xchire_fetch = await Xchire_sql`
      SELECT * FROM progress ORDER BY companyname ASC;
    `;

    if (Xchire_fetch.length === 0) {
      return NextResponse.json(
        { success: false, data: [], error: "No records found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: Xchire_fetch },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch records." },
      { status: 500 }
    );
  }
}

// ✅ Disable caching to ensure real-time updates
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
