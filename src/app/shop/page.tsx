"use client";

import { useMemo, useState } from "react";
import { id } from "@instantdb/react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpgradeFilters, type FilterState } from "@/components/upgrade-filters";
import { useEnsureDefaultAvatarItems } from "@/lib/avatar-items";
import { db } from "@/lib/instantdb";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type AvatarItem = {
    id: string;
    slug: string;
    label: string;
    description: string;
    price: number;
    type?: string;
    category?: string;
    rarity?: string;
    sortOrder?: number;
    metadata?: { hatSlug?: string; [key: string]: unknown };
};

const EMPTY_LIST: unknown[] = [];

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    common: { bg: "bg-slate-500/20", border: "border-slate-400/40", text: "text-slate-300", glow: "" },
    rare: { bg: "bg-blue-500/20", border: "border-blue-400/50", text: "text-blue-300", glow: "shadow-blue-500/20" },
    epic: { bg: "bg-purple-500/20", border: "border-purple-400/50", text: "text-purple-300", glow: "shadow-purple-500/30" },
    legendary: { bg: "bg-amber-500/20", border: "border-amber-400/50", text: "text-amber-300", glow: "shadow-amber-500/40" },
};

const CATEGORY_ICONS: Record<string, string> = {
    all: "✨",
    hats: "🎩",
    effects: "💫",
    accessories: "🎭",
    colors: "🎨",
    names: "✍️",
};

const CATEGORIES = ["all", "hats", "effects", "accessories", "colors", "names"] as const;

