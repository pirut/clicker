"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { db } from "@/lib/instantdb";
import { Cursors } from "@instantdb/react";

import GiveClickButton from "@/components/give-click-button";
import LatestClicks from "@/components/latest-clicks";
import { Background } from "@/components/background";
import { PresenceManager } from "@/components/presence-manager";
import { motion } from "framer-motion";
import { AvatarPreview } from "@/components/avatar-preview";

export default function HomePage() {
    const room = db.room("chat", "main");

    type Presence = {
        name: string;
        status: string;
        profileImageUrl?: string;
        clicksGiven?: number;
        cursorColor?: string;
        hatSlug?: string;
    };

    function renderCursor({ presence, color }: { presence: Presence; color: string }) {
        const fallbackSeed = presence?.profileImageUrl || presence?.name || "clicker";

        // Calculate opacity based on clicks given (0.2 to 0.8 range)
        const baseOpacity = 0.2;
        const maxOpacity = 0.8;
        const clicksGiven = presence?.clicksGiven || 0;
        const opacity = Math.min(baseOpacity + clicksGiven * 0.1, maxOpacity);

        return (
            <AvatarPreview
                cursorColor={presence?.cursorColor}
                fallbackSeed={fallbackSeed}
                fallbackColor={color}
                profileImageUrl={presence?.profileImageUrl}
                clicksGiven={presence?.clicksGiven}
                hatSlug={presence?.hatSlug}
                name={presence?.name}
                className="pointer-events-none"
                style={{ opacity }}
            />
        );
    }

    return (
        <>
            <PresenceManager />
            <Cursors room={room} className="min-w-full h-100vh" userCursorColor="tomato" renderCursor={renderCursor}>
                <Background />
                <div className="min-h-screen flex flex-col relative">
                    <Header />
                    <main className="flex-1 flex flex-col items-center justify-center w-full relative p-4 pt-24">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full max-w-4xl mx-auto z-30 flex flex-col md:flex-row gap-12 items-center justify-center"
                    >
                        <div className="flex flex-col items-center text-center space-y-8 flex-1">
                            <div className="space-y-2">
                                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-2xl">
                                    CLICKER
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-xs mx-auto">
                                    Compete for the top spot. Every click counts.
                                </p>
                            </div>
                            <GiveClickButton />
                        </div>

                        <div className="w-full max-w-md flex-1">
                            <LatestClicks />
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        </Cursors>
        </>
    );
}
