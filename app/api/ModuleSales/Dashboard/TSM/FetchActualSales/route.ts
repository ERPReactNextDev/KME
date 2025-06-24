import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.Fluxx_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("Fluxx_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tsm = searchParams.get("tsm");

        if (!tsm) {
            return NextResponse.json({ success: false, error: "tsm is required." }, { status: 400 });
        }

        // Fetch total actual sales for today based on date_created
        const Xchire_fetch = await Xchire_sql`
            SELECT COALESCE(SUM(actualsales), 0) AS totalActualSales 
            FROM progress 
            WHERE tsm = ${tsm} 
            AND DATE_TRUNC('day', date_created) = CURRENT_DATE
        `;

        const totalActualSales = Xchire_fetch.length > 0 ? Xchire_fetch[0].totalactualsales : 0;

        return NextResponse.json({ success: true, totalActualSales }, { status: 200 });
    } catch (Xchire_error: any) {
        console.error("Error fetching actual sales data:", Xchire_error);
        return NextResponse.json(
            { success: false, error: Xchire_error.message || "Failed to fetch actual sales data." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
