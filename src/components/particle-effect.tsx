"use client";

import { memo, useMemo } from "react";

export type EffectType = "sparkles" | "glow" | "rainbow" | "fire" | "ice" | "lightning" | "stars";

interface ParticleEffectProps {
    effect: EffectType;
    size?: number;
    intensity?: "low" | "medium" | "high";
    className?: string;
}

// Effect configurations
const EFFECT_CONFIGS: Record<EffectType, {
    particleCount: { low: number; medium: number; high: number };
    colors: string[];
    animation: string;
    particleSize: [number, number]; // min, max as multiplier of size
    spread: number; // how far particles spread from center
    duration: [number, number]; // min, max duration in seconds
}> = {
    fire: {
        particleCount: { low: 6, medium: 10, high: 16 },
        colors: ["#ff6b35", "#ff9f1c", "#ffbe0b", "#ff5400", "#ff0000"],
        animation: "fire-rise",
        particleSize: [0.08, 0.16],
        spread: 1.2,
        duration: [0.8, 1.6],
    },
    ice: {
        particleCount: { low: 5, medium: 8, high: 12 },
        colors: ["#a8dadc", "#457b9d", "#e0fbfc", "#90e0ef", "#caf0f8"],
        animation: "ice-float",
        particleSize: [0.06, 0.12],
        spread: 1.3,
        duration: [1.5, 2.5],
    },
    sparkles: {
        particleCount: { low: 6, medium: 10, high: 14 },
        colors: ["#ffd700", "#fff8dc", "#fffacd", "#ffec8b", "#f0e68c"],
        animation: "sparkle-twinkle",
        particleSize: [0.04, 0.1],
        spread: 1.4,
        duration: [0.6, 1.2],
    },
    lightning: {
        particleCount: { low: 4, medium: 7, high: 10 },
        colors: ["#00d4ff", "#7df9ff", "#ffffff", "#e0ffff", "#40e0d0"],
        animation: "lightning-flash",
        particleSize: [0.05, 0.12],
        spread: 1.5,
        duration: [0.3, 0.8],
    },
    rainbow: {
        particleCount: { low: 8, medium: 12, high: 18 },
        colors: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"],
        animation: "rainbow-cycle",
        particleSize: [0.06, 0.1],
        spread: 1.3,
        duration: [1.2, 2.0],
    },
    glow: {
        particleCount: { low: 3, medium: 5, high: 8 },
        colors: ["#ffffff", "#f0f0ff", "#e8e8ff"],
        animation: "glow-pulse",
        particleSize: [0.15, 0.25],
        spread: 0.8,
        duration: [1.5, 2.5],
    },
    stars: {
        particleCount: { low: 5, medium: 8, high: 12 },
        colors: ["#ffd700", "#fff8dc", "#fffacd", "#ffffff", "#f0e68c"],
        animation: "star-orbit",
        particleSize: [0.06, 0.1],
        spread: 1.6,
        duration: [2.0, 4.0],
    },
};

// Generate deterministic but varied positions for particles
function generateParticles(
    effect: EffectType,
    count: number,
    size: number,
    seed: number = 0
) {
    const config = EFFECT_CONFIGS[effect];
    const particles = [];
    
    for (let i = 0; i < count; i++) {
        // Use deterministic pseudo-random based on index and seed
        const angle = ((i + seed) * 137.5) % 360; // Golden angle distribution
        const distance = (((i * 17 + seed) % 100) / 100) * config.spread;
        const colorIndex = (i + seed) % config.colors.length;
        const sizeMultiplier = config.particleSize[0] + 
            (((i * 31 + seed) % 100) / 100) * (config.particleSize[1] - config.particleSize[0]);
        const duration = config.duration[0] + 
            (((i * 47 + seed) % 100) / 100) * (config.duration[1] - config.duration[0]);
        const delay = (((i * 23 + seed) % 100) / 100) * duration;
        
        // Convert polar to cartesian, centered around the avatar
        const x = Math.cos((angle * Math.PI) / 180) * distance * size * 0.5;
        const y = Math.sin((angle * Math.PI) / 180) * distance * size * 0.5;
        
        particles.push({
            id: i,
            x,
            y,
            color: config.colors[colorIndex],
            size: size * sizeMultiplier,
            duration,
            delay,
            animation: config.animation,
        });
    }
    
    return particles;
}

