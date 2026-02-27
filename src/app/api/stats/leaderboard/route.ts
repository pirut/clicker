import { NextResponse } from "next/server";

import { getLeaderboardSnapshot } from "@/lib/click-stats.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
    "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
};

export async function GET() {
    try {
        const snapshot = await getLeaderboardSnapshot(100);
        return NextResponse.json(snapshot, {
            headers: NO_STORE_HEADERS,
        });
    } catch (error) {
        console.error("Failed to fetch leaderboard snapshot", error);
        return NextResponse.json({ error: "Unable to load leaderboard" }, { status: 500, headers: NO_STORE_HEADERS });
    }
}
