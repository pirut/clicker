"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import { db } from "@/lib/instantdb";

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { data } = db.useQuery({
        clicks: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    if (!isLoaded || !isSignedIn || !user) {
        return <div>Loading...</div>;
    }

    const clicks = data?.clicks ?? [];
    const totalClicks = clicks.length;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <Card className="w-full mb-6">
                        <CardHeader>
                            <CardTitle>Welcome to Your Dashboard</CardTitle>
                            <CardDescription>Hello, {user.firstName || user.emailAddresses[0]?.emailAddress}!</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CardDescription>
                                <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
                            </CardDescription>
                            <CardDescription>
                                <strong>Name:</strong> {user.firstName} {user.lastName}
                            </CardDescription>
                            <CardDescription>
                                <strong>Total Clicks:</strong> {totalClicks}
                            </CardDescription>
                            <CardDescription>
                                <strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

