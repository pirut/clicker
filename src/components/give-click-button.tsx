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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const CLICK_COOLDOWN_MS = 250;
    const lastClickTimeRef = useRef(0);
    const controls = useAnimation();

    const { user: instantUser, isLoading: authLoading } = db.useAuth();

    const { data: displayNameData } = db.useQuery(
        clerkUserId ? { displayNames: { $: { where: { userId: clerkUserId } } } } : null
    );

    const existingDisplayName = displayNameData?.displayNames?.[0];

    const handleClick = useCallback(async () => {
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

        if (isSubmitting) {
            return;
        }

        const now = Date.now();
        if (now - lastClickTimeRef.current < CLICK_COOLDOWN_MS) {
            setError("Whoa! Give it a beat before the next click.");
            return;
        }
        lastClickTimeRef.current = now;

        controls.start({
            scale: [1, 1.08, 0.98, 1],
            rotate: [0, -2, 1, 0],
            transition: { duration: 0.32, ease: "easeOut" },
        });

        setError(null);
        setIsSubmitting(true);

        const clickId = id();

        try {
            if (existingDisplayName?.id) {
                await db.transact(
                    db.tx.clicks[clickId]
                        .update({
                            userId: clerkUserId,
                            createdAt: now,
                        })
                        .link({ author: existingDisplayName.id })
                );
            } else {
                const fallbackName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
                const displayNameId = id();
                await db.transact([
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
                ]);
            }
        } catch (err) {
            console.error("Failed to create click:", err);
            setError("Failed to register click. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [clerkUserId, authLoading, instantUser, user, existingDisplayName, controls, isSubmitting]);

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-5">
            <motion.div className="relative isolate" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-primary/35 via-accent/25 to-primary/25 blur-3xl" />
                <div className="absolute inset-0 rounded-full border border-primary/30 opacity-80 animate-ping" style={{ animationDuration: "2.3s" }} />

                <motion.button
                    onClick={handleClick}
                    disabled={isSubmitting}
                    animate={controls}
                    aria-label="Give one click"
                    className="group relative h-30 w-30 overflow-hidden rounded-full border border-primary/45 sm:h-36 sm:w-36 md:h-40 md:w-40
                        bg-[radial-gradient(circle_at_30%_25%,rgba(255,250,240,0.5)_0%,transparent_45%),radial-gradient(circle_at_70%_75%,rgba(72,50,29,0.38)_0%,transparent_50%),linear-gradient(140deg,color-mix(in_oklch,var(--primary)_72%,black)_0%,color-mix(in_oklch,var(--primary)_58%,var(--accent))_56%,color-mix(in_oklch,var(--accent)_64%,black)_100%)]
                        shadow-[0_18px_46px_-18px_color-mix(in_oklch,var(--primary)_70%,transparent),inset_0_2px_8px_rgba(255,245,230,0.35),inset_0_-8px_16px_rgba(58,40,22,0.5)]
                        transition-all duration-300 hover:shadow-[0_24px_62px_-18px_color-mix(in_oklch,var(--primary)_78%,transparent),inset_0_2px_8px_rgba(255,245,230,0.4),inset_0_-10px_16px_rgba(58,40,22,0.56)]
                        active:shadow-[0_10px_28px_-14px_color-mix(in_oklch,var(--primary)_68%,transparent),inset_0_5px_10px_rgba(58,40,22,0.56)] disabled:cursor-not-allowed disabled:opacity-75"
                >
                    <span className="pointer-events-none absolute inset-[6px] rounded-full border border-white/35" />
                    <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[130%] group-hover:translate-x-[130%] transition-transform duration-700" />

                    <span className="relative z-10 flex h-full flex-col items-center justify-center gap-1 text-primary-foreground drop-shadow-[0_2px_8px_rgba(45,30,16,0.58)]">
                        <svg className="mb-0.5 h-8 w-8 opacity-95 sm:h-9 sm:w-9 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                        </svg>
                        <span className="text-base font-semibold tracking-[0.08em] sm:text-lg md:text-xl">CLICK</span>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-primary-foreground/80 sm:text-xs">+1 point</span>
                    </span>
                </motion.button>
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-[300px] rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive sm:text-sm"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
