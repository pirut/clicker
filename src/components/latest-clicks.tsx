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
    TableRow,
} from "@/components/ui/table";

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

    if (latestClicksLoading || allClicksLoading) return <div>...</div>;

    const totalClicks = allClicksData?.clicks?.length || 0;
    const displayNames = latestClicksData?.displayNames || [];

    // Create a map of userId to displayName
    const displayNameMap: Record<string, string> = {};
    displayNames.forEach((entry: { userId: string; displayName: string }) => {
        displayNameMap[entry.userId] = entry.displayName;
    });

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Total Clicks: {totalClicks}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {latestClicksData?.clicks?.map((click) => (
                            <TableRow key={click.id}>
                                <TableCell className="font-medium">
                                    {displayNameMap[click.userId] || "Anonymous"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Date(click.createdAt).toLocaleTimeString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
