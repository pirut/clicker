"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { useEffect, useMemo, useRef } from "react";

const room = db.room("chat", "main");

export function PresenceManager() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const presenceSetRef = useRef(false);

    // Get user's click count - optimized query
    const { data: clicksData } = db.useQuery({
        clicks: userId ? { $: { where: { userId } } } : {},
    });

    // Use the presence hook to get publishPresence method
    const presenceHandle = room.usePresence({
        keys: ["name", "status", "profileImageUrl", "clicksGiven"],
    });

    const clicksGiven = useMemo(() => {
        return clicksData?.clicks?.length || 0;
    }, [clicksData?.clicks]);

    useEffect(() => {
        if (!isLoaded || !userId || !user) {
            // Clear presence if user logs out
            if (presenceSetRef.current) {
                presenceHandle.publishPresence({
                    name: undefined,
                    status: undefined,
                    profileImageUrl: undefined,
                    clicksGiven: undefined,
                });
                presenceSetRef.current = false;
            }
            return;
        }

        const displayName = user.firstName || user.emailAddresses[0]?.emailAddress || "Anonymous";
        const profileImageUrl = user.imageUrl || "";

        // Update presence in the room
        presenceHandle.publishPresence({
            name: displayName,
            status: "online",
            profileImageUrl,
            clicksGiven,
        });
        presenceSetRef.current = true;

        // Create or update displayName entry
        db.transact(
            db.tx.displayNames[userId].update({
                displayName,
                userId,
            })
        );

        // Cleanup: clear presence when component unmounts
        return () => {
            if (presenceSetRef.current) {
                presenceHandle.publishPresence({
                    name: undefined,
                    status: undefined,
                    profileImageUrl: undefined,
                    clicksGiven: undefined,
                });
                presenceSetRef.current = false;
            }
        };
    }, [isLoaded, userId, user, clicksGiven, presenceHandle]);

    // Update presence when clicksGiven changes
    useEffect(() => {
        if (!isLoaded || !userId || !user || !presenceSetRef.current) return;

        const displayName = user.firstName || user.emailAddresses[0]?.emailAddress || "Anonymous";
        const profileImageUrl = user.imageUrl || "";

        presenceHandle.publishPresence({
            name: displayName,
            status: "online",
            profileImageUrl,
            clicksGiven,
        });
    }, [clicksGiven, isLoaded, userId, user, presenceHandle]);

    return null; // This component doesn't render anything
}

