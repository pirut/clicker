"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Share2 } from "lucide-react";
import React from "react";
import { db } from "@/lib/instantdb";
import { useUser } from "@clerk/nextjs";

interface ShareButtonProps {
    url?: string;
    text?: string;
    tooltip?: string;
    icon?: React.ReactNode;
    buttonClassName?: string;
}

export function ShareButton({ url: propUrl, text: propText, tooltip = "Share this site", icon, buttonClassName = "" }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isShareSupported, setIsShareSupported] = useState(false);
    const { user, isLoaded, isSignedIn } = useUser();

    // Fetch only the current user's clicks from InstantDB
    const { data, isLoading, error } = db.useQuery({ clicks: user?.id ? { $: { where: { userId: user.id } } } : {} });
    const userClicks = data?.clicks?.length ?? 0;

    React.useEffect(() => {
        setIsClient(true);
        if (typeof navigator !== "undefined") {
            setIsShareSupported(!!navigator.share);
        }
    }, []);

    if (!isClient || !isLoaded || !isSignedIn || !user) return null;

    // Use /share/[amount] route for sharing
    const url = propUrl || `https://gimme.jrbussard.com/share/${userClicks}`;
    let text = propText;
    if (!text) {
        if (isLoading) {
            text = "Check out gimme.jrbussard.com - Give a click!";
        } else if (error) {
            text = "Join me on gimme.jrbussard.com!";
        } else {
            text = `I've clicked ${userClicks} times on gimme.jrbussard.com! Join me!`;
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Gimme a Click",
                    text,
                    url,
                });
                return;
            } catch (err: unknown) {
                // Ignore abort/cancellation errors
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }
                console.error(err);
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className={buttonClassName} size="icon" onClick={handleShare} aria-label={tooltip}>
                        {icon || <Share2 className="h-5 w-5" />}
                        <span className="sr-only">{isShareSupported ? "Share this site!" : copied ? "Link copied!" : "Copy share link"}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
                    {isShareSupported ? tooltip : copied ? "Link copied!" : "Copy share link"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
