"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import { db } from "@/lib/instantdb";
import { useUserClickCount } from "@/lib/use-click-stats";
import { CursorAvatar } from "./cursor-avatar";

export const MyAvatarIndicator = memo(function MyAvatarIndicator() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const { clickCount } = useUserClickCount(userId);
    const [isPointerVisible, setIsPointerVisible] = useState(true);
    const isPointerVisibleRef = useRef(false);
    const localCursorRef = useRef<HTMLDivElement | null>(null);

    const { data: displayNameData } = db.useQuery({
        displayNames: userId ? { $: { where: { userId } } } : {},
    });

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

    useEffect(() => {
        if (!isLoaded || !userId || !user || typeof window === "undefined") {
            return;
        }

        if (!window.matchMedia("(pointer:fine)").matches) {
            return;
        }

        const node = localCursorRef.current;
        if (!node) {
            return;
        }

        const previousBodyCursor = document.body.style.cursor;
        const previousHtmlCursor = document.documentElement.style.cursor;
        document.body.style.cursor = "none";
        document.documentElement.style.cursor = "none";

        let animationFrameId = 0;
        const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const current = { ...target };

        const draw = () => {
            current.x += (target.x - current.x) * 0.3;
            current.y += (target.y - current.y) * 0.3;
            node.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
            animationFrameId = window.requestAnimationFrame(draw);
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerType && event.pointerType !== "mouse") {
                if (isPointerVisibleRef.current) {
                    isPointerVisibleRef.current = false;
                    setIsPointerVisible(false);
                }
                return;
            }

            target.x = event.clientX;
            target.y = event.clientY;

            if (!isPointerVisibleRef.current) {
                isPointerVisibleRef.current = true;
                setIsPointerVisible(true);
            }
        };

        const hidePointer = () => {
            isPointerVisibleRef.current = false;
            setIsPointerVisible(false);
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerleave", hidePointer);
        window.addEventListener("blur", hidePointer);

        draw();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerleave", hidePointer);
            window.removeEventListener("blur", hidePointer);
            document.body.style.cursor = previousBodyCursor;
            document.documentElement.style.cursor = previousHtmlCursor;
        };
    }, [isLoaded, userId, user]);

    if (!isLoaded || !userId || !user) {
        return null;
    }

    return (
        <div
            ref={localCursorRef}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[85] hidden md:block"
            style={{ opacity: isPointerVisible ? 1 : 0, transition: "opacity 120ms ease" }}
        >
            <div className="relative">
                <div className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-black/70 shadow-md" />
                <div className="translate-x-1.5 translate-y-1.5">
                    <CursorAvatar
                        cursorColor={currentCursorColor}
                        fallbackSeed={displayName}
                        profileImageUrl={profileImageUrl}
                        clicksGiven={clickCount}
                        hatSlug={currentHatSlug ?? undefined}
                        accessorySlug={currentAccessorySlug ?? undefined}
                        effectSlug={currentEffectSlug ?? undefined}
                        name={displayName}
                    />
                </div>
            </div>
        </div>
    );
});
