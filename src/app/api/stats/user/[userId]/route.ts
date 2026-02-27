import { NextResponse } from "next/server";

import { getUserClickCountSnapshot } from "@/lib/click-stats.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
    "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
};

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        const normalizedUserId = userId.startsWith("user_") ? userId : `user_${userId}`;
        const snapshot = await getUserClickCountSnapshot(normalizedUserId);
        return NextResponse.json(snapshot, {
            headers: NO_STORE_HEADERS,
        });
    } catch (error) {
        console.error("Failed to fetch user click snapshot", error);
        return NextResponse.json({ error: "Unable to load user stats" }, { status: 500, headers: NO_STORE_HEADERS });
    }
}
