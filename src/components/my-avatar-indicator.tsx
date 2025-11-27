"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { AvatarPreview } from "./avatar-preview";
import { motion } from "framer-motion";

/**
 * Shows the current user's avatar following their cursor.
 * This lets users see what their avatar looks like to others.
 */
export const MyAvatarIndicator = memo(function MyAvatarIndicator() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    // Get user's click count
    const { data: clicksData } = db.useQuery({
        clicks: userId
            ? {
                  $: {
                      where: { userId },
                      order: { createdAt: "desc" },
                      limit: 100000,
                  },
              }
            : {},
    });

    // Query for displayName to get avatar settings
    const { data: displayNameData } = db.useQuery({
        displayNames: userId ? { $: { where: { userId } } } : {},
    });

    const clicksGiven = useMemo(() => {
        return clicksData?.clicks?.length || 0;
    }, [clicksData?.clicks]);

    const displayNameRecord = useMemo(() => {
        if (!displayNameData?.displayNames || !userId) {
            return null;
        }
        return displayNameData.displayNames.find((dn: { userId: string }) => dn.userId === userId) || null;
    }, [displayNameData?.displayNames, userId]);

    const currentCursorColor = displayNameRecord?.cursorColor;
    const currentHatSlug = displayNameRecord?.hatSlug;
    const currentAccessorySlug = (displayNameRecord as { accessorySlug?: string } | null)?.accessorySlug;
    const currentEffectSlug = (displayNameRecord as { effectSlug?: string } | null)?.effectSlug;
    
    const customDisplayName = displayNameRecord?.displayName;
    const fallbackDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
    const displayName = customDisplayName || fallbackDisplayName;
    const profileImageUrl = user?.imageUrl || "";

    // Track mouse position
    useEffect(() => {
        if (!isLoaded || !userId || !user) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [isLoaded, userId, user]);

    // Don't render if not loaded or no user
    if (!isLoaded || !userId || !user) {
        return null;
    }

    // Offset from cursor to avoid covering the pointer
    const offsetX = 20;
    const offsetY = 20;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8,
            }}
            transition={{
                opacity: { duration: 0.2 },
                scale: { type: "spring", stiffness: 500, damping: 30 },
            }}
            className="fixed z-40 pointer-events-none"
            style={{
                transform: `translate(${mousePosition.x + offsetX}px, ${mousePosition.y + offsetY}px)`,
                willChange: "transform, opacity",
            }}
        >
            <div className="relative">
                {/* Subtle glow background */}
                <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-20"
                    style={{ 
                        background: currentCursorColor || "#6366f1",
                        transform: "scale(1.3)",
                    }}
                />
                
                {/* Avatar container with glass effect - more compact */}
                <div className="relative glass rounded-xl p-2.5 border border-white/10 backdrop-blur-lg">
                    <div className="flex items-center gap-2.5">
                        {/* Avatar - smaller */}
                        <AvatarPreview
                            size={48}
                            cursorColor={currentCursorColor}
                            fallbackSeed={displayName}
                            profileImageUrl={profileImageUrl}
                            clicksGiven={clicksGiven}
                            hatSlug={currentHatSlug ?? undefined}
                            accessorySlug={currentAccessorySlug ?? undefined}
                            effectSlug={currentEffectSlug ?? undefined}
                            showClicksBadge
                        />
                        
                        {/* Info - more compact */}
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">
                                Your Avatar
                            </span>
                            <span className="text-xs font-medium text-white truncate max-w-[100px]">
                                {displayName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

