"use client";

import Image from "next/image";
import { CSSProperties } from "react";
import { cn, getStableHslColor } from "@/lib/utils";

type AvatarPreviewProps = {
    size?: number;
    cursorColor?: string;
    fallbackSeed?: string;
    fallbackColor?: string;
    profileImageUrl?: string;
    clicksGiven?: number;
    hatSlug?: string;
    name?: string;
    showNameTag?: boolean;
    showClicksBadge?: boolean;
    className?: string;
    style?: CSSProperties;
};

const hatSymbols: Record<string, { symbol: string; rotation: string }> = {
    "fun-hat": { symbol: "🎩", rotation: "-4deg" },
    "party-hat": { symbol: "🥳", rotation: "-8deg" },
};

function HatAccessory({ hatSlug, size }: { hatSlug?: string; size: number }) {
    if (!hatSlug) return null;
    const config = hatSymbols[hatSlug] || { symbol: "🧢", rotation: "-6deg" };
    const topOffset = Math.max(-size * 0.35, -36);
    const leftOffset = size * 0.1;
    return (
        <div
            style={{
                position: "absolute",
                top: topOffset,
                left: leftOffset,
                fontSize: size * 0.45,
                transform: `rotate(${config.rotation})`,
                zIndex: 2,
                pointerEvents: "none",
            }}
        >
            {config.symbol}
        </div>
    );
}

export function AvatarPreview({
    size = 48,
    cursorColor,
    fallbackSeed = "avatar",
    fallbackColor,
    profileImageUrl,
    clicksGiven,
    hatSlug,
    name,
    showNameTag = false,
    showClicksBadge = true,
    className,
    style,
}: AvatarPreviewProps) {
    const dotSize = Math.max(Math.round(size * 0.42), 18);
    const imageSize = Math.max(Math.round(size * 0.42), 18);
    const badgePaddingX = Math.round(size * 0.08);
    const badgePaddingY = Math.round(size * 0.02);
    const dotOffset = (size - dotSize) / 2;
    const resolvedColor = cursorColor || fallbackColor || getStableHslColor(fallbackSeed);

    return (
        <div className={cn("flex flex-col items-center gap-1", className)} style={style}>
            <div style={{ position: "relative", width: size, height: size }}>
                <HatAccessory hatSlug={hatSlug} size={size} />
                <div
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        background: resolvedColor,
                        position: "absolute",
                        left: dotOffset,
                        top: dotOffset,
                        zIndex: 1,
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.12)",
                        border: "2px solid #fff",
                        transition: "background 0.3s",
                    }}
                />
                {profileImageUrl && (
                    <Image
                        src={profileImageUrl}
                        alt="profile"
                        width={imageSize}
                        height={imageSize}
                        unoptimized
                        loading="lazy"
                        style={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            borderRadius: imageSize / 2,
                            border: "2px solid #fff",
                            background: "#fff",
                            zIndex: 1,
                            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.1)",
                            transform: "rotate(-2deg) scale(0.85)",
                        }}
                    />
                )}
                {showClicksBadge && typeof clicksGiven === "number" && (
                    <div
                        style={{
                            position: "absolute",
                            top: -2,
                            left: -2,
                            background: "linear-gradient(90deg, #fffbe7 60%, #ffe7e7 100%)",
                            color: "#222",
                            borderRadius: 6,
                            padding: `${badgePaddingY}px ${badgePaddingX}px`,
                            fontSize: Math.max(size * 0.18, 10),
                            fontWeight: 600,
                            zIndex: 1,
                            border: "1px solid #ffe066",
                            fontFamily: "JetBrains Mono, monospace",
                            boxShadow: "0 1px 4px 0 rgba(255,224,102,0.15)",
                            letterSpacing: 0.3,
                            transform: "rotate(-1deg)",
                        }}
                    >
                        {clicksGiven}
                    </div>
                )}
            </div>
            {showNameTag && (
                <div className="text-sm font-medium text-white text-center leading-tight">{name ?? "Anonymous"}</div>
            )}
        </div>
    );
}

