"use client";

import { createContext, useContext, useMemo } from "react";

import { db } from "@/lib/instantdb";

type ClickRow = {
    id: string;
    userId?: string;
};

type ClickStatsContextValue = {
    totalClicks: number;
    countsByUser: Map<string, number>;
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
    });

    const value = useMemo<ClickStatsContextValue>(() => {
        const rows = (data?.clicks ?? []) as ClickRow[];
        const countsByUser = new Map<string, number>();

        for (const row of rows) {
            if (!row.userId) continue;
            const normalized = normalizeUserId(row.userId);
            countsByUser.set(normalized, (countsByUser.get(normalized) ?? 0) + 1);
        }

        return {
            totalClicks: rows.length,
            countsByUser,
            isLoading,
            error: error?.message ?? null,
        };
    }, [data?.clicks, isLoading, error]);

    return <ClickStatsContext.Provider value={value}>{children}</ClickStatsContext.Provider>;
}

export function useClickStatsContext() {
    const context = useContext(ClickStatsContext);

    if (!context) {
        throw new Error("useClickStatsContext must be used within ClickStatsProvider");
    }

    return context;
}
