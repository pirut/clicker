"use client";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./ui/navigation-menu";
import { SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ShareButton } from "@/components/share-button";

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior with JavaScript for better Safari compatibility
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Check on mount
        checkScreenSize();

        // Add event listener
        window.addEventListener("resize", checkScreenSize);

        // Cleanup
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const navigationItems = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/faq", label: "FAQ" },
        { href: "/leaderboard", label: "Leaderboard" },
    ];

    return (
        <header className="w-full p-4 flex justify-between items-center relative">
            {/* Desktop Navigation */}
            {!isMobile && (
                <NavigationMenu>
                    <NavigationMenuList>
                        {navigationItems.map((item) => (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink href={item.href}>{item.label}</NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                        <SignedIn>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
                            </NavigationMenuItem>
                        </SignedIn>
                    </NavigationMenuList>
                </NavigationMenu>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            )}

            {/* Right side buttons */}
            <div className="flex gap-4 items-center">
                <SignedOut>
                    <SignUpButton>
                        <Button variant="outline" className="hidden sm:inline-flex">
                            Login
                        </Button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <ShareButton />
                <ModeToggle />
            </div>

            {/* Mobile Navigation Menu */}
            {isMobile && isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navigationItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className="px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                            >
                                {item.label}
                            </a>
                        ))}
                        <SignedIn>
                            <a
                                href="/dashboard"
                                onClick={closeMobileMenu}
                                className="px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                            >
                                Dashboard
                            </a>
                        </SignedIn>
                    </nav>
                </div>
            )}
        </header>
    );
}
