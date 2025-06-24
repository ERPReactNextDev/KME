import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.Fluxx_DB_URL;
if (!Xchire_databaseUrl) {
    throw new Error("Fluxx_DB_URL is not set in the environment variables.");
}

const Xchire_sql = neon(Xchire_databaseUrl);

async function update(
    id: string,
    referenceid: string,
    manager: string,
    tsm: string,
    companyname: string,
    contactperson: string,
    remarks: string,
    activitystatus: string,
) {
    try {
        if (!id || !companyname) {
            throw new Error("ID and company name are required.");
        }

        const Xchire_update = await Xchire_sql`
            UPDATE progress 
            SET 
                referenceid = ${referenceid},
                manager = ${manager},
                tsm = ${tsm},
                companyname = ${companyname},
                contactperson = ${contactperson},
                remarks = ${remarks},
                activitystatus = ${activitystatus},
                date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'
            WHERE id = ${id} 
            RETURNING *;
        `;

        return { success: true, data: Xchire_update };
    } catch (Xchire_error: any) {
        console.error("Error updating user:", Xchire_error);
        return { success: false, error: Xchire_error.message || "Failed to update user." };
    }
}

export async function PUT(req: Request) {
    try {
        const Xchire_body = await req.json();
        const {
            id,
            referenceid,
            manager,
            tsm,
            companyname,
            contactperson,
            remarks,
            activitystatus
        } = Xchire_body;

        const Xchire_result = await update(
            id, referenceid, manager, tsm, companyname, contactperson,
            remarks, activitystatus
        );

        return NextResponse.json(Xchire_result);
    } catch (Xchire_error: any) {
        console.error("Error in PUT /api/edituser:", Xchire_error);
        return NextResponse.json(
            { success: false, error: Xchire_error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
