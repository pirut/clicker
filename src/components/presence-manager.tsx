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

    // Get user's click count - optimized query
    const { data: clicksData } = db.useQuery({
        clicks: userId ? { $: { where: { userId } } } : {},
    });

    // Query for existing displayName to get its ID
    const { data: displayNameData } = db.useQuery({
        displayNames: userId ? { $: { where: { userId } } } : {},
    });

    // Use the presence hook to get publishPresence method
    const presenceHandle = room.usePresence({
        keys: ["name", "status", "profileImageUrl", "clicksGiven"],
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

    const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
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

        publishPresence({
            name: displayName,
            status: "online",
            profileImageUrl,
        });
        presenceSetRef.current = true;

        // Find existing displayName entity or create new one
        const existingDisplayName = displayNameData?.displayNames?.find((dn: { userId: string }) => dn.userId === userId);
        const displayNameId = existingDisplayName?.id || id();

        db.transact(
            db.tx.displayNames[displayNameId].update({
                displayName,
                userId,
            })
        );

        return () => {
            if (presenceSetRef.current) {
                clearPresence();
                presenceSetRef.current = false;
            }
        };
    }, [isLoaded, userId, displayName, profileImageUrl, user, publishPresence, clearPresence, displayNameData]);

    // Update clicks presence separately to avoid resetting entire object
    useEffect(() => {
        if (!isLoaded || !userId || !user || !presenceSetRef.current) return;
        publishPresence({
            clicksGiven,
        });
    }, [clicksGiven, isLoaded, userId, user, publishPresence]);

    return null; // This component doesn't render anything
}

