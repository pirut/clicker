"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

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
            "text-sm font-medium transition-colors",
            pathname === href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        );

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
                scrolled ? "backdrop-blur-xl bg-background/80 border-border/60 py-2" : "bg-transparent border-transparent py-3 sm:py-4"
            )}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 flex justify-between items-center">
                <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-gradient font-display">
                    CLICKER
                </Link>

                <nav className="hidden lg:flex items-center gap-6">
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
                    <div className="hidden lg:flex items-center gap-2">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="outline" className="glass-hover border-primary/20">
                                    Login
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border-2 border-primary/20",
                                    },
                                }}
                            />
                        </SignedIn>
                        <ShareButton />
                        <ModeToggle />
                    </div>

                    <div className="lg:hidden flex items-center gap-2">
                        <ModeToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen((open) => !open)}
                            className="p-2 rounded-md hover:bg-accent/10 transition-colors"
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
                        className="lg:hidden border-t border-border/50 backdrop-blur-xl bg-background/90 overflow-hidden"
                    >
                        <nav className="flex flex-col p-3 sm:p-4 space-y-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "bg-primary/15 text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <SignedIn>
                                <Link
                                    href="/wardrobe"
                                    className={cn(
                                        "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                        pathname === "/wardrobe"
                                            ? "bg-primary/15 text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                                    )}
                                >
                                    Wardrobe
                                </Link>
                            </SignedIn>

                            <div className="pt-3 border-t border-border/50 mt-2 flex items-center justify-between gap-3">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button size="sm">Login</Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex items-center gap-2">
                                        <UserButton
                                            appearance={{
                                                elements: {
                                                    avatarBox: "w-8 h-8 border-2 border-primary/20",
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
