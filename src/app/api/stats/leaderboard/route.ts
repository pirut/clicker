import { NextResponse } from "next/server";

import { getLeaderboardSnapshot } from "@/lib/click-stats.server";

export async function GET() {
    try {
        const snapshot = await getLeaderboardSnapshot(100);
        return NextResponse.json(snapshot);
    } catch (error) {
        console.error("Failed to fetch leaderboard snapshot", error);
        return NextResponse.json({ error: "Unable to load leaderboard" }, { status: 500 });
    }
}
