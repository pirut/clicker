"use client";

import { memo, useMemo, CSSProperties } from "react";
import Image from "next/image";
import { cn, getStableHslColor } from "@/lib/utils";
import { ParticleEffect, EffectType } from "./particle-effect";

export type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface UserAvatarProps {
    size?: UserAvatarSize;
    cursorColor?: string;
    fallbackSeed?: string;
    fallbackColor?: string;
    profileImageUrl?: string;
    clicksGiven?: number;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    name?: string;
    showNameTag?: boolean;
    showClicksBadge?: boolean;
    showParticles?: boolean;
    className?: string;
    style?: CSSProperties;
}

// Size configurations
const SIZE_CONFIG: Record<UserAvatarSize, {
    container: number;
    dot: number;
    image: number;
    hat: number;
    accessory: number;
    effect: number;
    badge: { paddingX: number; paddingY: number; fontSize: number };
    nameTag: number;
}> = {
    xs: {
        container: 32,
        dot: 16,
        image: 14,
        hat: 14,
        accessory: 12,
        effect: 10,
        badge: { paddingX: 4, paddingY: 1, fontSize: 8 },
        nameTag: 9,
    },
    sm: {
        container: 40,
        dot: 20,
        image: 18,
        hat: 18,
        accessory: 14,
        effect: 12,
        badge: { paddingX: 5, paddingY: 2, fontSize: 9 },
        nameTag: 10,
    },
    md: {
        container: 48,
        dot: 24,
        image: 22,
        hat: 22,
        accessory: 18,
        effect: 16,
        badge: { paddingX: 6, paddingY: 2, fontSize: 10 },
        nameTag: 11,
    },
    lg: {
        container: 80,
        dot: 40,
        image: 36,
        hat: 36,
        accessory: 28,
        effect: 24,
        badge: { paddingX: 8, paddingY: 3, fontSize: 12 },
        nameTag: 13,
    },
    xl: {
        container: 140,
        dot: 70,
        image: 63,
        hat: 56,
        accessory: 44,
        effect: 36,
        badge: { paddingX: 12, paddingY: 4, fontSize: 16 },
        nameTag: 16,
    },
};

// Hat emoji mappings
const HAT_SYMBOLS: Record<string, { symbol: string; rotation: string }> = {
    "fun-hat": { symbol: "🎩", rotation: "-12deg" },
    "party-hat": { symbol: "🥳", rotation: "-8deg" },
    "crown": { symbol: "👑", rotation: "-5deg" },
    "wizard": { symbol: "🧙", rotation: "-10deg" },
    "cap": { symbol: "🧢", rotation: "-6deg" },
    "cowboy": { symbol: "🤠", rotation: "-7deg" },
    "beanie": { symbol: "🧶", rotation: "-4deg" },
    "helmet": { symbol: "⛑️", rotation: "-3deg" },
    "beret": { symbol: "🎨", rotation: "-9deg" },
    "santa": { symbol: "🎅", rotation: "-6deg" },
    "top-hat": { symbol: "🎩", rotation: "-11deg" },
};

// Accessory emoji mappings
const ACCESSORY_SYMBOLS: Record<string, { symbol: string; rotation: string }> = {
    "sunglasses": { symbol: "🕶️", rotation: "0deg" },
    "mask": { symbol: "😷", rotation: "0deg" },
    "halo": { symbol: "😇", rotation: "0deg" },
    "wings": { symbol: "👼", rotation: "0deg" },
    "devil": { symbol: "😈", rotation: "0deg" },
    "robot": { symbol: "🤖", rotation: "0deg" },
    "alien": { symbol: "👽", rotation: "0deg" },
};

// Map effect slugs to effect types
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

