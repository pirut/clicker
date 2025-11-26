"use client";
import { db } from "@/lib/instantdb";
import { getStableHslColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const hatSymbols: Record<string, string> = {
    "fun-hat": "🎩",
    "party-hat": "🥳",
    "crown": "👑",
    "wizard": "🧙",
    "cap": "🧢",
};

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

function ClickAvatar({
    cursorColor,
    displayName,
    hatSlug,
    profileImageUrl,
}: {
    cursorColor?: string;
    displayName: string;
    hatSlug?: string;
    profileImageUrl?: string;
}) {
    const color = cursorColor || getStableHslColor(displayName);
    const hatEmoji = hatSlug ? hatSymbols[hatSlug] || "🧢" : null;
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="relative">
            {hatEmoji && (
                <span
                    className="absolute -top-2.5 -left-1 text-base z-10"
                    style={{
                        transform: "rotate(-12deg)",
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                    }}
                >
                    {hatEmoji}
                </span>
            )}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden"
                style={{
                    background: profileImageUrl ? undefined : `linear-gradient(135deg, ${color}, ${color}dd)`,
                    boxShadow: `0 4px 14px ${color}40, 0 0 0 2px ${color}50`,
                }}
            >
                {profileImageUrl ? (
                    <img
                        src={profileImageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-white drop-shadow-md">{initial}</span>
                )}
            </div>
            {/* Glow ring */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
                    transform: "scale(1.4)",
                    zIndex: -1,
                }}
            />
        </div>
    );
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
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/5">
                        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                    <div className="h-3 w-16 bg-white/5 rounded" />
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
            <div className="glass rounded-2xl overflow-hidden border border-white/5">
                {/* Header with Total Clicks */}
                <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400/50 animate-ping" />
                            </div>
                            <h2 className="text-base font-semibold tracking-tight text-foreground/90">
                                Live Activity
                            </h2>
                        </div>
                        {/* Total Clicks Counter - Prominent */}
                        <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-xl border border-primary/20">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                            </svg>
                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                {totalClicks.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground/70 font-medium">total</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="p-3">
                    <AnimatePresence mode="popLayout">
                        {clicks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-muted-foreground"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                    <span className="text-2xl">👆</span>
                                </div>
                                <p className="font-medium">No clicks yet</p>
                                <p className="text-sm text-muted-foreground/60 mt-1">Be the first to click!</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-0.5">
                                {clicks.map((click, index) => {
                                    const displayName = click.author?.displayName || "Clicker";
                                    const cursorColor = click.author?.cursorColor;
                                    const hatSlug = click.author?.hatSlug;
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
                                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-default"
                                                style={{
                                                    background: index === 0 ? `linear-gradient(90deg, ${color}10 0%, transparent 100%)` : undefined,
                                                }}
                                            >
                                                {/* Avatar with Profile Picture */}
                                                <ClickAvatar
                                                    cursorColor={cursorColor}
                                                    displayName={displayName}
                                                    hatSlug={hatSlug}
                                                    profileImageUrl={profileImageUrl}
                                                />

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="font-semibold text-sm truncate max-w-[140px]"
                                                            style={{ color: index === 0 ? color : undefined }}
                                                        >
                                                            {displayName}
                                                        </span>
                                                        {index === 0 && (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                                                Latest
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5 mt-0.5">
                                                        <span>clicked</span>
                                                        <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                        <span className="font-mono">{formatRelativeTime(click.createdAt)}</span>
                                                    </p>
                                                </div>

                                                {/* Click indicator */}
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity"
                                                    style={{ background: `${color}15` }}
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
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
                                                <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
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
