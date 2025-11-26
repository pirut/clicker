"use client";

import Image from "next/image";
import { CSSProperties, memo, useMemo } from "react";
import { cn, getStableHslColor } from "@/lib/utils";

type AvatarPreviewProps = {
    size?: number;
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
    className?: string;
    style?: CSSProperties;
};

const hatSymbols: Record<string, { symbol: string; rotation: string }> = {
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

const accessorySymbols: Record<string, { symbol: string; rotation: string }> = {
    "sunglasses": { symbol: "🕶️", rotation: "0deg" },
    "mask": { symbol: "😷", rotation: "0deg" },
    "halo": { symbol: "😇", rotation: "0deg" },
    "wings": { symbol: "👼", rotation: "0deg" },
    "devil": { symbol: "😈", rotation: "0deg" },
    "robot": { symbol: "🤖", rotation: "0deg" },
    "alien": { symbol: "👽", rotation: "0deg" },
};

const effectSymbols: Record<string, { symbol: string; animation?: string }> = {
    "sparkles": { symbol: "✨", animation: "pulse" },
    "glow": { symbol: "💫", animation: "pulse" },
    "rainbow": { symbol: "🌈", animation: "spin" },
    "fire": { symbol: "🔥", animation: "pulse" },
    "ice": { symbol: "❄️", animation: "pulse" },
    "lightning": { symbol: "⚡", animation: "flash" },
    "stars": { symbol: "⭐", animation: "twinkle" },
};

const HatItem = memo(function HatItem({ hatSlug, size }: { hatSlug?: string; size: number }) {
    if (!hatSlug) return null;
    const config = hatSymbols[hatSlug] || { symbol: "🧢", rotation: "-6deg" };
    const topOffset = Math.max(-size * 0.4, -40);
    const leftOffset = size * 0.08;

    return (
        <div
            style={{
                position: "absolute",
                top: topOffset,
                left: leftOffset,
                fontSize: size * 0.5,
                transform: `rotate(${config.rotation})`,
                zIndex: 12,
                pointerEvents: "none",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                transition: "transform 0.2s ease-out",
            }}
        >
            {config.symbol}
        </div>
    );
});

const AccessoryItem = memo(function AccessoryItem({ accessorySlug, size }: { accessorySlug?: string; size: number }) {
    if (!accessorySlug) return null;
    const config = accessorySymbols[accessorySlug] || { symbol: "🎭", rotation: "0deg" };
    const isFaceAccessory = accessorySlug === "sunglasses" || accessorySlug === "mask";
    const topOffset = isFaceAccessory ? size * 0.15 : size * 0.05;
    const leftOffset = isFaceAccessory ? size * 0.15 : size * 0.6;

    return (
        <div
            style={{
                position: "absolute",
                top: topOffset,
                left: leftOffset,
                fontSize: size * 0.4,
                transform: `rotate(${config.rotation})`,
                zIndex: 11,
                pointerEvents: "none",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                transition: "transform 0.2s ease-out",
            }}
        >
            {config.symbol}
        </div>
    );
});

const EffectItem = memo(function EffectItem({ effectSlug, size }: { effectSlug?: string; size: number }) {
    if (!effectSlug) return null;
    const config = effectSymbols[effectSlug] || { symbol: "✨" };

    return (
        <div
            style={{
                position: "absolute",
                top: -size * 0.1,
                right: -size * 0.1,
                fontSize: size * 0.35,
                zIndex: 13,
                pointerEvents: "none",
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
                animation: config.animation === "pulse" ? "pulse 2s ease-in-out infinite" : 
                          config.animation === "spin" ? "spin 4s linear infinite" : undefined,
            }}
        >
            {config.symbol}
        </div>
    );
});

const ClicksBadge = memo(function ClicksBadge({
    clicksGiven,
    size,
}: {
    clicksGiven: number;
    size: number;
}) {
    const badgePaddingX = Math.max(Math.round(size * 0.12), 6);
    const badgePaddingY = Math.max(Math.round(size * 0.04), 2);
    const fontSize = Math.max(size * 0.22, 11);

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
                padding: `${badgePaddingY}px ${badgePaddingX}px`,
                fontSize,
                fontWeight: 700,
                zIndex: 5,
                fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
                minWidth: size * 0.4,
                textAlign: "center",
            }}
        >
            {clicksGiven}
        </div>
    );
});

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

const NameTag = memo(function NameTag({ name, size }: { name: string; size: number }) {
    const fontSize = Math.max(size * 0.24, 11);

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
                maxWidth: size * 2.5,
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

export const AvatarPreview = memo(function AvatarPreview({
    size = 48,
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
    className,
    style,
}: AvatarPreviewProps) {
    const dotSize = useMemo(() => Math.max(Math.round(size * 0.5), 20), [size]);
    const imageSize = useMemo(() => Math.max(Math.round(size * 0.45), 20), [size]);
    const dotOffset = useMemo(() => (size - dotSize) / 2, [size, dotSize]);
    const resolvedColor = useMemo(
        () => cursorColor || fallbackColor || getStableHslColor(fallbackSeed),
        [cursorColor, fallbackColor, fallbackSeed]
    );

    // Create a subtle pulsing glow effect based on the cursor color
    const glowColor = useMemo(() => {
        if (cursorColor?.startsWith("#")) {
            return cursorColor + "40"; // Add alpha
        }
        return "rgba(255,255,255,0.2)";
    }, [cursorColor]);

    return (
        <div className={cn("flex flex-col items-center", className)} style={style}>
            <div style={{ position: "relative", width: size, height: size }}>
                <HatItem hatSlug={hatSlug} size={size} />
                <AccessoryItem accessorySlug={accessorySlug} size={size} />
                <EffectItem effectSlug={effectSlug} size={size} />
                
                {/* Glow effect behind the main dot */}
                <div
                    style={{
                        width: dotSize * 1.4,
                        height: dotSize * 1.4,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        position: "absolute",
                        left: dotOffset - (dotSize * 0.2),
                        top: dotOffset - (dotSize * 0.2),
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                />
                
                {/* Main cursor dot */}
                <div
                    style={{
                        width: dotSize,
                        height: dotSize,
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
                
                {profileImageUrl && (
                    <ProfileImage
                        profileImageUrl={profileImageUrl}
                        imageSize={imageSize}
                    />
                )}
                
                {showClicksBadge && typeof clicksGiven === "number" && (
                    <ClicksBadge clicksGiven={clicksGiven} size={size} />
                )}
            </div>
            
            {showNameTag && name && <NameTag name={name} size={size} />}
        </div>
    );
});
