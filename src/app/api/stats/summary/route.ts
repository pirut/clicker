import { NextResponse } from "next/server";

import { getTotalClickCountSnapshot } from "@/lib/click-stats.server";

export async function GET() {
    try {
        const snapshot = await getTotalClickCountSnapshot();
        return NextResponse.json(snapshot);
    } catch (error) {
        console.error("Failed to fetch total click snapshot", error);
        return NextResponse.json({ error: "Unable to load click stats" }, { status: 500 });
    }
}
