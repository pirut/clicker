"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserAvatar } from "@/components/user-avatar";
import { useLeaderboardStats } from "@/lib/use-click-stats";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
    const { entries: leaderboard, totalClicks, isLoading, error, truncated } = useLeaderboardStats();

    const getPlaceIcon = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 px-3 sm:px-4 pb-8 pt-24 sm:pt-28">
                <div className="w-full max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 text-center"
                    >
                        <h1 className="font-display text-3xl font-bold sm:text-4xl text-gradient">Leaderboard</h1>
                        <p className="mt-2 text-sm text-foreground/60">
                            Top 100 clickers — live from InstantDB
                        </p>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-5 flex flex-wrap items-center justify-center gap-3"
                    >
                        <div className="kraft-label inline-flex items-center gap-2 px-4 py-2">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Total clicks</span>
                            <span className="font-mono text-sm font-bold">{totalClicks.toLocaleString()}</span>
                        </div>
                        <div className="kraft-label inline-flex items-center gap-2 px-4 py-2">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Players</span>
                            <span className="font-mono text-sm font-bold">{leaderboard.length}</span>
                        </div>
                        {truncated && (
                            <div className="kraft-label inline-flex items-center gap-2 border-accent/30 px-4 py-2 text-accent">
                                <span className="text-[10px] uppercase tracking-widest">Partial snapshot</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="kraft-label overflow-hidden"
                    >
                        {isLoading ? (
                            <div className="py-16 text-center">
                                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading leaderboard...</p>
                            </div>
                        ) : error ? (
                            <div className="py-16 text-center">
                                <p className="text-sm text-destructive">Error: {error}</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-2xl">👆</p>
                                <p className="mt-2 text-sm text-muted-foreground">No clicks yet. Be the first.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14 text-center text-xs">Rank</TableHead>
                                            <TableHead className="text-xs pl-2">Player</TableHead>
                                            <TableHead className="text-center w-20 text-xs">Clicks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaderboard.map((entry, idx) => {
                                            const placeIcon = getPlaceIcon(idx);
                                            return (
                                                <TableRow
                                                    key={entry.userId}
                                                    className={idx < 3 ? "bg-primary/[0.03]" : ""}
                                                >
                                                    <TableCell className="text-center font-medium text-xs py-2.5">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {placeIcon && <span className="text-sm">{placeIcon}</span>}
                                                            <span>{idx + 1}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <UserAvatar
                                                                size="xs"
                                                                cursorColor={entry.cursorColor}
                                                                fallbackSeed={entry.displayName}
                                                                profileImageUrl={entry.profileImageUrl}
                                                                hatSlug={entry.hatSlug}
                                                                accessorySlug={entry.accessorySlug}
                                                                effectSlug={entry.effectSlug}
                                                                showClicksBadge={false}
                                                                showParticles={idx < 3}
                                                            />
                                                            <span className="font-medium text-xs truncate max-w-[120px] sm:max-w-[200px]">
                                                                {entry.displayName}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-2.5">
                                                        <Badge variant="secondary" className="text-[10px] font-mono">
                                                            {entry.count}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
