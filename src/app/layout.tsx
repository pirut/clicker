import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, IBM_Plex_Mono, Sora } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { InstantAuth } from "@/components/instant-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sora = Sora({
    subsets: ["latin"],
    variable: "--font-brand-sans",
    display: "swap",
});

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-brand-display",
    display: "swap",
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-brand-mono",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Clicker",
        template: "%s | Clicker",
    },
    description: "Compete for the top spot. Every click counts.",
    keywords: ["clicker", "clicking game", "competitive", "leaderboard", "game", "click counter"],
    authors: [{ name: "Clicker Team" }],
    creator: "Clicker",
    publisher: "Clicker",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "Clicker",
        title: "Clicker - Compete for the top spot",
        description: "Compete for the top spot. Every click counts.",
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
        description: "Compete for the top spot. Every click counts.",
        images: ["/og-image.png"],
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
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ead8bf" },
        { media: "(prefers-color-scheme: dark)", color: "#2b2117" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html
                lang="en"
                suppressHydrationWarning
                className={`${sora.variable} ${fraunces.variable} ${plexMono.variable}`}
            >
                <body className="min-h-screen bg-background font-sans antialiased">
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <InstantAuth />
                        <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>}>
                            {children}
                        </Suspense>
                        <Analytics />
                        <SpeedInsights />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
