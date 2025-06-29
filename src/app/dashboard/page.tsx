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
import { HelpCircle } from "lucide-react";

// DollarIcon component for proportional SVG rendering
function DollarIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
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

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { data } = db.useQuery({
        displayNames: {},
        dollars: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    const [newDisplayName, setNewDisplayName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    if (!isLoaded || !isSignedIn || !user) {
        return <div>Loading...</div>;
    }

    const displayNames = data?.displayNames ?? [];
    const dollars = data?.dollars ?? [];
    const displayName = displayNames.find((d) => d.userId === user.id)?.displayName || user.firstName || user.emailAddresses[0]?.emailAddress;
    const totalDollars = dollars.length;
    const unusedDollars = dollars.filter((d) => !d.used).length;

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
                                <Button variant="ghost" size="icon" aria-label="How to change your name" onClick={() => setIsHelpOpen(true)}>
                                    <HelpCircle className="w-4 h-4" />
                                </Button>
                                <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>How to Change Your Display Name</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-2 text-sm">
                                            <p>
                                                To change your display name, you must have at least one available dollar. Each time you change your display
                                                name, one dollar will be used.
                                            </p>
                                            <ul className="list-disc pl-5 mt-2">
                                                <li>
                                                    Click the <strong>Change Display Name</strong> button.
                                                </li>
                                                <li>Enter your new display name and save.</li>
                                                <li>
                                                    If you do not have any available dollars, you will need to give another dollar before you can change your
                                                    name again.
                                                </li>
                                            </ul>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={() => setIsHelpOpen(false)} type="button">
                                                Close
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={unusedDollars === 0}>
                                            Change Display Name
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleSubmit}>
                                            <DialogHeader>
                                                <DialogTitle>Change Display Name</DialogTitle>
                                                <DialogDescription>
                                                    Enter your new display name below. This will use one of your available dollars. You have {unusedDollars}{" "}
                                                    dollar{unusedDollars !== 1 ? "s" : ""} available.
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
                                <strong>Total Dollars Given:</strong> <DollarIcon size={14} className="inline mr-1" />
                                {totalDollars}
                            </CardDescription>
                            <CardDescription>
                                <strong>Available Dollars:</strong> <DollarIcon size={14} className="inline mr-1" />
                                {unusedDollars}
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
