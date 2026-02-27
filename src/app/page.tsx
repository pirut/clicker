"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Shirt, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Cursors } from "@instantdb/react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { db } from "@/lib/instantdb";
import GiveClickButton from "@/components/give-click-button";
import LatestClicks from "@/components/latest-clicks";
import { Background } from "@/components/background";
import { PresenceManager } from "@/components/presence-manager";
import { MyAvatarIndicator } from "@/components/my-avatar-indicator";
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
            <MyAvatarIndicator />
            <Cursors room={room} className="min-h-screen w-full" userCursorColor="tomato" renderCursor={renderCursor} zIndex={50}>
                <Background />
                <div className="relative flex min-h-screen flex-col">
                    <Header />
                    <main className="relative z-20 flex flex-1 items-center px-3 pb-8 pt-22 sm:px-4 sm:pt-28 md:px-6 md:pt-30">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: "easeOut" }}
                            className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6"
                        >
                            <section className="glass relative overflow-hidden rounded-[2rem] border border-border/80 px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
                                <div className="absolute -left-16 -top-12 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
                                <div className="absolute -bottom-14 right-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

                                <div className="relative flex h-full flex-col">
                                    <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                        <Zap className="h-3.5 w-3.5" />
                                        Realtime Multiplayer Arena
                                    </div>

                                    <h1 className="font-display text-[clamp(3rem,9vw,6.4rem)] font-semibold leading-[0.9] text-gradient">
                                        CLICKER
                                    </h1>
                                    <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base lg:text-lg">
                                        Every click ripples through the leaderboard in real time. Build your look, race your friends, and own the top slot.
                                    </p>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-border/75 bg-card/65 p-3.5 sm:p-4">
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total Clicks</p>
                                            <p className="mt-1 font-mono text-xl font-bold sm:text-2xl">
                                                {totalClicksLoading ? "..." : totalClicks.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-border/75 bg-card/65 p-3.5 sm:p-4">
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live Cursor</p>
                                            <p className="mt-1 text-sm font-semibold sm:text-base">Tracking enabled on desktop</p>
                                        </div>
                                    </div>

                                    <div className="mt-7">
                                        <GiveClickButton />
                                    </div>

                                    <p className="mt-5 text-xs text-muted-foreground sm:text-sm">
                                        Move your pointer around to preview your avatar cursor live on this screen.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <LatestClicks />

                                <div className="glass rounded-3xl border border-border/80 p-4 sm:p-5">
                                    <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Quick Routes</p>
                                    <div className="grid gap-2.5">
                                        <Link
                                            href="/leaderboard"
                                            className="glass-hover flex items-center justify-between rounded-2xl border border-border/70 bg-card/55 px-3.5 py-3"
                                        >
                                            <span className="inline-flex items-center gap-2 text-sm font-medium sm:text-base">
                                                <Trophy className="h-4 w-4 text-primary" />
                                                Leaderboard
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </Link>
                                        <Link
                                            href="/shop"
                                            className="glass-hover flex items-center justify-between rounded-2xl border border-border/70 bg-card/55 px-3.5 py-3"
                                        >
                                            <span className="inline-flex items-center gap-2 text-sm font-medium sm:text-base">
                                                <Shirt className="h-4 w-4 text-primary" />
                                                Shop & Wardrobe
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    </main>
                    <Footer />
                </div>
            </Cursors>
        </>
    );
}
