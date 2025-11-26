"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/instantdb";
import { id } from "@instantdb/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function GiveClickButton() {
    const { userId: clerkUserId } = useAuth();
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const CLICK_COOLDOWN_MS = 250;
    const [lastClickTime, setLastClickTime] = useState(0);

    // Check InstantDB auth state - this is what permissions use
    const { user: instantUser, isLoading: authLoading } = db.useAuth();

    // Query for existing displayName to get its ID (use Clerk userId for data consistency)
    const { data: displayNameData } = db.useQuery(
        clerkUserId ? { displayNames: { $: { where: { userId: clerkUserId } } } } : null
    );

    const handleClick = async () => {
        if (!clerkUserId) {
            setError("You must be logged in to click.");
            return;
        }

        if (authLoading) {
            setError("Connecting to database...");
            return;
        }

        if (!instantUser) {
            setError("Syncing authentication... please wait.");
            return;
        }

        const now = Date.now();
        if (now - lastClickTime < CLICK_COOLDOWN_MS) {
            setError("Whoa! Give it a beat before the next click.");
            return;
        }
        setLastClickTime(now);

        // Lighter confetti effect for performance
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#8b6f47', '#a0826d', '#c4a574'],
            disableForReducedMotion: true,
        });

        const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";

        // Find existing displayName entity or create new one
        const existingDisplayName = displayNameData?.displayNames?.find((dn: { userId: string }) => dn.userId === clerkUserId);
        const displayNameId = existingDisplayName?.id || id();

        // Create click and update/create displayName in a single transaction
        // Order matters: create/update displayName first, then create click and link
        const clickId = id();
        try {
            await db.transact([
                // First, ensure the displayName exists
                db.tx.displayNames[displayNameId].update({
                    displayName,
                    userId: clerkUserId,
                }),
                // Then create the click and link it to the author
                db.tx.clicks[clickId]
                    .update({
                        userId: clerkUserId,
                        createdAt: now,
                    })
                    .link({ author: displayNameId }),
            ]);
            setError(null);
        } catch (err) {
            console.error("Failed to create click:", err);
            setError("Failed to register click. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button 
                    size="lg" 
                    onClick={handleClick}
                    className="relative h-32 w-32 rounded-full text-xl font-bold text-primary-foreground bg-gradient-to-br from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-[0_25px_45px_-20px_rgba(62,42,20,0.55)] border-4 border-white/30"
                >
                    <span className="z-10">CLICK</span>
                    <div className="absolute inset-0 rounded-full bg-white/15 blur-md" />
                </Button>
            </motion.div>
            
            {error && (
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm font-medium bg-red-950/30 px-4 py-2 rounded-full border border-red-500/20"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
