"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import { db } from "@/lib/instantdb";
import { AvatarPreview } from "./avatar-preview";
import { useUserClickCount } from "@/lib/use-click-stats";

const PREVIEW_WIDTH = 108;
const PREVIEW_HEIGHT = 72;
const PREVIEW_OFFSET_X = 16;
const PREVIEW_OFFSET_Y = 20;
const PREVIEW_PADDING = 12;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const MyAvatarIndicator = memo(function MyAvatarIndicator() {
    const { userId, isLoaded } = useAuth();
    const { user } = useUser();
    const { clickCount } = useUserClickCount(userId);
    const [isPointerVisible, setIsPointerVisible] = useState(false);
    const isPointerVisibleRef = useRef(false);
    const previewRef = useRef<HTMLDivElement | null>(null);

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

        const node = previewRef.current;
        if (!node) {
            return;
        }

        let animationFrameId = 0;
        const target = {
            x: window.innerWidth - PREVIEW_WIDTH - 24,
            y: 120,
        };
        const current = { ...target };

        const draw = () => {
            current.x += (target.x - current.x) * 0.28;
            current.y += (target.y - current.y) * 0.28;
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

            const maxX = window.innerWidth - PREVIEW_WIDTH - PREVIEW_PADDING;
            const maxY = window.innerHeight - PREVIEW_HEIGHT - PREVIEW_PADDING;

            target.x = clamp(event.clientX + PREVIEW_OFFSET_X, PREVIEW_PADDING, maxX);
            target.y = clamp(event.clientY + PREVIEW_OFFSET_Y, PREVIEW_PADDING, maxY);

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
        };
    }, [isLoaded, userId, user]);

    if (!isLoaded || !userId || !user) {
        return null;
    }

    return (
        <>
            <div
                ref={previewRef}
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-[80] hidden md:block"
                style={{ opacity: isPointerVisible ? 1 : 0, transition: "opacity 180ms ease" }}
            >
                <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/25 blur-2xl" />
                    <div className="glass relative rounded-2xl border border-border/80 px-2.5 py-2 shadow-[0_14px_34px_-16px_rgb(8_12_35_/_0.7)]">
                        <div className="flex items-center gap-2">
                            <AvatarPreview
                                size={42}
                                cursorColor={currentCursorColor}
                                fallbackSeed={displayName}
                                profileImageUrl={profileImageUrl}
                                clicksGiven={clickCount}
                                hatSlug={currentHatSlug ?? undefined}
                                accessorySlug={currentAccessorySlug ?? undefined}
                                effectSlug={currentEffectSlug ?? undefined}
                                showClicksBadge
                            />
                            <div className="flex min-w-0 flex-col">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Your Pointer</span>
                                <span className="truncate text-xs font-semibold text-foreground">{displayName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none fixed bottom-4 right-3 z-40 md:hidden">
                <div className="glass rounded-full border border-border/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Pointer preview is active on desktop
                </div>
            </div>
        </>
    );
});
