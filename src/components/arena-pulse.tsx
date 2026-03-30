"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Flame, Radio, Users, Waves } from "lucide-react";

import { db } from "@/lib/instantdb";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";

const room = db.room("chat", "main");

type ArenaPulseProps = {
    className?: string;
};

function getTempoTone(clicksPerMinute: number) {
    if (clicksPerMinute >= 24) {
        return {
            label: "Overdrive",
            accent: "text-rose-500 dark:text-rose-300",
            surface: "border-rose-400/35 bg-rose-500/8",
        };
    }

    if (clicksPerMinute >= 12) {
        return {
            label: "Hot",
            accent: "text-amber-600 dark:text-amber-300",
            surface: "border-amber-400/35 bg-amber-500/10",
        };
    }

    if (clicksPerMinute >= 5) {
        return {
            label: "Warm",
            accent: "text-emerald-600 dark:text-emerald-300",
            surface: "border-emerald-400/35 bg-emerald-500/10",
        };
    }

    return {
        label: "Calm",
        accent: "text-muted-foreground",
        surface: "border-border/70 bg-card/55",
    };
}

export function ArenaPulse({ className }: ArenaPulseProps) {
    const { isSignedIn } = useUser();
    const { data, isLoading } = db.useQuery({
        clicks: {
            $: {
                order: { createdAt: "desc" },
                limit: 160,
            },
            author: {},
        },
    });
    const { peers } = room.usePresence({
        keys: ["name", "profileImageUrl", "cursorColor", "hatSlug", "accessorySlug", "effectSlug", "clicksGiven"],
    });
    const peerList = useMemo(() => Object.values(peers), [peers]);

    const now = Date.now();
    const clicks = useMemo(() => data?.clicks ?? [], [data?.clicks]);

    const recentWindow = useMemo(() => {
        const lastMinute = clicks.filter((click) => now - click.createdAt <= 60_000);
        const lastFiveMinutes = clicks.filter((click) => now - click.createdAt <= 5 * 60_000);
        const clickerCounts = new Map<string, { name: string; count: number }>();

        lastFiveMinutes.forEach((click) => {
            const key = click.author?.userId || click.userId || click.id;
            const existing = clickerCounts.get(key);

            clickerCounts.set(key, {
                name: click.author?.displayName || "Anonymous",
                count: (existing?.count ?? 0) + 1,
            });
        });

        const hottestPlayer = Array.from(clickerCounts.values()).sort((a, b) => b.count - a.count)[0];
        const activeClickers = clickerCounts.size;

        return {
            lastMinuteCount: lastMinute.length,
            activeClickers,
            hottestPlayer,
        };
    }, [clicks, now]);

    const livePeople = useMemo(() => {
        const online = peerList.slice(0, 5).map((peer, index) => ({
            id: `${peer.name}-${index}`,
            name: peer.name || "Arena player",
            profileImageUrl: peer.profileImageUrl,
            cursorColor: peer.cursorColor,
            hatSlug: peer.hatSlug,
            accessorySlug: peer.accessorySlug,
            effectSlug: peer.effectSlug,
            clicksGiven: peer.clicksGiven || 0,
        }));

        return online;
    }, [peerList]);

    const onlineNow = peerList.length + (isSignedIn ? 1 : 0);
    const tempo = getTempoTone(recentWindow.lastMinuteCount);

    return (
        <section className={cn("glass overflow-hidden rounded-3xl border border-border/75", className)}>
            <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Arena Pulse</p>
                        <h2 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">Live room tempo and player traffic</h2>
                    </div>
                    <div
                        className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            tempo.surface,
                            tempo.accent
                        )}
                    >
                        {tempo.label}
                    </div>
                </div>
            </div>

            <div className="grid gap-3 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-card/55 p-3.5">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            <Radio className="h-3.5 w-3.5" />
                            Online
                        </div>
                        <p className="mt-2 font-mono text-2xl font-bold text-foreground">{onlineNow}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Players in the room right now</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/55 p-3.5">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            <Waves className="h-3.5 w-3.5" />
                            Pace
                        </div>
                        <p className="mt-2 font-mono text-2xl font-bold text-foreground">{recentWindow.lastMinuteCount}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Clicks fired in the last minute</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/55 p-3.5">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            Active
                        </div>
                        <p className="mt-2 font-mono text-2xl font-bold text-foreground">{recentWindow.activeClickers}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Unique clickers in the last 5 minutes</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Room Pressure</p>
                            <p className="mt-1 text-sm text-foreground">
                                {recentWindow.hottestPlayer
                                    ? `${recentWindow.hottestPlayer.name} is setting the pace with ${recentWindow.hottestPlayer.count} recent clicks.`
                                    : "The room is waiting for the next run."}
                            </p>
                        </div>
                        <Flame className={cn("h-5 w-5 flex-shrink-0", tempo.accent)} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Seen Live</p>
                        {!isLoading && onlineNow > 0 ? (
                            <span className="text-xs text-muted-foreground">Updated continuously</span>
                        ) : null}
                    </div>

                    {livePeople.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {livePeople.map((peer) => (
                                <div key={peer.id} className="flex items-center gap-2 rounded-2xl border border-border/65 bg-background/55 px-2.5 py-2">
                                    <UserAvatar
                                        size="sm"
                                        cursorColor={peer.cursorColor}
                                        fallbackSeed={peer.name}
                                        profileImageUrl={peer.profileImageUrl}
                                        hatSlug={peer.hatSlug}
                                        accessorySlug={peer.accessorySlug}
                                        effectSlug={peer.effectSlug}
                                        clicksGiven={peer.clicksGiven}
                                        showClicksBadge={false}
                                        showParticles={false}
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{peer.name}</p>
                                        <p className="text-xs text-muted-foreground">{peer.clicksGiven} total clicks</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                            {isLoading ? "Listening for activity..." : "No one else is in the room yet."}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
