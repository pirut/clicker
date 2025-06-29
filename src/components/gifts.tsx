"use client";

import { db } from "@/lib/instantdb";
import GiveDollarButton from "@/components/give-dollar-button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

// DollarIcon component for proportional SVG rendering
function DollarIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
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

export default function Dollars() {
    const { data, isLoading, error } = db.useQuery({ dollars: {}, displayNames: {} });

    if (isLoading) return <div>Loading dollars...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    const dollars = data?.dollars ?? [];
    const displayNames = data?.displayNames ?? [];

    // Sort dollars by createdAt in descending order (latest first) and limit to 100
    const sortedDollars = dollars.sort((a, b) => b.createdAt - a.createdAt).slice(0, 100);

    const total = dollars.length;

    // Map userId to displayName
    const displayNameMap: Record<string, string> = {};
    for (const entry of displayNames) {
        displayNameMap[entry.userId] = entry.displayName;
    }

    return (
        <Card className="mb-8 w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2 sm:px-4 md:px-8">
            <CardHeader className="flex flex-col items-center gap-4 mb-4">
                <CardTitle className="text-xl font-bold text-center">
                    Total Dollars Given: <br /> {total}
                </CardTitle>
                <GiveDollarButton />
            </CardHeader>
            <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                    {sortedDollars.length === 0 && <li className="py-2 text-muted-foreground">No dollars given yet.</li>}
                    {sortedDollars.map((dollar) => (
                        <li key={dollar.id} className="py-2 flex justify-between text-sm gap-10 px-6">
                            <span>
                                <DollarIcon size={16} className="mr-1" />1 from {displayNameMap[dollar.userId] || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(dollar.createdAt).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
                {dollars.length > 100 && (
                    <CardDescription className="text-center text-sm text-muted-foreground mt-2">Showing latest 100 of {total} dollars</CardDescription>
                )}
            </CardContent>
        </Card>
    );
}
