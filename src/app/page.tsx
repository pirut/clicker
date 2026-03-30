"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Cursors } from "@instantdb/react";
import { Zap } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { db } from "@/lib/instantdb";
import GiveClickButton from "@/components/give-click-button";
import LatestClicks from "@/components/latest-clicks";
import { ArenaPulse } from "@/components/arena-pulse";
import { Background } from "@/components/background";
import { LiveChatPanel } from "@/components/live-chat-panel";
import { PresenceManager } from "@/components/presence-manager";
import { CursorAvatar } from "@/components/cursor-avatar";
import { useTotalClickStats } from "@/lib/use-click-stats";

const room = db.room("chat", "main");

type Presence = {
    name: string;
    status: string;
    profileImageUrl?: string;
    clicksGiven?: number;
    cursorColor?: string;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
};

export default function HomePage() {
    const { totalClicks, isLoading: totalClicksLoading } = useTotalClickStats();

    const renderCursor = useCallback(({ presence, color }: { presence: Presence; color: string }) => {
        return (
            <CursorAvatar
                cursorColor={presence?.cursorColor}
                fallbackSeed={presence?.profileImageUrl || presence?.name || "clicker"}
                fallbackColor={color}
                profileImageUrl={presence?.profileImageUrl}
                clicksGiven={presence?.clicksGiven}
                hatSlug={presence?.hatSlug}
                accessorySlug={presence?.accessorySlug}
                effectSlug={presence?.effectSlug}
                name={presence?.name}
            />
        );
    }, []);

    return (
        <>
            <PresenceManager />
            <Cursors room={room} className="min-h-screen w-full" userCursorColor="tomato" renderCursor={renderCursor} zIndex={50}>
                <Background />
                <div className="relative flex min-h-screen flex-col">
                    <Header />

                    <main className="relative z-20 flex flex-1 flex-col px-3 pb-12 pt-24 sm:px-4 sm:pt-28">
                        {/* Hero - stamped directly on kraft paper */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="mx-auto flex w-full max-w-2xl flex-col items-center pt-6 text-center sm:pt-10"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary shadow-xs">
                                <Zap className="h-3 w-3" />
                                Realtime Multiplayer
                            </div>

                            <h1 className="mt-5 font-display text-[clamp(3.5rem,10vw,7rem)] font-bold leading-[0.85] text-gradient">
                                CLICKER
                            </h1>

                            <p className="mt-4 max-w-md text-sm text-foreground/70 sm:text-base">
                                Every click ripples through the leaderboard in real time. Chat, customize your cursor, and climb the ranks.
                            </p>

                            {/* Stats labels */}
                            <div className="mt-8 flex items-center gap-4 sm:gap-6">
                                <div className="kraft-label px-4 py-3 text-center">
                                    <p className="font-mono text-xl font-bold sm:text-2xl">
                                        {totalClicksLoading ? "..." : totalClicks.toLocaleString()}
                                    </p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Total Clicks</p>
                                </div>
                                <div className="kraft-label px-4 py-3 text-center">
                                    <p className="text-sm font-medium sm:text-base">Live chat & reactions</p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Multiplayer</p>
                                </div>
                            </div>

                            {/* The seal */}
                            <div className="mt-10">
                                <GiveClickButton />
                            </div>
                        </motion.section>

                        {/* Activity labels */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                            className="mx-auto mt-14 grid w-full max-w-6xl gap-5 md:grid-cols-2"
                        >
                            <LatestClicks />
                            <ArenaPulse />
                        </motion.section>

                        {/* Chat label */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
                            className="mx-auto mt-5 w-full max-w-6xl"
                        >
                            <LiveChatPanel />
                        </motion.section>
                    </main>

                    <Footer />
                </div>
            </Cursors>
        </>
    );
}
