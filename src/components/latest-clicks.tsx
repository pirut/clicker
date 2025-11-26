"use client";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function LatestClicks() {
    // Fetch latest 10 clicks with their authors using the relation
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

    if (!latestClicksData && latestClicksLoading) {
        return <div className="w-full max-w-md mx-auto h-[400px] glass rounded-xl animate-pulse" />;
    }

    const clicks = latestClicksData?.clicks || [];

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="glass border-0 overflow-hidden">
                <CardHeader className="text-center border-b border-white/5 pb-6 bg-white/5">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Latest Clicks</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {clicks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                        No clicks yet. Be the first!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clicks.map((click) => (
                                    <TableRow
                                        key={click.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group animate-in fade-in slide-in-from-left-2 duration-200"
                                    >
                                        <TableCell className="font-medium py-3 pl-6 text-foreground/80 group-hover:text-primary transition-colors">
                                            {click.author?.displayName || "Clicker"}
                                        </TableCell>
                                        <TableCell className="text-right py-3 pr-6 text-muted-foreground text-xs font-mono">
                                            {new Date(click.createdAt).toLocaleTimeString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
