"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Dollars from "@/components/gifts";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { Cursors } from "@instantdb/react";
import { useEffect } from "react";
import Image from "next/image";

export default function HomePage() {
    const { user } = useUser();
    const room = db.room("chat", "main");
    const { data } = db.useQuery({ dollars: {} });
    const dollars: { userId: string; createdAt: number }[] = data?.dollars ?? [];
    const dollarsGiven = user ? dollars.filter((d) => d.userId === user.id).length : 0;

    // Get publishPresence from usePresence
    const { publishPresence } = room.usePresence();

    useEffect(() => {
        if (user) {
            publishPresence({
                name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Anonymous",
                status: "online",
                profileImageUrl: user.imageUrl,
                dollarsGiven,
            });
        }
    }, [user, dollarsGiven, publishPresence]);

    type Presence = {
        name: string;
        status: string;
        profileImageUrl?: string;
        dollarsGiven?: number;
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

        // Calculate opacity based on dollars given (0.2 to 0.8 range)
        const baseOpacity = 0.2;
        const maxOpacity = 0.8;
        const dollarsGiven = presence?.dollarsGiven || 0;
        const opacity = Math.min(baseOpacity + dollarsGiven * 0.1, maxOpacity);

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
                {/* Dollars given (top left, closer to cursor) */}
                {typeof presence?.dollarsGiven === "number" && (
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
                        <DollarIcon size={9} className="mr-0.5" />
                        {presence.dollarsGiven}
                    </div>
                )}
            </div>
        );
    }

    // DollarIcon component for proportional SVG rendering
    function DollarIcon({ size = 10, className = "" }: { size?: number; className?: string }) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 500 500"
                width={size}
                height={size}
                className={className}
                style={{ display: "inline", verticalAlign: "middle" }}
            >
                <path
                    d="m 145,312 c -2,69 31,100 104,102 78,1 113,-34 109,-101 -6,-58 -62,-73 -106,-79 -48,-17 -99,-25 -99,-95 0,-48 32,-79 99,-78 60,0 97,25 96,84"
                    style={{ fill: "none", stroke: "#000", strokeWidth: 40 }}
                />
                <path d="m 250,15 0,470" style={{ stroke: "#000", strokeWidth: 30 }} />
            </svg>
        );
    }

    return (
        <Cursors room={room} className="min-w-full h-100vh" userCursorColor="tomato" renderCursor={renderCursor}>
            <div className="min-h-screen flex flex-col relative">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center w-full relative">
                    <div className="relative bg-background rounded-lg shadow-lg w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 z-30">
                        <Dollars />
                    </div>
                </main>
                <Footer />
            </div>
        </Cursors>
    );
}
