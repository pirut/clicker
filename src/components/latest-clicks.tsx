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

export default function LatestClicks() {
    const { data: latestClicksData, isLoading: latestClicksLoading } = db.useQuery({
        clicks: {
            $: {
                order: { serverCreatedAt: "desc" },
                limit: 10,
            },
        },
        displayNames: {},
    });

    const { data: allClicksData, isLoading: allClicksLoading } = db.useQuery({
        clicks: {},
    });

    if (latestClicksLoading || allClicksLoading) return (
        <div className="w-full max-w-md mx-auto h-[400px] glass rounded-xl animate-pulse" />
    );

    const totalClicks = allClicksData?.clicks?.length || 0;
    const displayNames = latestClicksData?.displayNames || [];

    // Create a map of userId to displayName
    const displayNameMap: Record<string, string> = {};
    displayNames.forEach((entry: { userId: string; displayName: string }) => {
        displayNameMap[entry.userId] = entry.displayName;
    });

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
