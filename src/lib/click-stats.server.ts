import "server-only";

import { unstable_cache } from "next/cache";

import { db as adminDb } from "@/lib/instantdb.server";

const PAGE_SIZE = 2_000;
const MAX_SCANNED_ROWS = 300_000;
const PROFILE_QUERY_CHUNK_SIZE = 100;

type ClickRow = {
    id: string;
    userId?: string;
};

type DisplayNameRow = {
    id: string;
    userId: string;
    displayName?: string;
    cursorColor?: string;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    profileImageUrl?: string;
};

export type LeaderboardEntry = {
    userId: string;
    count: number;
    displayName: string;
    cursorColor?: string;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    profileImageUrl?: string;
};

export type TotalClicksSnapshot = {
    totalClicks: number;
    generatedAt: number;
    scannedRows: number;
    truncated: boolean;
};

export type UserClickCountSnapshot = {
    userId: string;
    clickCount: number;
    generatedAt: number;
    scannedRows: number;
    truncated: boolean;
};

export type LeaderboardSnapshot = {
    totalClicks: number;
    generatedAt: number;
    scannedRows: number;
    truncated: boolean;
    entries: LeaderboardEntry[];
};

function normalizeClerkUserId(userId: string) {
    return userId.startsWith("user_") ? userId : `user_${userId}`;
}

async function countClicks(where?: { userId: string }) {
    let offset = 0;
    let total = 0;
    let truncated = false;

    while (offset < MAX_SCANNED_ROWS) {
        const limit = Math.min(PAGE_SIZE, MAX_SCANNED_ROWS - offset);

        const { clicks } = await adminDb.query(
            where
                ? {
                      clicks: {
                          $: {
                              where,
                              fields: ["id"],
                              order: { createdAt: "asc" },
                              limit,
                              offset,
                          },
                      },
                  }
                : {
                      clicks: {
                          $: {
                              fields: ["id"],
                              order: { createdAt: "asc" },
                              limit,
                              offset,
                          },
                      },
                  }
        );

        const rows = clicks as ClickRow[];
        total += rows.length;

        if (rows.length < limit) {
            return { total, scannedRows: total, truncated };
        }

        offset += limit;
    }

    truncated = true;
    return { total, scannedRows: total, truncated };
}

async function scanClicksByUserId() {
    const counts = new Map<string, number>();

    let offset = 0;
    let totalClicks = 0;
    let truncated = false;

    while (offset < MAX_SCANNED_ROWS) {
        const limit = Math.min(PAGE_SIZE, MAX_SCANNED_ROWS - offset);

        const { clicks } = await adminDb.query({
            clicks: {
                $: {
                    fields: ["userId"],
                    order: { createdAt: "asc" },
                    limit,
                    offset,
                },
            },
        });

        const rows = clicks as ClickRow[];

        if (rows.length === 0) {
            return { counts, totalClicks, scannedRows: totalClicks, truncated };
        }

        for (const row of rows) {
            if (!row.userId) continue;
            totalClicks += 1;
            counts.set(row.userId, (counts.get(row.userId) ?? 0) + 1);
        }

        if (rows.length < limit) {
            return { counts, totalClicks, scannedRows: totalClicks, truncated };
        }

        offset += limit;
    }

    truncated = true;
    return { counts, totalClicks, scannedRows: totalClicks, truncated };
}

function chunkArray<T>(items: T[], chunkSize: number) {
    const chunks: T[][] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
        chunks.push(items.slice(i, i + chunkSize));
    }

    return chunks;
}

async function fetchProfilesForUserIds(userIds: string[]) {
    const profileMap = new Map<string, DisplayNameRow>();

    if (userIds.length === 0) {
        return profileMap;
    }

    for (const chunk of chunkArray(userIds, PROFILE_QUERY_CHUNK_SIZE)) {
        const { displayNames } = await adminDb.query({
            displayNames: {
                $: {
                    where: { userId: { $in: chunk } },
                    fields: [
                        "userId",
                        "displayName",
                        "cursorColor",
                        "hatSlug",
                        "accessorySlug",
                        "effectSlug",
                        "profileImageUrl",
                    ],
                },
            },
        });

        for (const profile of displayNames as DisplayNameRow[]) {
            profileMap.set(profile.userId, profile);
        }
    }

    return profileMap;
}

const getCachedTotalClicks = unstable_cache(
    async (): Promise<TotalClicksSnapshot> => {
        const { total, scannedRows, truncated } = await countClicks();

        return {
            totalClicks: total,
            generatedAt: Date.now(),
            scannedRows,
            truncated,
        };
    },
    ["clicker-total-clicks-v2"],
    { revalidate: 3 }
);

const getCachedUserClickCount = unstable_cache(
    async (rawUserId: string): Promise<UserClickCountSnapshot> => {
        const userId = normalizeClerkUserId(rawUserId);
        const { total, scannedRows, truncated } = await countClicks({ userId });

        return {
            userId,
            clickCount: total,
            generatedAt: Date.now(),
            scannedRows,
            truncated,
        };
    },
    ["clicker-user-clicks-v2"],
    { revalidate: 3 }
);

const getCachedLeaderboard = unstable_cache(
    async (limit: number): Promise<LeaderboardSnapshot> => {
        const safeLimit = Math.max(1, Math.min(limit, 100));
        const { counts, totalClicks, scannedRows, truncated } = await scanClicksByUserId();

        const sorted = Array.from(counts.entries())
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, safeLimit);

        const profiles = await fetchProfilesForUserIds(sorted.map((entry) => entry.userId));

        const entries: LeaderboardEntry[] = sorted.map((entry) => {
            const profile = profiles.get(entry.userId);

            return {
                userId: entry.userId,
                count: entry.count,
                displayName: profile?.displayName || "Anonymous",
                cursorColor: profile?.cursorColor,
                hatSlug: profile?.hatSlug,
                accessorySlug: profile?.accessorySlug,
                effectSlug: profile?.effectSlug,
                profileImageUrl: profile?.profileImageUrl,
            };
        });

        return {
            totalClicks,
            generatedAt: Date.now(),
            scannedRows,
            truncated,
            entries,
        };
    },
    ["clicker-leaderboard-v2"],
    { revalidate: 8 }
);

export async function getTotalClickCountSnapshot() {
    return getCachedTotalClicks();
}

export async function getUserClickCountSnapshot(userId: string) {
    return getCachedUserClickCount(userId);
}

export async function getLeaderboardSnapshot(limit = 100) {
    return getCachedLeaderboard(limit);
}
