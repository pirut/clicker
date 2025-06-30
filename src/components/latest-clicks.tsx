"use client";
import { db } from "@/lib/instantdb";
import { getClicksCount } from "@/app/actions/user";
import { useEffect, useState } from "react";

export default function LatestClicks() {
    const { data, isLoading } = db.useQuery({
        clicks: {
            $: {
                order: { serverCreatedAt: "desc" },
                limit: 10,
            },
        },
        displayNames: {},
    });
    const [totalClicks, setTotalClicks] = useState(0);

    useEffect(() => {
        getClicksCount().then(setTotalClicks);
    }, [data]);

    if (isLoading) return <div>...</div>;

    const displayNames = data?.displayNames || [];

    // Create a map of userId to displayName
    const displayNameMap: Record<string, string> = {};
    displayNames.forEach((entry: { userId: string; displayName: string }) => {
        displayNameMap[entry.userId] = entry.displayName;
    });

    return (
        <div className="text-center text-sm text-muted-foreground mb-2">
            <p>Total Clicks: {totalClicks}</p>
            <ul>
                {data?.clicks?.map((click) => (
                    <li key={click.id}>
                        {displayNameMap[click.userId] || "Anonymous"} at {new Date(click.createdAt).toLocaleTimeString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}
