"use client";

import { db } from "@/lib/instantdb";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GiveDollarButton from "@/components/give-dollar-button";

// Types based on schema
export type Dollar = {
    id: string;
    createdAt: number;
    userId: string;
    used?: boolean;
    usedFor?: string;
};
export type DisplayName = {
    id: string;
    displayName: string;
    userId: string;
};

// DollarIcon component for proportional SVG rendering
function DollarIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 500"
            width={size}
            height={size}
            className={className}
            style={{ display: "inline", verticalAlign: "middle" }}
        >
            <path
                d="m 145,312 c -2,69 31,100 104,102 78,1 113,-34 109,-101 -6,-58 -62,-73 -106,-79 -48,-17 -99,-25 -99,-95 0,-48 32,-79 99,-78 60,0 97,25 96,84"
                style={{ fill: "none", stroke: "#000", strokeWidth: 40 }}
            />
            <path d="m 250,15 0,470" style={{ stroke: "#000", strokeWidth: 30 }} />
        </svg>
    );
}

export default function LeaderboardPage() {
    // Fetch all dollars and display names
    const { data, isLoading, error } = db.useQuery({ dollars: {}, displayNames: {} });

    // Map userId to displayName
    const displayNameMap: Record<string, string> = useMemo(() => {
        const map: Record<string, string> = {};
        (data?.displayNames ?? []).forEach((entry: DisplayName) => {
            map[entry.userId] = entry.displayName;
        });
        return map;
    }, [data?.displayNames]);

    // Count dollars per user
    const leaderboard = useMemo(() => {
        const counts: Record<string, number> = {};
        (data?.dollars ?? []).forEach((d: Dollar) => {
            counts[d.userId] = (counts[d.userId] || 0) + 1;
        });
        // Convert to array and sort
        return Object.entries(counts)
            .map(([userId, count]) => ({
                userId,
                displayName: displayNameMap[userId] || "Anonymous",
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);
    }, [data?.dollars, displayNameMap]);

    const getPlaceIcon = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl mx-auto space-y-4">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">About the Leaderboard</CardTitle>
                            <CardDescription>
                                This leaderboard celebrates the top 100 people who have given a dollar on this site. The more dollars you give, the higher you
                                climb!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4">
                            <div className="grid gap-1.5 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span>Each $1 given counts as one point</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span>Display names are shown if you set one</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span>The top 3 are honored with special medals 🥇🥈🥉</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    <span>Want to see your name here? Give a dollar!</span>
                                </div>
                            </div>
                            <br />
                            <div className="flex justify-center pt-2">
                                <GiveDollarButton />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl font-bold">🏆 Leaderboard</CardTitle>
                            <CardDescription>Top 100 Most Generous Givers</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="text-lg font-medium">Loading leaderboard...</div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-destructive">Error: {error.message}</div>
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-muted-foreground">No donations yet.</div>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16 text-center">Rank</TableHead>
                                                <TableHead className="text-center">Name</TableHead>
                                                <TableHead className="text-center w-24">Dollars</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {leaderboard.map((entry, idx) => {
                                                const placeIcon = getPlaceIcon(idx);
                                                return (
                                                    <TableRow key={entry.userId} className={idx === 0 ? "bg-muted/50" : ""}>
                                                        <TableCell className="text-center font-medium">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {placeIcon && <span>{placeIcon}</span>}
                                                                <span>{idx + 1}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-center">{entry.displayName}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="text-xs">
                                                                <DollarIcon size={12} className="inline mr-1" />
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
