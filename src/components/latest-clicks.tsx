"use client";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { motion } from "framer-motion";

export default function LatestClicks() {
    // Fetch latest 10 clicks with their authors using the new relation
    const { data: latestClicksData, isLoading: latestClicksLoading } = db.useQuery({
        clicks: {
            $: {
                order: { createdAt: "desc" },
                limit: 10,
            },
            author: {},
        },
    });

    // We'll assume the total count is something we can get cheaply later or just hide it if it's slow.
    // For now, removing the heavy query to fix the delay.
    // If we really need a count, we should maintain a separate counter entity or use a dedicated count query if available.
    // const totalClicks = 0; // Placeholder or remove the counter from UI if preferred.
    // Actually, let's keep the component structure but maybe just not show the total if it's expensive,
    // or query a much smaller limit just to see "some" activity if we want.
    // But the user complained about the *list* delay. The heavy query was likely blocking the whole component update.

    if (!latestClicksData && latestClicksLoading) return <div className="w-full max-w-md mx-auto h-[400px] glass rounded-xl animate-pulse" />;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md mx-auto">
            <Card className="glass border-0 overflow-hidden">
                <CardHeader className="text-center border-b border-white/5 pb-6 bg-white/5">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Latest Clicks</CardTitle>
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
                                        {click.author?.displayName || "Anonymous"}
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