// Individual particle component
const Particle = memo(function Particle({
    x,
    y,
    color,
    size: particleSize,
    duration,
    delay,
    animation,
    effectType,
}: {
    x: number;
    y: number;
    color: string;
    size: number;
    duration: number;
    delay: number;
    animation: string;
    effectType: EffectType;
}) {
    // Special shapes for certain effects
    const getParticleStyle = () => {
        const baseStyle: React.CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            width: particleSize,
            height: particleSize,
            backgroundColor: color,
            borderRadius: "50%",
            animation: `${animation} ${duration}s ease-in-out ${delay}s infinite`,
            pointerEvents: "none",
            willChange: "transform, opacity",
        };

        switch (effectType) {
            case "fire":
                return {
                    ...baseStyle,
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    filter: `blur(${particleSize * 0.2}px)`,
                    boxShadow: `0 0 ${particleSize * 0.5}px ${color}`,
                };
            case "ice":
                return {
                    ...baseStyle,
                    borderRadius: "2px",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(45deg)`,
                    filter: `blur(${particleSize * 0.1}px)`,
                    boxShadow: `0 0 ${particleSize * 0.3}px ${color}`,
                };
            case "sparkles":
            case "stars":
                return {
                    ...baseStyle,
                    borderRadius: "1px",
                    boxShadow: `0 0 ${particleSize * 0.8}px ${color}, 0 0 ${particleSize * 1.5}px ${color}40`,
                    clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                };
            case "lightning":
                return {
                    ...baseStyle,
                    borderRadius: "1px",
                    height: particleSize * 2,
                    width: particleSize * 0.3,
                    boxShadow: `0 0 ${particleSize}px ${color}, 0 0 ${particleSize * 2}px ${color}`,
                };
            case "rainbow":
                return {
                    ...baseStyle,
                    filter: `blur(${particleSize * 0.15}px)`,
                    boxShadow: `0 0 ${particleSize * 0.6}px ${color}`,
                };
            case "glow":
                return {
                    ...baseStyle,
                    filter: `blur(${particleSize * 0.4}px)`,
                    boxShadow: `0 0 ${particleSize}px ${color}, 0 0 ${particleSize * 2}px ${color}60`,
                };
            default:
                return baseStyle;
        }
    };

    return <div style={getParticleStyle()} />;
});

// Aura/glow effect that goes behind the avatar
const AuraEffect = memo(function AuraEffect({
    effect,
    size,
}: {
    effect: EffectType;
    size: number;
}) {
    const getAuraStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
        };

        switch (effect) {
            case "fire":
                return {
                    ...baseStyle,
                    width: size * 1.6,
                    height: size * 1.6,
                    background: "radial-gradient(circle, rgba(255,107,53,0.4) 0%, rgba(255,84,0,0.2) 40%, transparent 70%)",
                    animation: "aura-pulse 1.5s ease-in-out infinite",
                };
            case "ice":
                return {
                    ...baseStyle,
                    width: size * 1.5,
                    height: size * 1.5,
                    background: "radial-gradient(circle, rgba(168,218,220,0.35) 0%, rgba(69,123,157,0.2) 40%, transparent 70%)",
                    animation: "aura-pulse 2s ease-in-out infinite",
                };
            case "sparkles":
                return {
                    ...baseStyle,
                    width: size * 1.5,
                    height: size * 1.5,
                    background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,236,139,0.15) 40%, transparent 70%)",
                    animation: "aura-pulse 1.2s ease-in-out infinite",
                };
            case "lightning":
                return {
                    ...baseStyle,
                    width: size * 1.6,
                    height: size * 1.6,
                    background: "radial-gradient(circle, rgba(0,212,255,0.4) 0%, rgba(125,249,255,0.2) 40%, transparent 70%)",
                    animation: "lightning-aura 0.5s ease-in-out infinite",
                };
            case "rainbow":
                return {
                    ...baseStyle,
                    width: size * 1.6,
                    height: size * 1.6,
                    background: "conic-gradient(from 0deg, rgba(255,0,0,0.25), rgba(255,127,0,0.25), rgba(255,255,0,0.25), rgba(0,255,0,0.25), rgba(0,0,255,0.25), rgba(75,0,130,0.25), rgba(148,0,211,0.25), rgba(255,0,0,0.25))",
                    filter: "blur(8px)",
                    animation: "rainbow-rotate 3s linear infinite",
                };
            case "glow":
                return {
                    ...baseStyle,
                    width: size * 1.8,
                    height: size * 1.8,
                    background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(240,240,255,0.25) 40%, transparent 70%)",
                    animation: "glow-pulse 2s ease-in-out infinite",
                };
            case "stars":
                return {
                    ...baseStyle,
                    width: size * 1.5,
                    height: size * 1.5,
                    background: "radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(255,248,220,0.1) 50%, transparent 70%)",
                    animation: "aura-pulse 2.5s ease-in-out infinite",
                };
            default:
                return baseStyle;
        }
    };

    return <div style={getAuraStyle()} />;
});

export const ParticleEffect = memo(function ParticleEffect({
    effect,
    size = 48,
    intensity = "medium",
    className,
}: ParticleEffectProps) {
    const config = EFFECT_CONFIGS[effect];
    const particleCount = config.particleCount[intensity];
    
    const particles = useMemo(
        () => generateParticles(effect, particleCount, size, 42),
        [effect, particleCount, size]
    );

    return (
        <div
            className={className}
            style={{
                position: "absolute",
                inset: 0,
                overflow: "visible",
                pointerEvents: "none",
                zIndex: 1,
            }}
        >
            <AuraEffect effect={effect} size={size} />
            {particles.map((particle) => (
                <Particle
                    key={particle.id}
                    x={particle.x}
                    y={particle.y}
                    color={particle.color}
                    size={particle.size}
                    duration={particle.duration}
                    delay={particle.delay}
                    animation={particle.animation}
                    effectType={effect}
                />
            ))}
        </div>
    );
});

// Lightweight version for cursor rendering (fewer particles, simpler animations)
export const LightParticleEffect = memo(function LightParticleEffect({
    effect,
    size = 48,
}: {
    effect: EffectType;
    size?: number;
}) {
    return <ParticleEffect effect={effect} size={size} intensity="low" />;
});

