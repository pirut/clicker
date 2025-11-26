"use client";

import { memo, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { AvatarPreview } from "./avatar-preview";
import { motion } from "framer-motion";

/**
 * Shows the current user's avatar in a fixed position on screen.
 * This lets users see what their avatar looks like to others.
 */
export const MyAvatarIndicator = memo(function MyAvatarIndicator() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();

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

    // Don't render if not loaded or no user
    if (!isLoaded || !userId || !user) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="fixed top-20 right-4 z-40 pointer-events-none"
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

