"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import { db } from "@/lib/instantdb";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { setDisplayName } from "@/app/actions/user";

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { data } = db.useQuery({
        displayNames: {},
        clicks: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    const [newDisplayName, setNewDisplayName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isLoaded || !isSignedIn || !user) {
        return <div>Loading...</div>;
    }

    const displayNames = data?.displayNames ?? [];
    const clicks = data?.clicks ?? [];
    const displayName = displayNames.find((d) => d.userId === user.id)?.displayName || user.firstName || user.emailAddresses[0]?.emailAddress;
    const totalClicks = clicks.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await setDisplayName(newDisplayName);
            setIsOpen(false);
            setNewDisplayName("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update display name");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <Card className="w-full mb-6">
                        <CardHeader>
                            <CardTitle>Welcome to Your Dashboard</CardTitle>
                            <CardDescription>Hello, {displayName}!</CardDescription>
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
                            <CardDescription className="flex items-center gap-2">
                                <div>
                                    <strong>Display Name:</strong> {displayName}
                                </div>
                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Change Display Name
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleSubmit}>
                                            <DialogHeader>
                                                <DialogTitle>Change Display Name</DialogTitle>
                                                <DialogDescription>
                                                    Enter your new display name below.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label htmlFor="displayName">Display Name</Label>
                                                <Input
                                                    id="displayName"
                                                    value={newDisplayName}
                                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                                    placeholder="Enter new display name"
                                                    className="mt-2"
                                                />
                                                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={isSubmitting || !newDisplayName}>
                                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
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
