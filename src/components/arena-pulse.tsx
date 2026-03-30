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
        return { label: "Overdrive", accent: "text-accent", surface: "border-accent/30 bg-accent/8" };
    }
    if (clicksPerMinute >= 12) {
        return { label: "Hot", accent: "text-accent", surface: "border-accent/25 bg-accent/6" };
    }
    if (clicksPerMinute >= 5) {
        return { label: "Warm", accent: "text-primary", surface: "border-primary/25 bg-primary/6" };
    }
    return { label: "Calm", accent: "text-muted-foreground", surface: "border-border/40 bg-secondary/40" };
}

export function ArenaPulse({ className }: ArenaPulseProps) {
    const { isSignedIn } = useUser();
    const { data, isLoading } = db.useQuery({
        clicks: {
            $: { order: { createdAt: "desc" }, limit: 160 },
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

        return {
            lastMinuteCount: lastMinute.length,
            activeClickers: clickerCounts.size,
            hottestPlayer,
        };
    }, [clicks, now]);

    const livePeople = useMemo(() => {
        return peerList.slice(0, 5).map((peer, index) => ({
            id: `${peer.name}-${index}`,
            name: peer.name || "Arena player",
            profileImageUrl: peer.profileImageUrl,
            cursorColor: peer.cursorColor,
            hatSlug: peer.hatSlug,
            accessorySlug: peer.accessorySlug,
            effectSlug: peer.effectSlug,
            clicksGiven: peer.clicksGiven || 0,
        }));
    }, [peerList]);

    const onlineNow = peerList.length + (isSignedIn ? 1 : 0);
    const tempo = getTempoTone(recentWindow.lastMinuteCount);

    return (
        <section className={cn("kraft-label overflow-hidden", className)}>
            <div className="border-b border-border/40 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Arena Pulse</p>
                        <h2 className="mt-1 text-sm font-semibold tracking-tight sm:text-base">Room tempo & traffic</h2>
                    </div>
                    <div className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", tempo.surface, tempo.accent)}>
                        {tempo.label}
                    </div>
                </div>
            </div>

            <div className="grid gap-3 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/40 bg-secondary/40 p-3">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            <Radio className="h-3 w-3" />
                            Online
                        </div>
                        <p className="mt-1.5 font-mono text-xl font-bold">{onlineNow}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">In the room now</p>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-secondary/40 p-3">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            <Waves className="h-3 w-3" />
                            Pace
                        </div>
                        <p className="mt-1.5 font-mono text-xl font-bold">{recentWindow.lastMinuteCount}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">Clicks / minute</p>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-secondary/40 p-3">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            Active
                        </div>
                        <p className="mt-1.5 font-mono text-xl font-bold">{recentWindow.activeClickers}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">Last 5 minutes</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-secondary/40 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Room Pressure</p>
                            <p className="mt-1 text-sm">
                                {recentWindow.hottestPlayer
                                    ? `${recentWindow.hottestPlayer.name} is setting the pace with ${recentWindow.hottestPlayer.count} recent clicks.`
                                    : "Waiting for the next run."}
                            </p>
                        </div>
                        <Flame className={cn("h-4 w-4 flex-shrink-0", tempo.accent)} />
                    </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-secondary/40 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Seen Live</p>
                        {!isLoading && onlineNow > 0 && (
                            <span className="text-[10px] text-muted-foreground">Updated continuously</span>
                        )}
                    </div>

                    {livePeople.length > 0 ? (
                        <div className="mt-2.5 flex flex-wrap gap-2.5">
                            {livePeople.map((peer) => (
                                <div key={peer.id} className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-2.5 py-1.5">
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
                                        <p className="truncate text-xs font-medium">{peer.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{peer.clicksGiven} clicks</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                            {isLoading ? "Listening..." : "No one else here yet."}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