// Hat component
const Hat = memo(function Hat({ 
    hatSlug, 
    fontSize 
}: { 
    hatSlug: string; 
    fontSize: number;
}) {
    const config = HAT_SYMBOLS[hatSlug] || { symbol: "🧢", rotation: "-6deg" };
    
    return (
        <div
            style={{
                position: "absolute",
                top: -fontSize * 0.8,
                left: fontSize * 0.15,
                fontSize,
                transform: `rotate(${config.rotation})`,
                zIndex: 12,
                pointerEvents: "none",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
        >
            {config.symbol}
        </div>
    );
});

// Accessory component
const Accessory = memo(function Accessory({ 
    accessorySlug, 
    fontSize,
    containerSize,
}: { 
    accessorySlug: string; 
    fontSize: number;
    containerSize: number;
}) {
    const config = ACCESSORY_SYMBOLS[accessorySlug] || { symbol: "🎭", rotation: "0deg" };
    const isFaceAccessory = accessorySlug === "sunglasses" || accessorySlug === "mask";
    
    return (
        <div
            style={{
                position: "absolute",
                top: isFaceAccessory ? containerSize * 0.15 : containerSize * 0.05,
                left: isFaceAccessory ? containerSize * 0.15 : containerSize * 0.6,
                fontSize,
                transform: `rotate(${config.rotation})`,
                zIndex: 11,
                pointerEvents: "none",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
        >
            {config.symbol}
        </div>
    );
});

// Badge showing click count
const ClicksBadge = memo(function ClicksBadge({
    clicksGiven,
    config,
}: {
    clicksGiven: number;
    config: typeof SIZE_CONFIG.md.badge;
}) {
    // Dynamic badge color based on click count
    const getBadgeStyle = () => {
        if (clicksGiven >= 100) {
            return {
                background: "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
                border: "1.5px solid rgba(255, 215, 0, 0.8)",
                color: "#1a1a1a",
                boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
            };
        } else if (clicksGiven >= 50) {
            return {
                background: "linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%)",
                border: "1.5px solid rgba(192, 192, 192, 0.8)",
                color: "#1a1a1a",
                boxShadow: "0 2px 6px rgba(160, 160, 160, 0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
            };
        } else if (clicksGiven >= 20) {
            return {
                background: "linear-gradient(135deg, #cd7f32 0%, #b87333 100%)",
                border: "1.5px solid rgba(205, 127, 50, 0.8)",
                color: "#fff",
                boxShadow: "0 2px 6px rgba(184, 115, 51, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            };
        }
        return {
            background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)",
            border: "1.5px solid rgba(0,0,0,0.15)",
            color: "#333",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        };
    };

    const badgeStyle = getBadgeStyle();

    return (
        <div
            style={{
                position: "absolute",
                bottom: -4,
                left: "50%",
                transform: "translateX(-50%)",
                ...badgeStyle,
                borderRadius: 999,
                padding: `${config.paddingY}px ${config.paddingX}px`,
                fontSize: config.fontSize,
                fontWeight: 700,
                zIndex: 15,
                fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
            }}
        >
            {clicksGiven}
        </div>
    );
});

// Profile image component
const ProfileImage = memo(function ProfileImage({
    profileImageUrl,
    imageSize,
}: {
    profileImageUrl: string;
    imageSize: number;
}) {
    return (
        <div
            style={{
                position: "absolute",
                top: -imageSize * 0.15,
                right: -imageSize * 0.15,
                width: imageSize,
                height: imageSize,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #fff",
                background: "#fff",
                zIndex: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
        >
            <Image
                src={profileImageUrl}
                alt="profile"
                width={imageSize}
                height={imageSize}
                unoptimized
                priority
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
        </div>
    );
});

// Name tag component
const NameTag = memo(function NameTag({ 
    name, 
    fontSize,
    containerSize,
}: { 
    name: string; 
    fontSize: number;
    containerSize: number;
}) {
    return (
        <div
            style={{
                marginTop: 4,
                padding: "3px 8px",
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)",
                borderRadius: 6,
                fontSize,
                fontWeight: 500,
                color: "#fff",
                textAlign: "center",
                maxWidth: containerSize * 2.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
            }}
        >
            {name}
        </div>
    );
});

// Main avatar component
export const UserAvatar = memo(function UserAvatar({
    size = "md",
    cursorColor,
    fallbackSeed = "avatar",
    fallbackColor,
    profileImageUrl,
    clicksGiven,
    hatSlug,
    accessorySlug,
    effectSlug,
    name,
    showNameTag = false,
    showClicksBadge = true,
    showParticles = true,
    className,
    style,
}: UserAvatarProps) {
    const config = SIZE_CONFIG[size];
    const dotOffset = (config.container - config.dot) / 2;
    
    const resolvedColor = useMemo(
        () => cursorColor || fallbackColor || getStableHslColor(fallbackSeed),
        [cursorColor, fallbackColor, fallbackSeed]
    );

    // Get effect type from slug
    const effectType = effectSlug ? EFFECT_MAP[effectSlug] : undefined;

    // Create a subtle pulsing glow effect based on the cursor color
    const glowColor = useMemo(() => {
        if (cursorColor?.startsWith("#")) {
            return cursorColor + "40";
        }
        return "rgba(255,255,255,0.2)";
    }, [cursorColor]);

    return (
        <div className={cn("flex flex-col items-center", className)} style={style}>
            <div style={{ position: "relative", width: config.container, height: config.container }}>
                {/* Particle effects layer (behind avatar) */}
                {showParticles && effectType && (
                    <ParticleEffect 
                        effect={effectType} 
                        size={config.container}
                        intensity={size === "xl" ? "high" : size === "lg" ? "medium" : "low"}
                    />
                )}
                
                {/* Hat */}
                {hatSlug && <Hat hatSlug={hatSlug} fontSize={config.hat} />}
                
                {/* Accessory */}
                {accessorySlug && (
                    <Accessory 
                        accessorySlug={accessorySlug} 
                        fontSize={config.accessory}
                        containerSize={config.container}
                    />
                )}
                
                {/* Glow effect behind the main dot */}
                <div
                    style={{
                        width: config.dot * 1.4,
                        height: config.dot * 1.4,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        position: "absolute",
                        left: dotOffset - (config.dot * 0.2),
                        top: dotOffset - (config.dot * 0.2),
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                />
                
                {/* Main cursor dot */}
                <div
                    style={{
                        width: config.dot,
                        height: config.dot,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${resolvedColor} 0%, ${resolvedColor}dd 100%)`,
                        position: "absolute",
                        left: dotOffset,
                        top: dotOffset,
                        zIndex: 2,
                        boxShadow: `0 3px 12px ${resolvedColor}60, 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)`,
                        border: "2.5px solid rgba(255,255,255,0.9)",
                    }}
                />
                
                {/* Profile image */}
                {profileImageUrl && (
                    <ProfileImage
                        profileImageUrl={profileImageUrl}
                        imageSize={config.image}
                    />
                )}
                
                {/* Clicks badge */}
                {showClicksBadge && typeof clicksGiven === "number" && (
                    <ClicksBadge clicksGiven={clicksGiven} config={config.badge} />
                )}
            </div>
            
            {/* Name tag */}
            {showNameTag && name && (
                <NameTag name={name} fontSize={config.nameTag} containerSize={config.container} />
            )}
        </div>
    );
});

// Export a simple avatar version without particles for lightweight usage
export const SimpleUserAvatar = memo(function SimpleUserAvatar(props: UserAvatarProps) {
    return <UserAvatar {...props} showParticles={false} />;
});

