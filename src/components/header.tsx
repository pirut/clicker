"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import { ShareButton } from "@/components/share-button";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
];

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [isMobileMenuOpen]);

    const linkClass = (href: string) =>
        cn(
            "rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium tracking-wide transition-all",
            pathname === href
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-foreground/70 hover:text-foreground hover:bg-card/50"
        );

    return (
        <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
                scrolled
                    ? "border-b border-border/60 bg-background/95 py-2 shadow-sm"
                    : "bg-transparent py-3 sm:py-4"
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-4">
                <Link href="/" className="group flex items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:rotate-12 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-display text-xl font-bold leading-none tracking-tight text-gradient">CLICKER</span>
                </Link>

                <nav className="hidden items-center gap-1.5 lg:flex">
                    {navigationItems.map((item) => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            {item.label}
                        </Link>
                    ))}
                    <SignedIn>
                        <Link href="/wardrobe" className={linkClass("/wardrobe")}>
                            Wardrobe
                        </Link>
                    </SignedIn>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden items-center gap-2 lg:flex">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="outline" size="sm" className="bg-card">
                                    Sign in
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: { avatarBox: "w-8 h-8 border-2 border-border/50" },
                                }}
                            />
                        </SignedIn>
                        <ShareButton />
                        <ModeToggle />
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <ModeToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen((o) => !o)}
                            className="rounded-full border border-border/50 bg-card p-2.5 text-foreground transition hover:shadow-sm"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-3 mt-2 overflow-hidden rounded-2xl border border-border/50 bg-card p-3 shadow-md lg:hidden"
                    >
                        <nav className="flex flex-col gap-1">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                                        pathname === item.href
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <SignedIn>
                                <Link
                                    href="/wardrobe"
                                    className={cn(
                                        "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                                        pathname === "/wardrobe"
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                                    )}
                                >
                                    Wardrobe
                                </Link>
                            </SignedIn>

                            <div className="mt-2 flex items-center gap-2 border-t border-border/50 pt-3">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button size="sm" className="w-full">
                                            Sign in
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <UserButton
                                        appearance={{
                                            elements: { avatarBox: "w-8 h-8 border-2 border-border/50" },
                                        }}
                                    />
                                    <ShareButton />
                                </SignedIn>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
