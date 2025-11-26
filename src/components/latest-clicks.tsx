"use client";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { motion } from "framer-motion";

export default function LatestClicks() {
    // Fetch latest 10 clicks with their authors using the new relation
    // This query automatically updates in real-time when new clicks are added
    const { data: latestClicksData, isLoading: latestClicksLoading } = db.useQuery({
        clicks: {
            $: {
                order: { createdAt: "desc" },
                limit: 10,
            },
            author: {},
        },
    });

    if (!latestClicksData && latestClicksLoading) return <div className="w-full max-w-md mx-auto h-[400px] glass rounded-xl animate-pulse" />;

    const clicks = latestClicksData?.clicks || [];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md mx-auto">
            <Card className="glass border-0 overflow-hidden">
                <CardHeader className="text-center border-b border-white/5 pb-6 bg-white/5">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Latest Clicks</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {clicks.length === 0 ? (
                                <tr>
                                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                        No clicks yet. Be the first!
                                    </TableCell>
                                </tr>
                            ) : (
                                clicks.map((click, index) => (
                                    <motion.tr
                                        key={click.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(index * 0.05, 0.5) }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <TableCell className="font-medium py-3 pl-6 text-foreground/80 group-hover:text-primary transition-colors">
                                            {click.author?.displayName || "Anonymous"}
                                        </TableCell>
                                        <TableCell className="text-right py-3 pr-6 text-muted-foreground text-xs font-mono">
                                            {new Date(click.createdAt).toLocaleTimeString()}
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
