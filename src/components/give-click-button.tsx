"use client";

import { db } from "@/lib/instantdb";
import { id } from "@instantdb/react";
import { useAuth, useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { MouseEvent, useCallback, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useAnimation,
    useMotionTemplate,
    useMotionValue,
    useSpring,
} from "framer-motion";

type ClickBurst = {
    id: string;
    x: number;
    y: number;
};

export default function GiveClickButton() {
    const { userId: clerkUserId } = useAuth();
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bursts, setBursts] = useState<ClickBurst[]>([]);
    const CLICK_COOLDOWN_MS = 250;
    const lastClickTimeRef = useRef(0);
    const controls = useAnimation();
    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);
    const glowX = useMotionValue(50);
    const glowY = useMotionValue(50);
    const springTiltX = useSpring(tiltX, { stiffness: 220, damping: 20, mass: 0.45 });
    const springTiltY = useSpring(tiltY, { stiffness: 220, damping: 20, mass: 0.45 });
    const springGlowX = useSpring(glowX, { stiffness: 260, damping: 28, mass: 0.35 });
    const springGlowY = useSpring(glowY, { stiffness: 260, damping: 28, mass: 0.35 });
    const pointerGlow = useMotionTemplate`radial-gradient(circle at ${springGlowX}% ${springGlowY}%, rgba(255,240,220,0.35), transparent 45%)`;

    const { user: instantUser, isLoading: authLoading } = db.useAuth();

    const { data: displayNameData } = db.useQuery(
        clerkUserId ? { displayNames: { $: { where: { userId: clerkUserId } } } } : null
    );

    const existingDisplayName = displayNameData?.displayNames?.[0];

    const handlePointerMove = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const relativeX = (event.clientX - rect.left) / rect.width;
        const relativeY = (event.clientY - rect.top) / rect.height;
        tiltY.set((relativeX - 0.5) * 14);
        tiltX.set((0.5 - relativeY) * 14);
        glowX.set(relativeX * 100);
        glowY.set(relativeY * 100);
    }, [glowX, glowY, tiltX, tiltY]);

    const resetPointer = useCallback(() => {
        tiltX.set(0);
        tiltY.set(0);
        glowX.set(50);
        glowY.set(50);
    }, [glowX, glowY, tiltX, tiltY]);

    const handleClick = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
        if (!clerkUserId) {
            setError("Sign in to start clicking.");
            return;
        }
        if (authLoading) {
            setError("Connecting...");
            return;
        }
        if (!instantUser) {
            setError("Syncing... please wait.");
            return;
        }
        if (isSubmitting) return;

        const now = Date.now();
        if (now - lastClickTimeRef.current < CLICK_COOLDOWN_MS) {
            setError("Too fast! Wait a moment.");
            return;
        }
        lastClickTimeRef.current = now;

        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const burstId = `${now}-${Math.random()}`;

        setBursts((cur) => [...cur, { id: burstId, x: clickX, y: clickY }].slice(-6));
        window.setTimeout(() => {
            setBursts((cur) => cur.filter((b) => b.id !== burstId));
        }, 600);

        confetti({
            particleCount: 20,
            spread: 55,
            startVelocity: 22,
            gravity: 1.1,
            scalar: 0.7,
            ticks: 65,
            colors: ["#f4c95d", "#e87c50", "#fff2c7", "#cd7a26", "#d4a574"],
            origin: {
                x: event.clientX / window.innerWidth,
                y: event.clientY / window.innerHeight,
            },
        });

        controls.start({
            scale: [1, 0.93, 1.06, 0.98, 1],
            rotate: [0, -1.5, 1, 0],
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        });

        setError(null);
        setIsSubmitting(true);

        const clickId = id();

        try {
            if (existingDisplayName?.id) {
                await db.transact(
                    db.tx.clicks[clickId]
                        .update({ userId: clerkUserId, createdAt: now })
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
                        .update({ userId: clerkUserId, createdAt: now })
                        .link({ author: displayNameId }),
                ]);
            }
        } catch (err) {
            console.error("Failed to create click:", err);
            setError("Failed to register click. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [clerkUserId, authLoading, instantUser, user, existingDisplayName, controls, isSubmitting]);

    return (
        <div className="flex flex-col items-center gap-4">
            <motion.div className="relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <motion.button
                    onClick={handleClick}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={resetPointer}
                    disabled={isSubmitting}
                    animate={controls}
                    aria-label="Give one click"
                    style={{
                        rotateX: springTiltX,
                        rotateY: springTiltY,
                        transformPerspective: 900,
                    }}
                    className="group relative h-36 w-36 overflow-hidden rounded-full sm:h-40 sm:w-40 md:h-44 md:w-44
                        bg-[radial-gradient(circle_at_38%_32%,oklch(0.55_0.08_50),var(--primary)_65%)]
                        border-2 border-primary/60
                        shadow-[0_6px_24px_-4px_rgba(60,35,15,0.45),inset_0_2px_6px_rgba(255,235,210,0.2),inset_0_-4px_12px_rgba(40,25,10,0.35)]
                        hover:shadow-[0_10px_32px_-4px_rgba(60,35,15,0.55),inset_0_2px_6px_rgba(255,235,210,0.25),inset_0_-4px_12px_rgba(40,25,10,0.4)]
                        active:shadow-[0_3px_12px_-4px_rgba(60,35,15,0.4),inset_0_4px_10px_rgba(40,25,10,0.4)]
                        transition-shadow duration-300
                        disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {/* Inner highlight ring */}
                    <span className="pointer-events-none absolute inset-[5px] rounded-full border border-primary-foreground/20" />

                    {/* Pointer glow */}
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-full opacity-70"
                        style={{ background: pointerGlow }}
                    />

                    {/* Click bursts */}
                    <AnimatePresence>
                        {bursts.map((burst) => (
                            <motion.span
                                key={burst.id}
                                initial={{ opacity: 0.6, scale: 0 }}
                                animate={{ opacity: 0, scale: 5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="pointer-events-none absolute h-4 w-4 rounded-full border border-primary-foreground/50 bg-primary-foreground/20"
                                style={{ left: burst.x - 8, top: burst.y - 8 }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Content */}
                    <span className="relative z-10 flex h-full flex-col items-center justify-center gap-1 text-primary-foreground drop-shadow-[0_1px_3px_rgba(30,18,8,0.5)]">
                        <svg className="h-8 w-8 opacity-90 sm:h-9 sm:w-9" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                        </svg>
                        <span className="text-base font-bold tracking-[0.1em] sm:text-lg">CLICK</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-70 sm:text-xs">+1 point</span>
                    </span>
                </motion.button>
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-destructive/30 bg-card px-4 py-2 text-center text-xs font-medium text-destructive shadow-sm"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
