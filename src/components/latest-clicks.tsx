"use client";
import { db } from "@/lib/instantdb";

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
        <div className="text-center text-sm text-muted-foreground mb-2">
            <p>Total Clicks: {totalClicks}</p>
            <ul>
                {latestClicksData?.clicks?.map((click) => (
                    <li key={click.id}>
                        {displayNameMap[click.userId] || "Anonymous"} at {new Date(click.createdAt).toLocaleTimeString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}
