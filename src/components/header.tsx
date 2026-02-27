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
    { href: "/about", label: "About" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/shop", label: "Shop" },
];

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    const linkClassName = (href: string) =>
        cn(
            "rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium tracking-wide transition-all",
            pathname === href
                ? "border-primary/35 bg-primary/18 text-foreground shadow-[0_8px_20px_-12px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/60 hover:text-foreground"
        );

    return (
        <motion.header
            initial={{ y: -70, opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
                "fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300",
                scrolled
                    ? "border-border/70 bg-background/72 py-2 backdrop-blur-2xl shadow-[0_18px_40px_-30px_rgb(55_38_20_/_0.42)]"
                    : "border-transparent bg-transparent py-3 sm:py-4"
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-4">
                <Link href="/" className="group flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary transition-transform duration-300 group-hover:rotate-12">
                        <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="font-display text-2xl leading-none tracking-tight text-gradient">CLICKER</span>
                </Link>

                <nav className="hidden items-center gap-2 lg:flex">
                    {navigationItems.map((item) => (
                        <Link key={item.href} href={item.href} className={linkClassName(item.href)}>
                            {item.label}
                        </Link>
                    ))}
                    <SignedIn>
                        <Link href="/wardrobe" className={linkClassName("/wardrobe")}>
                            Wardrobe
                        </Link>
                    </SignedIn>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden items-center gap-2 lg:flex">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="outline" className="glass-hover border-primary/30 bg-card/70">
                                    Login
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border-2 border-primary/35",
                                    },
                                }}
                            />
                        </SignedIn>
                        <ShareButton buttonClassName="border-primary/30 bg-card/70" />
                        <ModeToggle />
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <ModeToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen((open) => !open)}
                            className="rounded-full border border-border/70 bg-card/65 p-2.5 text-foreground transition hover:border-primary/40"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle mobile menu"
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
                        className="mx-3 mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card/90 px-3 pb-3 pt-2 backdrop-blur-2xl lg:hidden"
                    >
                        <nav className="flex flex-col gap-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                                        pathname === item.href
                                            ? "border-primary/35 bg-primary/16 text-foreground"
                                            : "border-transparent text-muted-foreground hover:border-border/65 hover:bg-muted/40 hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <SignedIn>
                                <Link
                                    href="/wardrobe"
                                    className={cn(
                                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                                        pathname === "/wardrobe"
                                            ? "border-primary/35 bg-primary/16 text-foreground"
                                            : "border-transparent text-muted-foreground hover:border-border/65 hover:bg-muted/40 hover:text-foreground"
                                    )}
                                >
                                    Wardrobe
                                </Link>
                            </SignedIn>

                            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button size="sm" className="w-full">
                                            Login
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex items-center gap-2">
                                        <UserButton
                                            appearance={{
                                                elements: {
                                                    avatarBox: "w-8 h-8 border-2 border-primary/35",
                                                },
                                            }}
                                        />
                                        <ShareButton buttonClassName="h-9" />
                                    </div>
                                </SignedIn>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
