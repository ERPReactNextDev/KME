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
        const manager = searchParams.get("manager");

        if (!manager) {
            return NextResponse.json({ success: false, error: "manager is required." }, { status: 400 });
        }

        // Fetch Inbound & Outbound Calls separately using DATE_TRUNC for timestamp compatibility
        const [outboundResult, inboundResult] = await Promise.all([
            Xchire_sql`SELECT COUNT(*)::int AS total FROM progress WHERE manager = ${manager} AND typeactivity = 'Outbound Call' AND DATE_TRUNC('day', date_created) = CURRENT_DATE`,
            Xchire_sql`SELECT COUNT(*)::int AS total FROM progress WHERE manager = ${manager} AND typeactivity = 'Inbound Call' AND DATE_TRUNC('day', date_created) = CURRENT_DATE`
        ]);

        // Debugging logs (optional)
        console.log("Outbound Result:", outboundResult);
        console.log("Inbound Result:", inboundResult);

        const totalOutbound = outboundResult.length > 0 ? outboundResult[0].total : 0;
        const totalInbound = inboundResult.length > 0 ? inboundResult[0].total : 0;

        return NextResponse.json({ success: true, totalOutbound, totalInbound }, { status: 200 });
    } catch (Xchire_error: any) {
        console.error("Error fetching call data:", Xchire_error);
        return NextResponse.json(
            { success: false, error: Xchire_error.message || "Failed to fetch call data." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
