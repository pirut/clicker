"use client";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./ui/navigation-menu";
import { SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ShareButton } from "@/components/share-button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navigationItems = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/shop", label: "Shop", icon: "🛒" },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? "glass py-2" : "bg-transparent py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-gradient">
                    CLICKER
                </Link>

                {/* Desktop Navigation */}
                {!isMobile && (
                    <NavigationMenu>
                        <NavigationMenuList className="gap-6">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.href}>
                                    <Link href={item.href} legacyBehavior passHref>
                                        <NavigationMenuLink className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                            {(item as { icon?: string }).icon && <span>{(item as { icon?: string }).icon}</span>}
                                            {item.label}
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                            <SignedIn>
                                <NavigationMenuItem>
                                    <Link href="/wardrobe" legacyBehavior passHref>
                                        <NavigationMenuLink className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                            <span>👕</span> Wardrobe
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            </SignedIn>
                        </NavigationMenuList>
                    </NavigationMenu>
                )}

                {/* Right side buttons */}
                <div className="flex gap-3 items-center">
                    <div className="hidden sm:flex gap-2 items-center">
                        <SignedOut>
                            <SignUpButton>
                                <Button variant="outline" className="glass-hover border-primary/20">
                                    Login
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border-2 border-primary/20"
                                    }
                                }}
                            />
                        </SignedIn>
                        <ShareButton />
                        <ModeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md hover:bg-accent/10 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMobile && isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass border-t border-white/10 overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 space-y-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMobileMenu}
                                    className="px-4 py-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    {(item as { icon?: string }).icon && <span>{(item as { icon?: string }).icon}</span>}
                                    {item.label}
                                </Link>
                            ))}
                            <SignedIn>
                                <Link
                                    href="/wardrobe"
                                    onClick={closeMobileMenu}
                                    className="px-4 py-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <span>👕</span> Wardrobe
                                </Link>
                            </SignedIn>
                            <div className="pt-4 flex gap-4 sm:hidden">
                                <SignedOut>
                                    <SignUpButton>
                                        <Button className="w-full">Login</Button>
                                    </SignUpButton>
                                </SignedOut>
                                <SignedIn>
                                    <UserButton />
                                </SignedIn>
                                <ModeToggle />
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
