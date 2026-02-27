"use client";

import { useMemo } from "react";

import { useClickStatsContext } from "@/components/click-stats-provider";

type TotalClicksSnapshot = {
    totalClicks: number;
    generatedAt: number;
    scannedRows: number;
    truncated: boolean;
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

type LeaderboardSnapshot = {
    totalClicks: number;
    generatedAt: number;
    scannedRows: number;
    truncated: boolean;
    entries: LeaderboardEntry[];
};

type UserClickCountSnapshot = {
    userId: string;
    clickCount: number;
    generatedAt: number;
    scannedRows: number;
    truncated: boolean;
};

function normalizeUserId(userId: string) {
    return userId.startsWith("user_") ? userId : `user_${userId}`;
}

export function useTotalClickStats() {
    const { totalClicks, isLoading, error } = useClickStatsContext();

    const data = useMemo<TotalClicksSnapshot | null>(() => {
        if (isLoading) return null;

        return {
            totalClicks,
            generatedAt: Date.now(),
            scannedRows: totalClicks,
            truncated: false,
        };
    }, [isLoading, totalClicks]);

    return {
        data,
        isLoading,
        error,
        refresh: async () => undefined,
        totalClicks,
    };
}

export function useLeaderboardStats(limit = 100) {
    const { totalClicks, countsByUser, profilesByUser, isLoading, error } = useClickStatsContext();

    const entries = useMemo<LeaderboardEntry[]>(() => {
        return Array.from(countsByUser.entries())
            .map(([userId, count]) => {
                const profile = profilesByUser.get(userId);

                return {
                    userId,
                    count,
                    displayName: profile?.displayName || "Anonymous",
                    cursorColor: profile?.cursorColor,
                    hatSlug: profile?.hatSlug,
                    accessorySlug: profile?.accessorySlug,
                    effectSlug: profile?.effectSlug,
                    profileImageUrl: profile?.profileImageUrl,
                };
            })
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.userId.localeCompare(b.userId);
            })
            .slice(0, Math.max(1, Math.min(limit, 100)));
    }, [countsByUser, profilesByUser, limit]);

    const data = useMemo<LeaderboardSnapshot | null>(() => {
        if (isLoading) return null;

        return {
            totalClicks,
            generatedAt: Date.now(),
            scannedRows: totalClicks,
            truncated: false,
            entries,
        };
    }, [entries, isLoading, totalClicks]);

    return {
        data,
        isLoading,
        error,
        refresh: async () => undefined,
        entries,
        totalClicks,
        truncated: false,
    };
}

export function useUserClickCount(userId?: string | null) {
    const { countsByUser, isLoading, error } = useClickStatsContext();
    const normalizedUserId = userId ? normalizeUserId(userId) : null;
    const clickCount = normalizedUserId ? countsByUser.get(normalizedUserId) ?? 0 : 0;

    const data = useMemo<UserClickCountSnapshot | null>(() => {
        if (!normalizedUserId || isLoading) return null;

        return {
            userId: normalizedUserId,
            clickCount,
            generatedAt: Date.now(),
            scannedRows: clickCount,
            truncated: false,
        };
    }, [normalizedUserId, isLoading, clickCount]);

    return {
        data,
        isLoading,
        error,
        refresh: async () => undefined,
        clickCount,
        truncated: false,
    };
}
