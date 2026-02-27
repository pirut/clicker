"use client";

import { db } from "@/lib/instantdb";
import { getStableHslColor } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "./user-avatar";
import { useTotalClickStats } from "@/lib/use-click-stats";

function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
}

export default function LatestClicks() {
    const { data: latestClicksData, isLoading: latestClicksLoading } = db.useQuery({
        clicks: {
            $: {
                order: { createdAt: "desc" },
                limit: 8,
            },
            author: {},
        },
    });

    const { totalClicks } = useTotalClickStats();

    if (!latestClicksData && latestClicksLoading) {
        return (
            <div className="mx-auto w-full max-w-md">
                <div className="glass overflow-hidden rounded-3xl border border-border/75">
                    <div className="border-b border-border/70 px-5 py-4">
                        <div className="h-6 w-36 animate-pulse rounded-full bg-muted/70" />
                    </div>
                    <div className="space-y-2 p-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted/65" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-28 rounded-full bg-muted/65" />
                                    <div className="h-3 w-20 rounded-full bg-muted/45" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const clicks = latestClicksData?.clicks || [];

    return (
        <div className="mx-auto w-full max-w-md">
            <div className="glass overflow-hidden rounded-3xl border border-border/75">
                <div className="relative border-b border-border/70 bg-gradient-to-r from-primary/15 via-accent/8 to-transparent px-4 py-4 sm:px-5">
                    <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-primary/15 blur-2xl" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live Activity</p>
                            <h2 className="truncate text-base font-semibold tracking-tight sm:text-lg">Newest clicks in the arena</h2>
                        </div>
                        <div className="relative z-10 flex flex-col items-end rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2">
                            <span className="font-mono text-lg font-bold leading-none text-primary sm:text-2xl">{totalClicks.toLocaleString()}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                        </div>
                    </div>
                </div>

                <div className="p-2.5 sm:p-3">
                    <AnimatePresence mode="popLayout">
                        {clicks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-2xl border border-dashed border-border/70 bg-muted/30 py-12 text-center"
                            >
                                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-card/90 text-2xl">👆</div>
                                <p className="font-medium">No clicks yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">Claim the first click and set the tone.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-1">
                                {clicks.map((click, index) => {
                                    const displayName = click.author?.displayName || "Clicker";
                                    const cursorColor = click.author?.cursorColor;
                                    const hatSlug = click.author?.hatSlug;
                                    const accessorySlug = click.author?.accessorySlug;
                                    const effectSlug = click.author?.effectSlug;
                                    const profileImageUrl = click.author?.profileImageUrl;
                                    const color = cursorColor || getStableHslColor(displayName);

                                    return (
                                        <motion.div
                                            key={click.id}
                                            initial={{ opacity: 0, x: -20, scale: 0.98 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.96 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                                delay: index * 0.03,
                                            }}
                                            className="group relative"
                                        >
                                            <div
                                                className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all duration-200 hover:border-border/75 hover:bg-muted/30"
                                                style={{
                                                    background:
                                                        index === 0
                                                            ? `linear-gradient(90deg, ${color}14 0%, transparent 65%)`
                                                            : undefined,
                                                }}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <UserAvatar
                                                        size="sm"
                                                        cursorColor={cursorColor}
                                                        fallbackSeed={displayName}
                                                        profileImageUrl={profileImageUrl}
                                                        hatSlug={hatSlug}
                                                        accessorySlug={accessorySlug}
                                                        effectSlug={effectSlug}
                                                        showClicksBadge={false}
                                                        showParticles={index < 2}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="truncate text-sm font-semibold"
                                                            style={{ color: index === 0 ? color : undefined }}
                                                        >
                                                            {displayName}
                                                        </span>
                                                        {index === 0 && (
                                                            <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
                                                                Latest
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground/80">
                                                        <span>clicked</span>
                                                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                        <span className="font-mono">{formatRelativeTime(click.createdAt)}</span>
                                                    </p>
                                                </div>

                                                <div
                                                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-xl opacity-40 transition-opacity group-hover:opacity-80"
                                                    style={{ background: `${color}20` }}
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-1 bg-gradient-to-r from-primary/40 via-accent/45 to-primary/40" />
            </div>
        </div>
    );
}
