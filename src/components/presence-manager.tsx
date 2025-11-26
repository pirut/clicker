"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { useCallback, useEffect, useMemo, useRef } from "react";

const room = db.room("chat", "main");

export function PresenceManager() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const presenceSetRef = useRef(false);
    const pendingUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get user's click count - optimized query with limit for performance
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

    // Query for existing displayName to get avatar settings
    const { data: displayNameData } = db.useQuery({
        displayNames: userId ? { $: { where: { userId } } } : {},
    });

    // Use the presence hook to get publishPresence method
    const presenceHandle = room.usePresence({
        keys: ["name", "status", "profileImageUrl", "clicksGiven", "cursorColor", "hatSlug"],
    });
    const publishPresence = presenceHandle.publishPresence;

    const clicksGiven = useMemo(() => {
        return clicksData?.clicks?.length || 0;
    }, [clicksData?.clicks]);

    const clearPresence = useCallback(() => {
        publishPresence({
            name: undefined,
            status: undefined,
            profileImageUrl: undefined,
            clicksGiven: undefined,
        });
    }, [publishPresence]);

    const displayNameRecord = useMemo(() => {
        if (!displayNameData?.displayNames || !userId) {
            return null;
        }
        return displayNameData.displayNames.find((dn: { userId: string }) => dn.userId === userId) || null;
    }, [displayNameData?.displayNames, userId]);

    const currentCursorColor = displayNameRecord?.cursorColor;
    const currentHatSlug = displayNameRecord?.hatSlug;
    // Use custom display name from database if set, otherwise fall back to Clerk user info
    const customDisplayName = displayNameRecord?.displayName;

    const fallbackDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
    const displayName = customDisplayName || fallbackDisplayName;
    const profileImageUrl = user?.imageUrl || "";

    useEffect(() => {
        if (!publishPresence) return;

        if (!isLoaded || !userId || !user) {
            if (presenceSetRef.current) {
                clearPresence();
                presenceSetRef.current = false;
            }
            return;
        }

        if (pendingUpdateRef.current) {
            clearTimeout(pendingUpdateRef.current);
        }

        // Debounce presence updates to avoid rapid fire
        pendingUpdateRef.current = setTimeout(() => {
            publishPresence({
                name: displayName,
                status: "online",
                profileImageUrl,
                cursorColor: currentCursorColor,
                hatSlug: currentHatSlug,
                clicksGiven,
            });
            presenceSetRef.current = true;
        }, 50);

        return () => {
            if (pendingUpdateRef.current) {
                clearTimeout(pendingUpdateRef.current);
                pendingUpdateRef.current = null;
            }
            if (presenceSetRef.current) {
                clearPresence();
                presenceSetRef.current = false;
            }
        };
    }, [
        isLoaded,
        userId,
        displayName,
        profileImageUrl,
        user,
        publishPresence,
        clearPresence,
        currentCursorColor,
        currentHatSlug,
        clicksGiven,
    ]);

    return null; // This component doesn't render anything
}
