export const CLICK_STATS_INVALIDATE_EVENT = "clicker:stats-invalidate";

export type ClickStatsInvalidateDetail = {
    userId?: string;
    at: number;
};

export function dispatchClickStatsInvalidate(userId?: string) {
    if (typeof window === "undefined") {
        return;
    }

    const detail: ClickStatsInvalidateDetail = {
        userId,
        at: Date.now(),
    };

    window.dispatchEvent(new CustomEvent<ClickStatsInvalidateDetail>(CLICK_STATS_INVALIDATE_EVENT, { detail }));
}
