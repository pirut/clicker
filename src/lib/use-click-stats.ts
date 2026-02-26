"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

export function useTotalClickStats(intervalMs = 15_000) {
    const state = usePollingJson<TotalClicksSnapshot>("/api/stats/summary", intervalMs);

    return {
        ...state,
        totalClicks: state.data?.totalClicks ?? 0,
    };
}

export function useLeaderboardStats(intervalMs = 20_000) {
    const state = usePollingJson<LeaderboardSnapshot>("/api/stats/leaderboard", intervalMs);

    return {
        ...state,
        entries: state.data?.entries ?? [],
        totalClicks: state.data?.totalClicks ?? 0,
        truncated: state.data?.truncated ?? false,
    };
}

export function useUserClickCount(userId?: string | null, intervalMs = 10_000) {
    const endpoint = userId ? `/api/stats/user/${encodeURIComponent(userId)}` : null;
    const state = usePollingJson<UserClickCountSnapshot>(endpoint, intervalMs);

    return {
        ...state,
        clickCount: state.data?.clickCount ?? 0,
        truncated: state.data?.truncated ?? false,
    };
}
