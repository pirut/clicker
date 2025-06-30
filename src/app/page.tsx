"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { db } from "@/lib/instantdb";
import { Cursors } from "@instantdb/react";

import Image from "next/image";
import GiveClickButton from "@/components/give-click-button";
import LatestClicks from "@/components/latest-clicks";

export default function HomePage() {
    const room = db.room("chat", "main");
    // const { data } = db.useQuery({ clicks: {} });

    // useEffect(() => {
    //     if (user) {
    //         publishPresence({
    //             name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Anonymous",
    //             status: "online",
    //             profileImageUrl: user.imageUrl,
    //             clicksGiven,
    //         });
    //     }
    // }, [user, clicksGiven, publishPresence]);

    type Presence = {
        name: string;
        status: string;
        profileImageUrl?: string;
        clicksGiven?: number;
    };

    // Helper to generate a random color based on user id (so it's stable per user)
    function getRandomColor(userId: string) {
        if (!userId) return "#888";
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 80%, 60%)`;
    }

    function renderCursor({ presence, color }: { presence: Presence; color: string }) {
        // Use random color for others, tomato for self
        const dotColor = presence?.profileImageUrl ? getRandomColor(presence.profileImageUrl) : color;

        // Calculate opacity based on clicks given (0.2 to 0.8 range)
        const baseOpacity = 0.2;
        const maxOpacity = 0.8;
        const clicksGiven = presence?.clicksGiven || 0;
        const opacity = Math.min(baseOpacity + clicksGiven * 0.1, maxOpacity);

        return (
            <div style={{ position: "relative", width: 48, height: 48, pointerEvents: "none", opacity }}>
                {/* Cursor dot with shadow and border */}
                <div
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: dotColor,
                        position: "absolute",
                        left: 14,
                        top: 14,
                        zIndex: 1,
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.12)",
                        border: "2px solid #fff",
                        transition: "background 0.3s",
                    }}
                />
                {/* Profile image (top right, closer to cursor) */}
                {presence?.profileImageUrl && (
                    <Image
                        src={presence.profileImageUrl}
                        alt="profile"
                        width={20}
                        height={20}
                        style={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            borderRadius: 10,
                            border: "2px solid #fff",
                            background: "#fff",
                            zIndex: 1,
                            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.1)",
                            transform: "rotate(-2deg) scale(0.85)",
                        }}
                    />
                )}
                {/* Clicks given (top left, closer to cursor) */}
                {typeof presence?.clicksGiven === "number" && (
                    <div
                        style={{
                            position: "absolute",
                            top: -2,
                            left: -2,
                            background: "linear-gradient(90deg, #fffbe7 60%, #ffe7e7 100%)",
                            color: "#222",
                            borderRadius: 6,
                            padding: "1px 6px",
                            fontSize: 10,
                            fontWeight: 600,
                            zIndex: 1,
                            border: "1px solid #ffe066",
                            fontFamily: "JetBrains Mono, monospace",
                            boxShadow: "0 1px 4px 0 rgba(255,224,102,0.15)",
                            letterSpacing: 0.3,
                            transform: "rotate(-1deg)",
                        }}
                    >
                        {presence.clicksGiven}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Cursors room={room} className="min-w-full h-100vh" userCursorColor="tomato" renderCursor={renderCursor}>
            <div className="min-h-screen flex flex-col relative">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center w-full relative">
                    <div className="relative bg-background rounded-lg shadow-lg w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 z-30">
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <LatestClicks />
                            <h1 className="text-4xl font-bold mb-4">Click the Button!</h1>
                            <p className="text-lg text-muted-foreground mb-8">The more you click, the higher you climb the leaderboard.</p>
                            <GiveClickButton />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </Cursors>
    );
}
