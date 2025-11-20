"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Background() {
    const [mounted, setMounted] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const gridColor = "color-mix(in oklch, var(--border) 65%, transparent)";

    useEffect(() => {
        setMounted(true);
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    if (!mounted) return null;

    // Simplified animation props for better performance
    const orbAnimation = prefersReducedMotion ? {} : {
        scale: [1, 1.15, 1],
        opacity: [0.2, 0.35, 0.2],
    };

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Gradient Orbs - Reduced number and optimized */}
            {!prefersReducedMotion && (
                <>
                    <motion.div
                        animate={orbAnimation}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[80px] will-change-transform"
                        style={{ transform: "translate(0, 0)" }}
                    />
                    <motion.div
                        animate={orbAnimation}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 3,
                        }}
                        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] will-change-transform"
                        style={{ transform: "translate(0, 0)" }}
                    />
                </>
            )}

            {/* Grid Pattern Overlay - Optimized with CSS */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                        linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
                    `,
                    backgroundSize: "48px 48px",
                    mixBlendMode: "multiply",
                    willChange: "auto",
                }}
            />
        </div>
    );
}
