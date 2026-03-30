"use client";

import { db } from "@/lib/instantdb";
import { cn, getStableHslColor } from "@/lib/utils";
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

export default function LatestClicks({ className }: { className?: string }) {
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
            <div className={cn("w-full", className)}>
                <div className="kraft-label overflow-hidden">
                    <div className="border-b border-border/40 px-5 py-4">
                        <div className="h-5 w-32 animate-pulse rounded-full bg-muted/50" />
                    </div>
                    <div className="space-y-2 p-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl p-2.5">
                                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted/40" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 w-24 rounded-full bg-muted/40" />
                                    <div className="h-3 w-16 rounded-full bg-muted/30" />
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
        <div className={cn("w-full", className)}>
            <div className="kraft-label overflow-hidden">
                <div className="border-b border-border/40 px-4 py-4 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Live Activity</p>
                            <h2 className="truncate text-sm font-semibold tracking-tight sm:text-base">Newest clicks</h2>
                        </div>
                        <div className="flex flex-col items-end rounded-xl border border-border/40 bg-secondary/60 px-3 py-1.5">
                            <span className="font-mono text-base font-bold leading-none sm:text-lg">{totalClicks.toLocaleString()}</span>
                            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Total</span>
                        </div>
                    </div>
                </div>

                <div className="p-2.5 sm:p-3">
                    <AnimatePresence mode="popLayout">
                        {clicks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-xl border border-dashed border-border/50 py-10 text-center"
                            >
                                <p className="text-2xl">👆</p>
                                <p className="mt-2 text-sm font-medium">No clicks yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">Claim the first click.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-0.5">
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
                                            initial={{ opacity: 0, x: -16, scale: 0.98 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 16, scale: 0.96 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                                delay: index * 0.03,
                                            }}
                                            className="group"
                                        >
                                            <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors duration-150 hover:bg-secondary/40">
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
                                                        <span className="truncate text-sm font-semibold">{displayName}</span>
                                                        {index === 0 && (
                                                            <span className="rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-accent">
                                                                Latest
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <span>clicked</span>
                                                        <span className="inline-block h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                                                        <span className="font-mono">{formatRelativeTime(click.createdAt)}</span>
                                                    </p>
                                                </div>

                                                <div
                                                    className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg opacity-30 transition-opacity group-hover:opacity-60"
                                                    style={{ background: `${color}18` }}
                                                >
                                                    <svg className="h-3 w-3" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={2}>
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
            </div>
        </div>
    );
}
