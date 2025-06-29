// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Give Me a Dollar",
    description: "A website to give me a dollar",
    icons: {
        icon: [
            {
                url: "/Dollar_Sign.svg",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/Dollar_Sign_White.svg",
                media: "(prefers-color-scheme: dark)",
            },
        ],
    },
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
                        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                        <Analytics />
                        <SpeedInsights />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
