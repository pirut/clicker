"use client";

import { memo, useMemo } from "react";
import { getStableHslColor } from "@/lib/utils";
import { LightParticleEffect, EffectType } from "./particle-effect";

type CursorAvatarProps = {
    cursorColor?: string;
    fallbackSeed?: string;
    fallbackColor?: string;
    profileImageUrl?: string;
    clicksGiven?: number;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    name?: string;
};

const hatSymbols: Record<string, string> = {
    "fun-hat": "🎩",
    "party-hat": "🥳",
    "crown": "👑",
    "wizard": "🧙",
    "cap": "🧢",
    "cowboy": "🤠",
    "beanie": "🧶",
    "helmet": "⛑️",
    "beret": "🎨",
    "santa": "🎅",
    "top-hat": "🎩",
};

const accessorySymbols: Record<string, string> = {
    "sunglasses": "🕶️",
    "mask": "😷",
    "halo": "😇",
    "wings": "👼",
    "devil": "😈",
    "robot": "🤖",
    "alien": "👽",
};

// Map effect slugs to effect types for particle system
const EFFECT_MAP: Record<string, EffectType> = {
    "sparkles": "sparkles",
    "glow": "glow",
    "glow-effect": "glow",
    "rainbow": "rainbow",
    "rainbow-effect": "rainbow",
    "fire": "fire",
    "fire-effect": "fire",
    "ice": "ice",
    "ice-effect": "ice",
    "lightning": "lightning",
    "lightning-effect": "lightning",
    "stars": "stars",
    "stars-effect": "stars",
};

// Lightweight cursor component optimized for real-time rendering
// Uses native img tags and minimal re-renders
export const CursorAvatar = memo(
    function CursorAvatar({
        cursorColor,
        fallbackSeed = "cursor",
        fallbackColor,
        profileImageUrl,
        clicksGiven = 0,
        hatSlug,
        accessorySlug,
        effectSlug,
        name,
    }: CursorAvatarProps) {
        const color = cursorColor || fallbackColor || getStableHslColor(fallbackSeed);
        const hatEmoji = hatSlug ? hatSymbols[hatSlug] || "🧢" : null;
        const accessoryEmoji = accessorySlug ? accessorySymbols[accessorySlug] || null : null;
        
        // Get effect type for particle system
        const effectType = useMemo(() => {
            return effectSlug ? EFFECT_MAP[effectSlug] : undefined;
        }, [effectSlug]);

        // Tier colors for badges
        let badgeBg = "rgba(255,255,255,0.95)";
        let badgeColor = "#333";
        let badgeBorder = "rgba(0,0,0,0.15)";

        if (clicksGiven >= 100) {
            badgeBg = "linear-gradient(135deg, #ffd700, #ff8c00)";
            badgeColor = "#1a1a1a";
            badgeBorder = "rgba(255,215,0,0.8)";
        } else if (clicksGiven >= 50) {
            badgeBg = "linear-gradient(135deg, #c0c0c0, #a0a0a0)";
            badgeColor = "#1a1a1a";
            badgeBorder = "rgba(192,192,192,0.8)";
        } else if (clicksGiven >= 20) {
            badgeBg = "linear-gradient(135deg, #cd7f32, #b87333)";
            badgeColor = "#fff";
            badgeBorder = "rgba(205,127,50,0.8)";
        }

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pointerEvents: "none",
                    willChange: "transform",
                }}
            >
                {/* Main cursor container */}
                <div
                    style={{
                        position: "relative",
                        width: 48,
                        height: 48,
                    }}
                >
                    {/* Hat */}
                    {hatEmoji && (
                        <span
                            style={{
                                position: "absolute",
                                top: -18,
                                left: 4,
                                fontSize: 22,
                                transform: "rotate(-12deg)",
                                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                                zIndex: 12,
                            }}
                        >
                            {hatEmoji}
                        </span>
                    )}

                    {/* Accessory */}
                    {accessoryEmoji && (
                        <span
                            style={{
                                position: "absolute",
                                top: accessorySlug === "sunglasses" || accessorySlug === "mask" ? 8 : 2,
                                left: accessorySlug === "sunglasses" || accessorySlug === "mask" ? 8 : 30,
                                fontSize: 18,
                                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                                zIndex: 11,
                            }}
                        >
                            {accessoryEmoji}
                        </span>
                    )}

                    {/* Particle Effect */}
                    {effectType && (
                        <LightParticleEffect effect={effectType} size={48} />
                    )}

                    {/* Glow effect */}
                    <div
                        style={{
                            position: "absolute",
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                            left: 7,
                            top: 7,
                        }}
                    />

                    {/* Main dot */}
                    <div
                        style={{
                            position: "absolute",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: color,
                            left: 12,
                            top: 12,
                            border: "2.5px solid rgba(255,255,255,0.9)",
                            boxShadow: `0 3px 10px ${color}50, 0 1px 3px rgba(0,0,0,0.2)`,
                        }}
                    />

                    {/* Profile image - using native img to prevent flickering */}
                    {profileImageUrl && (
                        <img
                            src={profileImageUrl}
                            alt=""
                            width={22}
                            height={22}
                            style={{
                                position: "absolute",
                                top: -2,
                                right: -2,
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: "2px solid #fff",
                                background: "#fff",
                                objectFit: "cover",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            }}
                        />
                    )}

                    {/* Clicks badge */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: -2,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: badgeBg,
                            color: badgeColor,
                            border: `1.5px solid ${badgeBorder}`,
                            borderRadius: 999,
                            padding: "1px 6px",
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: "var(--font-mono), monospace",
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        }}
                    >
                        {clicksGiven}
                    </div>
                </div>

                {/* Name tag */}
                {name && (
                    <div
                        style={{
                            marginTop: 4,
                            padding: "2px 8px",
                            background: "rgba(0,0,0,0.75)",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#fff",
                            maxWidth: 100,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        {name}
                    </div>
                )}
            </div>
        );
    },
    // Custom comparison function - only re-render if these specific props change
    (prevProps, nextProps) => {
        return (
            prevProps.cursorColor === nextProps.cursorColor &&
            prevProps.fallbackSeed === nextProps.fallbackSeed &&
            prevProps.fallbackColor === nextProps.fallbackColor &&
            prevProps.profileImageUrl === nextProps.profileImageUrl &&
            prevProps.clicksGiven === nextProps.clicksGiven &&
            prevProps.hatSlug === nextProps.hatSlug &&
            prevProps.accessorySlug === nextProps.accessorySlug &&
            prevProps.effectSlug === nextProps.effectSlug &&
            prevProps.name === nextProps.name
        );
    }
);

