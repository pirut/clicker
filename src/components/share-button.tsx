"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Share2, Check, Copy, Users } from "lucide-react";
import React from "react";
import { db } from "@/lib/instantdb";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AvatarPreview } from "@/components/avatar-preview";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
    url?: string;
    text?: string;
    tooltip?: string;
    icon?: React.ReactNode;
    buttonClassName?: string;
}

export function ShareButton({ url: propUrl, text: propText, tooltip = "Invite friends!", icon, buttonClassName = "" }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isShareSupported, setIsShareSupported] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { user, isLoaded, isSignedIn } = useUser();

    // Fetch user's clicks and display info
    const { data, isLoading } = db.useQuery({
        clicks: user?.id ? { $: { where: { userId: user.id } } } : {},
        displayNames: user?.id ? { $: { where: { userId: user.id } } } : {},
    });
    
    const userClicks = data?.clicks?.length ?? 0;
    const userProfile = data?.displayNames?.[0];
    const displayName = userProfile?.displayName || user?.firstName || "Clicker";
    const hatSlug = userProfile?.hatSlug;
    const cursorColor = userProfile?.cursorColor;
    const profileImageUrl = userProfile?.profileImageUrl || user?.imageUrl;

    React.useEffect(() => {
        setIsClient(true);
        if (typeof navigator !== "undefined") {
            setIsShareSupported(!!navigator.share);
        }
    }, []);

    // Build share URL with user ID for personalized OG
    // Remove "user_" prefix from Clerk user ID for cleaner URLs
    const userIdForUrl = user?.id?.replace(/^user_/, "") || "";
    const shareUrl = propUrl || (userIdForUrl ? `https://clicker.jrbussard.com/share/${userIdForUrl}` : "https://clicker.jrbussard.com");
    
    const shareText = propText || `I've clicked ${userClicks} times on Clicker! Can you beat my score? 🎯`;

    const handleNativeShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${displayName} invites you to Clicker!`,
                    text: shareText,
                    url: shareUrl,
                });
                setIsDialogOpen(false);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }
                console.error(err);
            }
        }
    }, [displayName, shareText, shareUrl]);

    const handleCopyLink = useCallback(async () => {
        try {
            // Copy just the URL, not the text
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [shareUrl]);

    const handleButtonClick = () => {
        if (isShareSupported) {
            // On mobile, open dialog first to show preview
            setIsDialogOpen(true);
        } else {
            // On desktop without native share, just open dialog
            setIsDialogOpen(true);
        }
    };

    if (!isClient || !isLoaded || !isSignedIn || !user) return null;

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="outline" 
                            className={`glass-hover border-primary/20 gap-2 ${buttonClassName}`}
                            onClick={handleButtonClick}
                            aria-label={tooltip}
                        >
                            {icon || <Share2 className="h-4 w-4" />}
                            <span className="hidden sm:inline">Share</span>
                            {!isLoading && userClicks > 0 && (
                                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                                    {userClicks}
                                </span>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Invite Friends to Clicker!
                        </DialogTitle>
                        <DialogDescription>
                            Share your progress and challenge friends to beat your score.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Preview Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative overflow-hidden"
                    >
                        {/* Background decorations */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                        
                        <div className="relative flex flex-col items-center gap-4">
                            {/* Avatar */}
                            <AvatarPreview
                                size={80}
                                cursorColor={cursorColor}
                                fallbackSeed={user.id}
                                profileImageUrl={profileImageUrl}
                                clicksGiven={userClicks}
                                hatSlug={hatSlug}
                                showClicksBadge={true}
                            />

                            {/* Name */}
                            <div className="text-xl font-bold text-center">
                                {displayName}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                                <span className="text-2xl font-bold">{userClicks.toLocaleString()}</span>
                                <span className="text-sm text-white/70">clicks</span>
                            </div>

                            {/* Badge */}
                            <div className="text-sm text-white/60">
                                {userClicks >= 100 ? "🏆 Gold Clicker" : 
                                 userClicks >= 50 ? "🥈 Silver Clicker" : 
                                 userClicks >= 20 ? "🥉 Bronze Clicker" : "✨ Clicker"}
                            </div>

                            {/* CTA */}
                            <div className="text-center mt-2">
                                <p className="text-sm text-white/80">Join me on Clicker!</p>
                                <p className="text-xs text-white/50 mt-1">clicker.jrbussard.com</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Share Actions */}
                    <div className="flex flex-col gap-3 mt-4">
                        {isShareSupported && (
                            <Button 
                                onClick={handleNativeShare}
                                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                            >
                                <Share2 className="h-4 w-4" />
                                Share Now
                            </Button>
                        )}
                        
                        <Button 
                            variant="outline" 
                            onClick={handleCopyLink}
                            className="w-full gap-2"
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-green-500">Copied!</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copy"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span>Copy Link</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>

                    {/* Share URL Preview */}
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground break-all">{shareUrl}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
