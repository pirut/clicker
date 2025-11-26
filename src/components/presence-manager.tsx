"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { id } from "@instantdb/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

const room = db.room("chat", "main");

export function PresenceManager() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const presenceSetRef = useRef(false);
    const pendingUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedProfileImageRef = useRef<string | null>(null);

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
        keys: ["name", "status", "profileImageUrl", "clicksGiven", "cursorColor", "hatSlug", "accessorySlug", "effectSlug"],
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
    const currentAccessorySlug = (displayNameRecord as { accessorySlug?: string } | null)?.accessorySlug;
    const currentEffectSlug = (displayNameRecord as { effectSlug?: string } | null)?.effectSlug;
    // Use custom display name from database if set, otherwise fall back to Clerk user info
    const customDisplayName = displayNameRecord?.displayName;

    const fallbackDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
    const displayName = customDisplayName || fallbackDisplayName;
    const profileImageUrl = user?.imageUrl || "";

    // Save profile image URL to displayNames when it changes
    useEffect(() => {
        if (!userId || !profileImageUrl || !displayNameRecord?.id) return;
        
        // Only update if profile image has changed
        if (lastSavedProfileImageRef.current === profileImageUrl) return;
        if (displayNameRecord.profileImageUrl === profileImageUrl) {
            lastSavedProfileImageRef.current = profileImageUrl;
            return;
        }

        lastSavedProfileImageRef.current = profileImageUrl;
        db.transact(
            db.tx.displayNames[displayNameRecord.id].update({
                profileImageUrl,
            })
        ).catch(console.error);
    }, [userId, profileImageUrl, displayNameRecord?.id, displayNameRecord?.profileImageUrl]);

    // Create displayName record if it doesn't exist (for profile image storage)
    useEffect(() => {
        if (!userId || !user || displayNameRecord) return;
        
        const displayNameId = id();
        db.transact(
            db.tx.displayNames[displayNameId].update({
                displayName: fallbackDisplayName,
                userId,
                profileImageUrl,
            })
        ).catch(console.error);
    }, [userId, user, displayNameRecord, fallbackDisplayName, profileImageUrl]);

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
                accessorySlug: currentAccessorySlug,
                effectSlug: currentEffectSlug,
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
    }, [isLoaded, userId, displayName, profileImageUrl, user, publishPresence, clearPresence, currentCursorColor, currentHatSlug, currentAccessorySlug, currentEffectSlug, clicksGiven]);

    return null; // This component doesn't render anything
}
