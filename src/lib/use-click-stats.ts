"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useClickStatsContext } from "@/components/click-stats-provider";

type PollState<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
};

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

function usePollingJson<T>(endpoint: string | null, intervalMs: number) {
    const [state, setState] = useState<PollState<T>>({
        data: null,
        isLoading: Boolean(endpoint),
        error: null,
    });

    const abortRef = useRef<AbortController | null>(null);

    const fetchNow = useCallback(async () => {
        if (!endpoint) {
            setState({ data: null, isLoading: false, error: null });
            return;
        }

        setState((prev) => ({ ...prev, isLoading: prev.data === null }));

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(endpoint, {
                cache: "no-store",
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`Request failed with ${response.status}`);
            }

            const json = (await response.json()) as T;

            setState({
                data: json,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            if (controller.signal.aborted) {
                return;
            }

            const message = error instanceof Error ? error.message : "Unknown error";
            setState((prev) => ({
                data: prev.data,
                isLoading: false,
                error: message,
            }));
        }
    }, [endpoint]);

    useEffect(() => {
        if (!endpoint) {
            setState({ data: null, isLoading: false, error: null });
            return;
        }

        setState({ data: null, isLoading: true, error: null });
        void fetchNow();
        const timer = setInterval(() => {
            void fetchNow();
        }, intervalMs);

        return () => {
            clearInterval(timer);
            abortRef.current?.abort();
        };
    }, [endpoint, intervalMs, fetchNow]);

    return {
        ...state,
        refresh: fetchNow,
    };
}

function normalizeUserId(userId: string) {
    return userId.startsWith("user_") ? userId : `user_${userId}`;
}

export function useTotalClickStats() {
    const { totalClicks, isLoading, error } = useClickStatsContext();

    const data: TotalClicksSnapshot | null = isLoading
        ? null
        : {
              totalClicks,
              generatedAt: Date.now(),
              scannedRows: totalClicks,
              truncated: false,
          };

    return {
        data,
        isLoading,
        error,
        refresh: async () => undefined,
        totalClicks,
    };
}

export function useLeaderboardStats(intervalMs = 4_000) {
    const state = usePollingJson<LeaderboardSnapshot>("/api/stats/leaderboard", intervalMs);

    return {
        ...state,
        entries: state.data?.entries ?? [],
        totalClicks: state.data?.totalClicks ?? 0,
        truncated: state.data?.truncated ?? false,
    };
}

export function useUserClickCount(userId?: string | null) {
    const { countsByUser, isLoading, error } = useClickStatsContext();
    const normalizedUserId = userId ? normalizeUserId(userId) : null;
    const clickCount = normalizedUserId ? countsByUser.get(normalizedUserId) ?? 0 : 0;

    const data: UserClickCountSnapshot | null = !normalizedUserId || isLoading
        ? null
        : {
              userId: normalizedUserId,
              clickCount,
              generatedAt: Date.now(),
              scannedRows: clickCount,
              truncated: false,
          };

    return {
        data,
        isLoading,
        error,
        refresh: async () => undefined,
        clickCount,
        truncated: false,
    };
}
