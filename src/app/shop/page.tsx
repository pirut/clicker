"use client";

import { useMemo, useState } from "react";
import { id } from "@instantdb/react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpgradeFilters, type FilterState } from "@/components/upgrade-filters";
import { useEnsureDefaultAvatarItems } from "@/lib/avatar-items";
import { db } from "@/lib/instantdb";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUserClickCount } from "@/lib/use-click-stats";

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

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: "bg-secondary", border: "border-border/50", text: "text-muted-foreground" },
    rare: { bg: "bg-blue-100 dark:bg-blue-500/20", border: "border-blue-400/40 dark:border-blue-400/30", text: "text-blue-700 dark:text-blue-300" },
    epic: { bg: "bg-purple-100 dark:bg-purple-500/20", border: "border-purple-400/40 dark:border-purple-400/30", text: "text-purple-700 dark:text-purple-300" },
    legendary: { bg: "bg-amber-100 dark:bg-amber-500/20", border: "border-amber-400/40 dark:border-amber-400/30", text: "text-amber-700 dark:text-amber-300" },
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
    const { clickCount: totalClicks } = useUserClickCount(user?.id);
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
        avatarItems: { $: { where: { isActive: true }, order: { createdAt: "asc" } } },
        avatarPurchases: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    useEnsureDefaultAvatarItems(data?.avatarItems);

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
            const s = filters.search.toLowerCase();
            items = items.filter((item) =>
                item.label.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s)
            );
        }
        if (filters.categories.length > 0) {
            items = items.filter((item) => item.category && filters.categories.includes(item.category));
        }
        if (filters.rarities.length > 0) {
            items = items.filter((item) => item.rarity && filters.rarities.includes(item.rarity));
        }
        items = items.filter((item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]);
        if (filters.showOwned === true) {
            items = items.filter((item) => ownedSlugs.has(item.slug));
        } else if (filters.showOwned === false) {
            items = items.filter((item) => !ownedSlugs.has(item.slug));
        }

        items.sort((a, b) => {
            let cmp = 0;
            switch (filters.sortBy) {
                case "price": cmp = a.price - b.price; break;
                case "name": cmp = a.label.localeCompare(b.label); break;
                case "rarity": {
                    const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
                    cmp = (order[a.rarity as keyof typeof order] ?? 0) - (order[b.rarity as keyof typeof order] ?? 0);
                    break;
                }
                case "date": cmp = (a.sortOrder ?? 0) - (b.sortOrder ?? 0); break;
            }
            return filters.sortOrder === "asc" ? cmp : -cmp;
        });

        return items;
    }, [avatarItems, selectedCategory, filters, ownedSlugs]);

    const maxPrice = useMemo(() => Math.max(...avatarItems.map((item) => item.price), 500), [avatarItems]);

    const handlePurchase = async (item: AvatarItem) => {
        if (!user?.id || ownedSlugs.has(item.slug) || availableClicks < item.price) return;
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
            setSuccessMessage({ item: item.label, message: `${item.label} unlocked! Head to your Wardrobe to equip it.` });
        } catch (error) {
            console.error(error);
        } finally {
            setPurchaseLoading(null);
        }
    };

    const categoryCount = useMemo(() => {
        const counts: Record<string, number> = { all: avatarItems.length };
        avatarItems.forEach((item) => {
            if (item.category) counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }, [avatarItems]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24 sm:pt-28 pb-8 px-3 sm:px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient">Avatar Shop</h1>
                        <p className="mt-2 text-sm text-foreground/60 max-w-lg mx-auto italic">
                            Spend your clicks on cosmetic upgrades for your cursor
                        </p>
                    </motion.div>

                    {/* Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-6"
                    >
                        <div className="kraft-label p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-5 sm:gap-6">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-0.5">Balance</p>
                                    <p className="text-2xl sm:text-3xl font-bold font-mono">
                                        {availableClicks.toLocaleString()}
                                        <span className="text-sm text-muted-foreground ml-1.5 font-sans">clicks</span>
                                    </p>
                                </div>
                                <div className="w-px h-10 border-l-2 border-dashed border-border/50" />
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-0.5">Owned</p>
                                    <p className="text-xl font-semibold font-mono">{ownedSlugs.size}</p>
                                </div>
                            </div>
                            <Link href="/wardrobe">
                                <Button variant="outline" className="gap-1.5">
                                    <span>👕</span> Wardrobe
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Success */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                                className="mb-5"
                            >
                                <div className="kraft-label p-3.5 border-emerald-400/40 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🎉</span>
                                        <p className="font-medium text-sm text-emerald-700 dark:text-emerald-300">{successMessage.message}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href="/wardrobe">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500">Wardrobe</Button>
                                        </Link>
                                        <Button size="sm" variant="ghost" onClick={() => setSuccessMessage(null)}>Dismiss</Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-5"
                    >
                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1.5 h-auto p-1.5 bg-secondary/50 rounded-xl border border-border/40">
                                {CATEGORIES.map((cat) => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="py-2 px-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:border data-[state=active]:border-border/50 transition-all text-xs"
                                    >
                                        <span className="sm:mr-1.5">{CATEGORY_ICONS[cat]}</span>
                                        <span className="capitalize hidden sm:inline">{cat}</span>
                                        <Badge variant="secondary" className="ml-1 text-[9px]">{categoryCount[cat] || 0}</Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-6"
                    >
                        <UpgradeFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} />
                    </motion.div>

                    {/* Items */}
                    {isLoading && avatarItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="animate-pulse text-muted-foreground text-sm">Loading shop items...</div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                            <p className="text-4xl mb-3">🔍</p>
                            <p className="text-muted-foreground">No items match your filters</p>
                            <Button
                                variant="ghost"
                                className="mt-3"
                                onClick={() => {
                                    setSelectedCategory("all");
                                    setFilters({ search: "", categories: [], rarities: [], priceRange: [0, maxPrice], showOwned: null, sortBy: "price", sortOrder: "asc" });
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
                                transition={{ delay: 0.2 }}
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
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            whileHover={{ y: -3 }}
                                            className={cn(
                                                "kraft-label group relative p-4 transition-shadow duration-200",
                                                owned
                                                    ? "border-emerald-500/40 ring-1 ring-emerald-500/15"
                                                    : cn("hover:shadow-md", rarityStyle.border),
                                                !owned && !canAfford && "opacity-50"
                                            )}
                                        >
                                            <div className="relative">
                                                <div className="flex items-start justify-between mb-2.5">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-base leading-tight mb-1">{item.label}</h3>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <Badge className={cn("text-[10px] capitalize", rarityStyle.bg, rarityStyle.text)}>
                                                                {rarity}
                                                            </Badge>
                                                            {item.category && (
                                                                <span className="text-[10px] text-muted-foreground capitalize">{item.category}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {owned && (
                                                        <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 text-[10px]">
                                                            ✓ Owned
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-xs text-muted-foreground mb-3.5 line-clamp-2">{item.description}</p>

                                                <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold">{item.price}</span>
                                                        <span className="text-xs text-muted-foreground">clicks</span>
                                                    </div>
                                                    {!isSignedIn ? (
                                                        <Button size="sm" variant="outline" disabled className="text-xs">Sign in</Button>
                                                    ) : owned ? (
                                                        <Link href="/wardrobe">
                                                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                                                                <span>👕</span> Equip
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            disabled={!canAfford || purchaseLoading === item.slug}
                                                            onClick={() => handlePurchase(item)}
                                                            className="text-xs"
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

                            <p className="text-center text-muted-foreground text-xs mt-6">
                                Showing {filteredItems.length} of {avatarItems.length} items
                            </p>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
