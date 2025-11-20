"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/instantdb";
import { id } from "@instantdb/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function GiveClickButton() {
    const { userId } = useAuth();
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [lastClickTime, setLastClickTime] = useState(0);

    const handleClick = async () => {
        if (!userId) {
            setError("You must be logged in to click.");
            return;
        }

        if (Date.now() - lastClickTime < 1000) {
            setError("You can only click once per second.");
            return;
        }

        // Lighter confetti effect for performance
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#8b6f47', '#a0826d', '#c4a574'],
            disableForReducedMotion: true,
        });

        const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";

        // Create click and update displayName in a single transaction
        db.transact([
            db.tx.clicks[id()].update({
                userId,
                createdAt: Date.now(),
            }),
            db.tx.displayNames[userId].update({
                displayName,
                userId,
            }),
        ]);
        
        setLastClickTime(Date.now());
        setError(null);
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
                    className="relative h-32 w-32 rounded-full text-xl font-bold bg-gradient-to-br from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] border-4 border-white/10"
                >
                    <span className="z-10">CLICK</span>
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
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
