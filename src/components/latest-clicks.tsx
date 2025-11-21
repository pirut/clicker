"use client";
import { db } from "@/lib/instantdb";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function LatestClicks() {
    // Only fetch latest 10 clicks and all displayNames (not all clicks)
    const { data: latestClicksData, isLoading: latestClicksLoading } = db.useQuery({
        clicks: {
            $: {
                order: { createdAt: "desc" },
                limit: 10,
            },
        },
        displayNames: {},
    });

    // Fetch total count separately - more efficient with limit
    const { data: totalClicksData, isLoading: totalClicksLoading } = db.useQuery({
        clicks: {
            $: {
                // Use a reasonable limit for counting (InstantDB doesn't have native count)
                limit: 50000, // Reasonable upper bound for counting
                order: { createdAt: "desc" },
            },
        },
    });

    // Calculate total from the limited query (or use a more efficient method if InstantDB supports count)
    const totalClicks = totalClicksData?.clicks?.length || 0;
    
    // Memoize the displayName map for performance - must be before early return
    const displayNameMap: Record<string, string> = useMemo(() => {
        const map: Record<string, string> = {};
        const displayNames = latestClicksData?.displayNames || [];
        displayNames.forEach((entry: { userId: string; displayName: string }) => {
            map[entry.userId] = entry.displayName;
        });
        return map;
    }, [latestClicksData?.displayNames]);

    if (latestClicksLoading || totalClicksLoading) return (
        <div className="w-full max-w-md mx-auto h-[400px] glass rounded-xl animate-pulse" />
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
        >
            <Card className="glass border-0 overflow-hidden">
                <CardHeader className="text-center border-b border-white/5 pb-6 bg-white/5">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        {totalClicks.toLocaleString()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Total Clicks</p>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {latestClicksData?.clicks?.map((click, index) => (
                                <motion.tr
                                    key={click.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                >
                                    <TableCell className="font-medium py-3 pl-6 text-foreground/80 group-hover:text-primary transition-colors">
                                        {displayNameMap[click.userId] || "Anonymous"}
                                    </TableCell>
                                    <TableCell className="text-right py-3 pr-6 text-muted-foreground text-xs font-mono">
                                        {new Date(click.createdAt).toLocaleTimeString()}
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
