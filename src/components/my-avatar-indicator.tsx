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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="fixed bottom-6 left-6 z-40 pointer-events-none"
        >
            <div className="relative">
                {/* Subtle glow background */}
                <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-30"
                    style={{ 
                        background: currentCursorColor || "#6366f1",
                        transform: "scale(1.5)",
                    }}
                />
                
                {/* Avatar container with glass effect */}
                <div className="relative glass rounded-2xl p-4 border border-white/20 backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <AvatarPreview
                            size={64}
                            cursorColor={currentCursorColor}
                            fallbackSeed={displayName}
                            profileImageUrl={profileImageUrl}
                            clicksGiven={clicksGiven}
                            hatSlug={currentHatSlug ?? undefined}
                            accessorySlug={currentAccessorySlug ?? undefined}
                            effectSlug={currentEffectSlug ?? undefined}
                            showClicksBadge
                        />
                        
                        {/* Info */}
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
                                Your Avatar
                            </span>
                            <span className="text-sm font-medium text-white truncate max-w-[120px]">
                                {displayName}
                            </span>
                            <span className="text-xs text-white/50">
                                Others see this ✨
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

