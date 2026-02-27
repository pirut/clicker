"use client";

import { createContext, useContext, useMemo } from "react";

import { db } from "@/lib/instantdb";

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

export type ClickProfile = {
    displayName: string;
    cursorColor?: string;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    profileImageUrl?: string;
};

type ClickStatsContextValue = {
    totalClicks: number;
    countsByUser: Map<string, number>;
    profilesByUser: Map<string, ClickProfile>;
    isLoading: boolean;
    error: string | null;
};

const ClickStatsContext = createContext<ClickStatsContextValue | null>(null);

function normalizeUserId(userId: string) {
    return userId.startsWith("user_") ? userId : `user_${userId}`;
}

export function ClickStatsProvider({ children }: { children: React.ReactNode }) {
    const { data, isLoading, error } = db.useQuery({
        clicks: {
            $: {
                fields: ["userId"],
            },
        },
        displayNames: {
            $: {
                fields: ["userId", "displayName", "cursorColor", "hatSlug", "accessorySlug", "effectSlug", "profileImageUrl"],
            },
        },
    });

    const value = useMemo<ClickStatsContextValue>(() => {
        const clickRows = (data?.clicks ?? []) as ClickRow[];
        const displayNameRows = (data?.displayNames ?? []) as DisplayNameRow[];
        const countsByUser = new Map<string, number>();
        const profilesByUser = new Map<string, ClickProfile>();

        for (const row of clickRows) {
            if (!row.userId) continue;
            const normalized = normalizeUserId(row.userId);
            countsByUser.set(normalized, (countsByUser.get(normalized) ?? 0) + 1);
        }

        for (const row of displayNameRows) {
            if (!row.userId) continue;
            const normalized = normalizeUserId(row.userId);
            profilesByUser.set(normalized, {
                displayName: row.displayName || "Anonymous",
                cursorColor: row.cursorColor,
                hatSlug: row.hatSlug,
                accessorySlug: row.accessorySlug,
                effectSlug: row.effectSlug,
                profileImageUrl: row.profileImageUrl,
            });
        }

        return {
            totalClicks: clickRows.length,
            countsByUser,
            profilesByUser,
            isLoading,
            error: error?.message ?? null,
        };
    }, [data?.clicks, data?.displayNames, isLoading, error]);

    return <ClickStatsContext.Provider value={value}>{children}</ClickStatsContext.Provider>;
}

export function useClickStatsContext() {
    const context = useContext(ClickStatsContext);

    if (!context) {
        throw new Error("useClickStatsContext must be used within ClickStatsProvider");
    }

    return context;
}
