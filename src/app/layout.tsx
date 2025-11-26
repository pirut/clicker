// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import { InstantAuth } from "@/components/instant-auth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Clicker",
        template: "%s | Clicker",
    },
    description: "Compete for the top spot. Every click counts. Join the competitive clicking game and see if you can make it to the leaderboard!",
    keywords: ["clicker", "clicking game", "competitive", "leaderboard", "game", "click counter"],
    authors: [{ name: "Clicker Team" }],
    creator: "Clicker",
    publisher: "Clicker",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    ...(process.env.NEXT_PUBLIC_SITE_URL && {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
    }),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "Clicker",
        title: "Clicker - Compete for the top spot",
        description: "Compete for the top spot. Every click counts. Join the competitive clicking game and see if you can make it to the leaderboard!",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Clicker - Competitive Clicking Game",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Clicker - Compete for the top spot",
        description: "Compete for the top spot. Every click counts. Join the competitive clicking game!",
        images: ["/og-image.png"],
        creator: "@clicker",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: [
            {
                url: "/favicon.svg",
                type: "image/svg+xml",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/favicon-dark.svg",
                type: "image/svg+xml",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/favicon.ico",
                sizes: "any",
            },
        ],
        apple: [
            {
                url: "/apple-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
        shortcut: "/favicon.ico",
    },
    manifest: "/manifest.json",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
    },
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#9a6f3c" },
        { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
                <body className="min-h-screen bg-background font-sans antialiased">
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <InstantAuth />
                        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                        <Analytics />
                        <SpeedInsights />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
