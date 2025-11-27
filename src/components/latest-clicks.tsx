"use client";
import { db } from "@/lib/instantdb";
import { getStableHslColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "./user-avatar";

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

    // Query for total clicks count
    const { data: totalClicksData } = db.useQuery({
        clicks: {
            $: {
                limit: 50000,
            },
        },
    });

    const totalClicks = totalClicksData?.clicks?.length || 0;

    if (!latestClicksData && latestClicksLoading) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="glass rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5">
                        <div className="h-5 sm:h-6 w-28 sm:w-32 bg-muted/50 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/30 dark:bg-white/5 animate-pulse">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/50 dark:bg-white/10 flex-shrink-0" />
                                <div className="flex-1 space-y-1.5 sm:space-y-2">
                                    <div className="h-3 sm:h-4 w-20 sm:w-24 bg-muted/50 dark:bg-white/10 rounded" />
                                    <div className="h-2.5 sm:h-3 w-14 sm:w-16 bg-muted/30 dark:bg-white/5 rounded" />
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
        <div className="w-full max-w-md mx-auto">
            <div className="glass rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 dark:border-white/5">
                {/* Header with Total Clicks */}
                <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-border/50 dark:border-white/5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400/50 animate-ping" />
                            </div>
                            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground/90 truncate">
                                Live Activity
                            </h2>
                        </div>
                        {/* Total Clicks Counter - Prominent */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-primary/20 flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                            </svg>
                            <span className="text-sm sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                {totalClicks.toLocaleString()}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium hidden xs:inline">total</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="p-2 sm:p-3">
                    <AnimatePresence mode="popLayout">
                        {clicks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 sm:py-12 text-muted-foreground"
                            >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-muted/30 dark:bg-white/5 flex items-center justify-center">
                                    <span className="text-xl sm:text-2xl">👆</span>
                                </div>
                                <p className="font-medium text-sm sm:text-base">No clicks yet</p>
                                <p className="text-xs sm:text-sm text-muted-foreground/60 mt-1">Be the first to click!</p>
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
                                                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 500,
                                                                damping: 30,
                                                                delay: index * 0.03,
                                                            }}
                                                            className="group relative"
                                                        >
                                                            <div
                                                                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-muted/30 dark:hover:bg-white/5 cursor-default"
                                                                style={{
                                                                    background: index === 0 ? `linear-gradient(90deg, ${color}10 0%, transparent 100%)` : undefined,
                                                                }}
                                                            >
                                                                {/* Avatar with Profile Picture and Effects */}
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
                                                                        showParticles={index === 0} // Only show particles for the most recent click
                                                                    />
                                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <span
                                                            className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px]"
                                                            style={{ color: index === 0 ? color : undefined }}
                                                        >
                                                            {displayName}
                                                        </span>
                                                        {index === 0 && (
                                                            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                                                Latest
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs text-muted-foreground/60 flex items-center gap-1 sm:gap-1.5 mt-0.5">
                                                        <span>clicked</span>
                                                        <span className="inline-block w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-muted-foreground/30" />
                                                        <span className="font-mono">{formatRelativeTime(click.createdAt)}</span>
                                                    </p>
                                                </div>

                                                {/* Click indicator */}
                                                <div
                                                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0"
                                                    style={{ background: `${color}15` }}
                                                >
                                                    <svg
                                                        className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                                                        fill="none"
                                                        stroke={color}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Subtle divider */}
                                            {index < clicks.length - 1 && (
                                                <div className="mx-2 sm:mx-3 h-px bg-gradient-to-r from-transparent via-border/50 dark:via-white/5 to-transparent" />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer gradient */}
                <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
            </div>
        </div>
    );
}