export default function ShopPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<{ item: string; message: string } | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        categories: [],
        rarities: [],
        priceRange: [0, 1000],
        showOwned: null,
        sortBy: "price",
        sortOrder: "asc",
    });

    const { data, isLoading } = db.useQuery({
        clicks: user?.id ? { $: { where: { userId: user.id } } } : {},
        avatarItems: { $: { where: { isActive: true }, order: { createdAt: "asc" } } },
        avatarPurchases: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    useEnsureDefaultAvatarItems(data?.avatarItems);

    const clicks = (data?.clicks ?? EMPTY_LIST) as Array<unknown>;
    const totalClicks = clicks.length;
    const avatarItems = (data?.avatarItems ?? EMPTY_LIST) as AvatarItem[];
    const avatarPurchases = (data?.avatarPurchases ?? EMPTY_LIST) as Array<{ itemSlug: string; amount?: number }>;

    const ownedSlugs = useMemo(() => new Set(avatarPurchases.map((p) => p.itemSlug)), [avatarPurchases]);
    const spentClicks = useMemo(() => avatarPurchases.reduce((sum, p) => sum + (p.amount ?? 0), 0), [avatarPurchases]);
    const availableClicks = Math.max(totalClicks - spentClicks, 0);

    const filteredItems = useMemo(() => {
        let items = [...avatarItems];

        if (selectedCategory !== "all") {
            items = items.filter((item) => item.category === selectedCategory);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            items = items.filter(
                (item) =>
                    item.label.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.categories.length > 0) {
            items = items.filter((item) => item.category && filters.categories.includes(item.category));
        }

        if (filters.rarities.length > 0) {
            items = items.filter((item) => item.rarity && filters.rarities.includes(item.rarity));
        }

        items = items.filter(
            (item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
        );

        if (filters.showOwned === true) {
            items = items.filter((item) => ownedSlugs.has(item.slug));
        } else if (filters.showOwned === false) {
            items = items.filter((item) => !ownedSlugs.has(item.slug));
        }

        items.sort((a, b) => {
            let comparison = 0;
            switch (filters.sortBy) {
                case "price":
                    comparison = a.price - b.price;
                    break;
                case "name":
                    comparison = a.label.localeCompare(b.label);
                    break;
                case "rarity":
                    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
                    comparison =
                        (rarityOrder[a.rarity as keyof typeof rarityOrder] ?? 0) -
                        (rarityOrder[b.rarity as keyof typeof rarityOrder] ?? 0);
                    break;
                case "date":
                    comparison = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
                    break;
            }
            return filters.sortOrder === "asc" ? comparison : -comparison;
        });

        return items;
    }, [avatarItems, selectedCategory, filters, ownedSlugs]);

    const maxPrice = useMemo(
        () => Math.max(...avatarItems.map((item) => item.price), 500),
        [avatarItems]
    );

    const handlePurchase = async (item: AvatarItem) => {
        if (!user?.id) return;
        if (ownedSlugs.has(item.slug)) return;

        if (availableClicks < item.price) return;

        setPurchaseLoading(item.slug);
        setSuccessMessage(null);

        try {
            await db.transact(
                db.tx.avatarPurchases[id()].update({
                    userId: user.id,
                    itemSlug: item.slug,
                    purchasedAt: Date.now(),
                    amount: item.price,
                })
            );
            setSuccessMessage({
                item: item.label,
                message: `${item.label} unlocked! Head to your Wardrobe to equip it.`,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setPurchaseLoading(null);
        }
    };

    const categoryCount = useMemo(() => {
        const counts: Record<string, number> = { all: avatarItems.length };
        avatarItems.forEach((item) => {
            if (item.category) {
                counts[item.category] = (counts[item.category] || 0) + 1;
            }
        });
        return counts;
    }, [avatarItems]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-white/60">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                            Avatar Shop
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
                            Spend your hard-earned clicks on cosmetic upgrades to make your cursor stand out
                        </p>
                    </motion.div>

                    {/* Balance Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="text-center sm:text-left">
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">Available Balance</p>
                                    <p className="text-2xl sm:text-4xl font-bold text-foreground">
                                        {availableClicks.toLocaleString()}
                                        <span className="text-sm sm:text-lg text-muted-foreground ml-1 sm:ml-2">clicks</span>
                                    </p>
                                </div>
                                <div className="w-px h-10 sm:h-12 bg-border" />
                                <div className="text-center">
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">Items Owned</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-foreground">{ownedSlugs.size}</p>
                                    </div>
                                </div>
                            </div>
                            <Link href="/wardrobe" className="w-full sm:w-auto">
                                <Button variant="outline" className="glass-hover gap-2 w-full sm:w-auto">
                                    <span>👕</span>
                                    Open Wardrobe
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Success Message */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="mb-6"
                            >
                                <div className="glass rounded-xl p-3 sm:p-4 border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="text-xl sm:text-2xl">🎉</span>
                                        <div>
                                            <p className="font-semibold text-emerald-300 text-sm sm:text-base">{successMessage.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Link href="/wardrobe" className="flex-1 sm:flex-none">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 w-full sm:w-auto">
                                                Go to Wardrobe
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setSuccessMessage(null)}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Dismiss
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Category Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 h-auto p-1.5 sm:p-2 bg-white/5 rounded-xl">
                                {CATEGORIES.map((cat) => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="py-2 sm:py-3 px-2 sm:px-4 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-foreground dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white transition-all text-xs sm:text-sm"
                                    >
                                        <span className="sm:mr-2">{CATEGORY_ICONS[cat]}</span>
                                        <span className="capitalize hidden sm:inline">{cat}</span>
                                        <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                                            {categoryCount[cat] || 0}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <UpgradeFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} />
                    </motion.div>

                    {/* Items Grid */}
                    {isLoading && avatarItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="animate-pulse text-white/60">Loading shop items...</div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <p className="text-6xl mb-4">🔍</p>
                            <p className="text-muted-foreground text-lg">No items match your filters</p>
                            <Button
                                variant="ghost"
                                className="mt-4"
                                onClick={() => {
                                    setSelectedCategory("all");
                                    setFilters({
                                        search: "",
                                        categories: [],
                                        rarities: [],
                                        priceRange: [0, maxPrice],
                                        showOwned: null,
                                        sortBy: "price",
                                        sortOrder: "asc",
                                    });
                                }}
                            >
                                Clear filters
                            </Button>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            >
                                {filteredItems.map((item, index) => {
                                    const owned = ownedSlugs.has(item.slug);
                                    const canAfford = availableClicks >= item.price;
                                    const rarity = item.rarity || "common";
                                    const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;

                                    return (
                                        <motion.div
                                            key={item.id ?? item.slug}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            className={cn(
                                                "group relative rounded-xl border-2 p-5 transition-all duration-300",
                                                "bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm",
                                                owned
                                                    ? "border-emerald-500/40 bg-emerald-500/5"
                                                    : cn(rarityStyle.border, "hover:shadow-lg", rarityStyle.glow),
                                                !owned && !canAfford && "opacity-50"
                                            )}
                                        >
                                            {/* Rarity glow effect */}
                                            {rarity === "legendary" && !owned && (
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 animate-pulse" />
                                            )}
                                            {rarity === "epic" && !owned && (
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-50" />
                                            )}

                                            <div className="relative">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-foreground text-lg leading-tight mb-1">
                                                            {item.label}
                                                        </h3>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge
                                                                className={cn(
                                                                    "text-xs capitalize font-medium",
                                                                    rarityStyle.bg,
                                                                    rarityStyle.text
                                                                )}
                                                            >
                                                                {rarity}
                                                            </Badge>
                                                            {item.category && (
                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {owned && (
                                                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                                            ✓ Owned
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                    {item.description}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-bold text-foreground">{item.price}</span>
                                                        <span className="text-sm text-muted-foreground">clicks</span>
                                                    </div>
                                                    {!isSignedIn ? (
                                                        <Button size="sm" variant="outline" disabled>
                                                            Sign in to buy
                                                        </Button>
                                                    ) : owned ? (
                                                        <Link href="/wardrobe">
                                                            <Button size="sm" variant="outline" className="gap-1">
                                                                <span>👕</span> Equip
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            disabled={!canAfford || purchaseLoading === item.slug}
                                                            onClick={() => handlePurchase(item)}
                                                            className={cn(
                                                                canAfford && "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500"
                                                            )}
                                                        >
                                                            {purchaseLoading === item.slug
                                                                ? "Buying..."
                                                                : canAfford
                                                                ? "Buy Now"
                                                                : `Need ${item.price - availableClicks}`}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center text-muted-foreground text-sm mt-8"
                            >
                                Showing {filteredItems.length} of {avatarItems.length} items
                            </motion.p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

