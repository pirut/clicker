import { NextRequest, NextResponse } from "next/server";
import { init, id } from "@instantdb/admin";

// InstantDB app ID and admin token are loaded from environment variables
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANTDB_SECRET_KEY!;

const db = init({
    appId: APP_ID,
    adminToken: ADMIN_TOKEN,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Received body:", body);

        const { userId, createdAt } = body;
        if (!userId || !createdAt) {
            console.error("Missing userId or createdAt");
            return NextResponse.json({ error: "Missing userId or createdAt" }, { status: 400 });
        }

        // Write a new dollar record
        const txResult = await db.transact([
            db.tx.dollars[id()]
                .update({
                    userId,
                    createdAt,
                })
                .ruleParams({ hasCompletedPayment: true }),
        ]);

        return NextResponse.json({ success: true, txId: txResult["tx-id"] });
    } catch (err) {
        console.error("API route error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
