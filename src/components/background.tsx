"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Background() {
    const [mounted, setMounted] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const gridColor = "color-mix(in oklch, var(--border) 55%, transparent)";

    useEffect(() => {
        setMounted(true);
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    if (!mounted) return null;

    const orbAnimation = prefersReducedMotion
        ? {}
        : {
        scale: [1, 1.15, 1],
        opacity: [0.2, 0.35, 0.2],
    };

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {!prefersReducedMotion && (
                <>
                    <motion.div
                        animate={orbAnimation}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -top-32 -left-20 h-[460px] w-[460px] rounded-full bg-primary/18 blur-[110px] will-change-transform"
                        style={{ transform: "translate(0, 0)" }}
                    />
                    <motion.div
                        animate={orbAnimation}
                        transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 3,
                        }}
                        className="absolute -bottom-24 right-[-4rem] h-[520px] w-[520px] rounded-full bg-accent/14 blur-[120px] will-change-transform"
                        style={{ transform: "translate(0, 0)" }}
                    />
                    <motion.div
                        animate={{
                            opacity: [0.25, 0.45, 0.25],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute left-1/2 top-[22%] h-[220px] w-[58vw] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/18 via-accent/12 to-primary/18 blur-[95px]"
                    />
                </>
            )}

            <div
                className="surface-grid absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                        linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
                    `,
                    backgroundSize: "42px 42px",
                    mixBlendMode: "multiply",
                }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,color-mix(in_oklch,var(--foreground)_8%,transparent)_0%,transparent_45%)] opacity-65" />
        </div>
    );
}
