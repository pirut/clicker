"use client";

import { db } from "@/lib/instantdb";
import { id } from "@instantdb/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useCallback, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export default function GiveClickButton() {
    const { userId: clerkUserId } = useAuth();
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const CLICK_COOLDOWN_MS = 250;
    const lastClickTimeRef = useRef(0);
    const controls = useAnimation();

    // Check InstantDB auth state - this is what permissions use
    const { user: instantUser, isLoading: authLoading } = db.useAuth();

    // Query for existing displayName to get its ID (use Clerk userId for data consistency)
    const { data: displayNameData } = db.useQuery(
        clerkUserId ? { displayNames: { $: { where: { userId: clerkUserId } } } } : null
    );

    // Find existing displayName entity (created by PresenceManager)
    const existingDisplayName = displayNameData?.displayNames?.[0];

    const handleClick = useCallback(() => {
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
        if (now - lastClickTimeRef.current < CLICK_COOLDOWN_MS) {
            setError("Whoa! Give it a beat before the next click.");
            return;
        }
        lastClickTimeRef.current = now;

        // Trigger ripple animation
        controls.start({
            scale: [1, 1.15, 1],
            transition: { duration: 0.3, ease: "easeOut" }
        });

        // Clear any previous error
        setError(null);

        const clickId = id();

        // If displayName record exists, just create the click and link it
        // If not, create the displayName record with fallback name
        if (existingDisplayName?.id) {
            // Record exists - just create click and link, preserve existing displayName
            db.transact(
                db.tx.clicks[clickId]
                    .update({
                        userId: clerkUserId,
                        createdAt: now,
                    })
                    .link({ author: existingDisplayName.id })
            ).catch((err) => {
                console.error("Failed to create click:", err);
                setError("Failed to register click. Please try again.");
            });
        } else {
            // No record yet - create displayName with fallback, then click
            const fallbackName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
            const displayNameId = id();
            db.transact([
                db.tx.displayNames[displayNameId].update({
                    displayName: fallbackName,
                    userId: clerkUserId,
                    profileImageUrl: user?.imageUrl || "",
                }),
                db.tx.clicks[clickId]
                    .update({
                        userId: clerkUserId,
                        createdAt: now,
                    })
                    .link({ author: displayNameId }),
            ]).catch((err) => {
                console.error("Failed to create click:", err);
                setError("Failed to register click. Please try again.");
            });
        }
    }, [clerkUserId, authLoading, instantUser, user, existingDisplayName, controls]);

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-6">
            <motion.div
                className="relative"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                {/* Outer glow rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl scale-125" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl scale-150 animate-pulse" />
                
                {/* Main button */}
                <motion.button
                    onClick={handleClick}
                    animate={controls}
                    className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-full font-bold text-lg sm:text-xl tracking-wide cursor-pointer
                        bg-gradient-to-br from-[#c9a66b] via-[#a8855a] to-[#7d6245]
                        shadow-[0_8px_32px_rgba(139,111,71,0.4),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.2)]
                        border-2 border-[#d4b896]/50
                        hover:shadow-[0_12px_40px_rgba(139,111,71,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.25)]
                        active:shadow-[0_4px_16px_rgba(139,111,71,0.3),inset_0_4px_8px_rgba(0,0,0,0.3)]
                        transition-shadow duration-200
                        overflow-hidden group"
                >
                    {/* Inner highlight */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>
                    
                    {/* Text */}
                    <span className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex flex-col items-center gap-0.5">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-0.5 sm:mb-1 opacity-90" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                        </svg>
                        <span className="text-base sm:text-lg font-semibold">CLICK</span>
                    </span>
                    
                    {/* Bottom shadow inside button */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </motion.button>
                
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs sm:text-sm font-medium bg-red-950/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-red-500/20 text-center max-w-[280px] sm:max-w-none"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
