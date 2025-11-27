"use client";

import { db } from "@/lib/instantdb";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GiveClickButton from "@/components/give-click-button";
import { UserAvatar } from "@/components/user-avatar";

// Types based on schema
export type Click = {
    id: string;
    createdAt: number;
    userId: string;
};
export type DisplayName = {
    id: string;
    displayName: string;
    userId: string;
    cursorColor?: string;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    profileImageUrl?: string;
};

export default function LeaderboardPage() {
    // Fetch clicks with reasonable limit and display names
    // Note: For accurate leaderboard, we need all clicks, but limit to prevent performance issues
    const { data, isLoading, error } = db.useQuery({ 
        clicks: { 
            $: { 
                limit: 100000, // Reasonable upper bound for leaderboard calculation
                order: { serverCreatedAt: "desc" }
            } 
        }, 
        displayNames: {} 
    });

    // Map userId to full displayName record with avatar info
    const displayNameMap: Record<string, DisplayName> = useMemo(() => {
        const map: Record<string, DisplayName> = {};
        (data?.displayNames ?? []).forEach((entry: DisplayName) => {
            map[entry.userId] = entry;
        });
        return map;
    }, [data?.displayNames]);

    // Count clicks per user
    const leaderboard = useMemo(() => {
        const counts: Record<string, number> = {};
        (data?.clicks ?? []).forEach((c: Click) => {
            counts[c.userId] = (counts[c.userId] || 0) + 1;
        });
        // Convert to array and sort
        return Object.entries(counts)
            .map(([userId, count]) => {
                const profile = displayNameMap[userId];
                return {
                    userId,
                    displayName: profile?.displayName || "Anonymous",
                    cursorColor: profile?.cursorColor,
                    hatSlug: profile?.hatSlug,
                    accessorySlug: profile?.accessorySlug,
                    effectSlug: profile?.effectSlug,
                    profileImageUrl: profile?.profileImageUrl,
                    count,
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);
    }, [data?.clicks, displayNameMap]);

    const getPlaceIcon = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-6 pt-20 sm:pt-24">
                <div className="w-full max-w-2xl mx-auto space-y-4">
                    <Card>
                        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg">About the Leaderboard</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                This leaderboard celebrates the top 100 people who have clicked the button. The more you click, the higher you
                                climb!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 px-3 sm:px-4">
                            <div className="grid gap-1.5 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>Each click counts as one point</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>Display names are shown if you set one</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>The top 3 are honored with special medals 🥇🥈🥉</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>Want to see your name here? Give a click!</span>
                                </div>
                            </div>
                            <br />
                            <div className="flex justify-center pt-2">
                                <GiveClickButton />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                            <CardTitle className="text-xl sm:text-2xl font-bold">🏆 Leaderboard</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Top 100 Most Prolific Clickers</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-4">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="text-base sm:text-lg font-medium">Loading leaderboard...</div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-destructive text-sm sm:text-base">Error: {error.message}</div>
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-muted-foreground text-sm sm:text-base">No clicks yet.</div>
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-x-auto">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead className="w-12 sm:w-16 text-center text-xs sm:text-sm">Rank</TableHead>
                                                                                <TableHead className="text-xs sm:text-sm pl-2">Player</TableHead>
                                                                                <TableHead className="text-center w-16 sm:w-24 text-xs sm:text-sm">Clicks</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {leaderboard.map((entry, idx) => {
                                                                                const placeIcon = getPlaceIcon(idx);
                                                                                return (
                                                                                    <TableRow key={entry.userId} className={idx === 0 ? "bg-muted/50" : ""}>
                                                                                        <TableCell className="text-center font-medium text-xs sm:text-sm py-2 sm:py-4">
                                                                                            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                                                                                                {placeIcon && <span className="text-sm sm:text-base">{placeIcon}</span>}
                                                                                                <span>{idx + 1}</span>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell className="py-2 sm:py-4">
                                                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                                                <UserAvatar
                                                                                                    size="xs"
                                                                                                    cursorColor={entry.cursorColor}
                                                                                                    fallbackSeed={entry.displayName}
                                                                                                    profileImageUrl={entry.profileImageUrl}
                                                                                                    hatSlug={entry.hatSlug}
                                                                                                    accessorySlug={entry.accessorySlug}
                                                                                                    effectSlug={entry.effectSlug}
                                                                                                    showClicksBadge={false}
                                                                                                    showParticles={idx < 3} // Only show particles for top 3
                                                                                                />
                                                                                                <span className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[180px]">
                                                                                                    {entry.displayName}
                                                                                                </span>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell className="text-center py-2 sm:py-4">
                                                                                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
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
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
