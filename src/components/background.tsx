"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function Background() {
    const [mounted, setMounted] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const spotlightX = useMotionValue(-180);
    const spotlightY = useMotionValue(-180);
    const spotlightXSpring = useSpring(spotlightX, { stiffness: 80, damping: 35, mass: 0.7 });
    const spotlightYSpring = useSpring(spotlightY, { stiffness: 80, damping: 35, mass: 0.7 });

    useEffect(() => {
        setMounted(true);
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        if (!mounted || prefersReducedMotion) return;
        const onMove = (e: PointerEvent) => {
            spotlightX.set(e.clientX - 200);
            spotlightY.set(e.clientY - 200);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [mounted, prefersReducedMotion, spotlightX, spotlightY]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Warm lamp spotlight following cursor — like a desk lamp on paper */}
            {!prefersReducedMotion && (
                <motion.div
                    className="absolute h-96 w-96 rounded-full opacity-[0.05]"
                    style={{
                        x: spotlightXSpring,
                        y: spotlightYSpring,
                        background: "radial-gradient(circle, rgba(255,230,180,0.5) 0%, transparent 70%)",
                    }}
                />
            )}
        </div>
    );
}
