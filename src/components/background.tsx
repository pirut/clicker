"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function Background() {
    const [mounted, setMounted] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const spotlightX = useMotionValue(-180);
    const spotlightY = useMotionValue(-180);
    const spotlightXSpring = useSpring(spotlightX, { stiffness: 100, damping: 30, mass: 0.6 });
    const spotlightYSpring = useSpring(spotlightY, { stiffness: 100, damping: 30, mass: 0.6 });

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
            spotlightX.set(e.clientX - 160);
            spotlightY.set(e.clientY - 160);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [mounted, prefersReducedMotion, spotlightX, spotlightY]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {!prefersReducedMotion && (
                <motion.div
                    style={{ x: spotlightXSpring, y: spotlightYSpring }}
                    className="absolute h-72 w-72 rounded-full opacity-[0.07] bg-foreground blur-[80px]"
                />
            )}
        </div>
    );
}
