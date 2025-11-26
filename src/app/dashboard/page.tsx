"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { id } from "@instantdb/react";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import { db } from "@/lib/instantdb";
import { AvatarPreview } from "@/components/avatar-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UpgradeFilters, type FilterState } from "@/components/upgrade-filters";
import { useEnsureDefaultAvatarItems } from "@/lib/avatar-items";
import { cn } from "@/lib/utils";

type DisplayNameUpdates = {
    displayName?: string;
    cursorColor?: string;
    hatSlug?: string | null;
};

type AvatarItem = {
    id: string;
    slug: string;
    label: string;
    description: string;
    price: number;
    category?: string;
    rarity?: string;
    sortOrder?: number;
};

const EMPTY_LIST: unknown[] = [];

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: "bg-gray-500/20", border: "border-gray-500/30", text: "text-gray-300" },
    rare: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-300" },
    epic: { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-300" },
    legendary: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-300" },
};

const CATEGORIES = ["all", "hats", "effects", "accessories", "colors", "names"] as const;

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [savingField, setSavingField] = useState<null | "color" | "name" | "hat">(null);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
        displayNames: user?.id ? { $: { where: { userId: user.id } } } : {},
        avatarItems: { $: { where: { isActive: true }, order: { createdAt: "asc" } } },
        avatarPurchases: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    useEnsureDefaultAvatarItems(data?.avatarItems);

    const defaultDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
    const clicks = (data?.clicks ?? EMPTY_LIST) as Array<unknown>;
    const totalClicks = clicks.length;
    const displayNameRecord = data?.displayNames?.[0];
    const avatarItems = (data?.avatarItems ?? EMPTY_LIST) as AvatarItem[];
    const avatarPurchases = (data?.avatarPurchases ?? EMPTY_LIST) as Array<{ itemSlug: string; amount?: number }>;

    const ownedSlugs = useMemo(() => new Set(avatarPurchases.map((purchase) => purchase.itemSlug)), [avatarPurchases]);
    const spentClicks = useMemo(() => avatarPurchases.reduce((sum, purchase) => sum + (purchase.amount ?? 0), 0), [avatarPurchases]);
    const availableClicks = Math.max(totalClicks - spentClicks, 0);
    const hasColorUpgrade = ownedSlugs.has("color-change");
    const hasNameUpgrade = ownedSlugs.has("name-change");
    const hasHatUpgrade = ownedSlugs.has("fun-hat");

    // Filter and sort items
    const filteredItems = useMemo(() => {
        let items = [...avatarItems];

        // Category filter (from tabs)
        if (selectedCategory !== "all") {
            items = items.filter((item) => item.category === selectedCategory);
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            items = items.filter(
                (item) =>
                    item.label.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower)
            );
        }

        // Category filter (from filter panel)
        if (filters.categories.length > 0) {
            items = items.filter((item) => item.category && filters.categories.includes(item.category));
        }

        // Rarity filter
        if (filters.rarities.length > 0) {
            items = items.filter((item) => item.rarity && filters.rarities.includes(item.rarity));
        }

        // Price range filter
        items = items.filter(
            (item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
        );

        // Owned filter
        if (filters.showOwned === true) {
            items = items.filter((item) => ownedSlugs.has(item.slug));
        } else if (filters.showOwned === false) {
            items = items.filter((item) => !ownedSlugs.has(item.slug));
        }

        // Sort
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

    const [pendingColor, setPendingColor] = useState<string>(displayNameRecord?.cursorColor?.startsWith("#") ? displayNameRecord.cursorColor : "#ff6b6b");
    const [pendingName, setPendingName] = useState<string>(displayNameRecord?.displayName ?? defaultDisplayName);

    useEffect(() => {
        if (displayNameRecord?.cursorColor?.startsWith("#")) {
            setPendingColor(displayNameRecord.cursorColor);
        }
    }, [displayNameRecord?.cursorColor]);

    useEffect(() => {
        setPendingName(displayNameRecord?.displayName ?? defaultDisplayName);
    }, [displayNameRecord?.displayName, defaultDisplayName]);

    const displayNameIdRef = useRef<string | null>(displayNameRecord?.id ?? null);

    useEffect(() => {
        if (displayNameRecord?.id) {
            displayNameIdRef.current = displayNameRecord.id;
        }
    }, [displayNameRecord?.id]);

    const getItemBySlug = (slug: string) => avatarItems.find((item) => item.slug === slug);

    const buildPayload = (updates: DisplayNameUpdates) => {
        const payload: Record<string, unknown> = {
            userId: user?.id,
            updatedAt: Date.now(),
        };

        if (!displayNameRecord && updates.displayName === undefined) {
            payload.displayName = defaultDisplayName;
        }

        if (updates.displayName !== undefined) {
            payload.displayName = updates.displayName;
        }

        if (updates.cursorColor !== undefined) {
            payload.cursorColor = updates.cursorColor;
        }

        if (updates.hatSlug !== undefined) {
            payload.hatSlug = updates.hatSlug;
        }

        return payload;
    };

    const applyCustomization = async (slug: string, updates: DisplayNameUpdates, field: "color" | "name" | "hat", successMessage: string) => {
        if (!user?.id) return;
        const item = getItemBySlug(slug);
        if (!item) {
            setStatusMessage("Upgrade not available yet.");
            return;
        }

        if (availableClicks < item.price) {
            setStatusMessage(`You need ${item.price - availableClicks} more clicks to ${successMessage.toLowerCase()}.`);
            return;
        }

        let targetId = displayNameRecord?.id || displayNameIdRef.current;
        if (!targetId) {
            targetId = id();
            displayNameIdRef.current = targetId;
        }

        const payload = buildPayload(updates);
        setSavingField(field);
        setPurchaseLoading(slug);
        setStatusMessage(null);

        try {
            await db.transact([
                db.tx.avatarPurchases[id()].update({
                    userId: user.id,
                    itemSlug: slug,
                    purchasedAt: Date.now(),
                    amount: item.price,
                }),
                db.tx.displayNames[targetId].update(payload),
            ]);
            setStatusMessage(successMessage);
        } catch (error) {
            console.error(error);
            setStatusMessage("Unable to update avatar right now.");
        } finally {
            setSavingField(null);
            setPurchaseLoading(null);
        }
    };

    const handlePurchase = async (item: AvatarItem) => {
        if (!user?.id) return;
        if (ownedSlugs.has(item.slug)) {
            setStatusMessage(`${item.label} is already unlocked.`);
            return;
        }

        if (availableClicks < item.price) {
            setStatusMessage(`You need ${item.price - availableClicks} more clicks to unlock ${item.label}.`);
            return;
        }

        setPurchaseLoading(item.slug);
        setStatusMessage(null);

        try {
            let targetId = displayNameRecord?.id || displayNameIdRef.current;
            if (!targetId) {
                targetId = id();
                displayNameIdRef.current = targetId;
            }

            // For hat/accessory items, apply them immediately after purchase
            const updates: DisplayNameUpdates = {};
            if ((item.type === "hat" || item.type === "accessory") && item.slug) {
                // Check if item has hatSlug in metadata or use slug directly
                const hatSlug = (item as any).metadata?.hatSlug || item.slug;
                updates.hatSlug = hatSlug;
            }

            const payload = buildPayload(updates);
            const transactions = [
                db.tx.avatarPurchases[id()].update({
                    userId: user.id,
                    itemSlug: item.slug,
                    purchasedAt: Date.now(),
                    amount: item.price,
                }),
            ];

            // Only update displayName if we have hat/accessory to apply
            if (Object.keys(updates).length > 0) {
                transactions.push(db.tx.displayNames[targetId].update(payload));
            }

            await db.transact(transactions);
            setStatusMessage(`Unlocked ${item.label}!${updates.hatSlug ? " Applied to your avatar." : ""}`);
        } catch (error) {
            console.error(error);
            setStatusMessage("Unable to complete purchase. Please try again.");
        } finally {
            setPurchaseLoading(null);
        }
    };

    const colorPrice = getItemBySlug("color-change")?.price ?? 25;
    const namePrice = getItemBySlug("name-change")?.price ?? 15;
    const hatPrice = getItemBySlug("fun-hat")?.price ?? 40;

    const scrollToShop = () => {
        const el = document.getElementById("avatar-shop");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (!isLoaded || !isSignedIn || !user) {
        return <div className="min-h-screen flex items-center justify-center text-white/80">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 px-4 py-10 lg:py-14">
                <div className="max-w-5xl mx-auto space-y-8">
                    <Card className="border-white/10 bg-black/40 backdrop-blur">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-2xl font-semibold">Cursor Lab</CardTitle>
                            <CardDescription>Track your click economy and keep your avatar fresh.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                                <AvatarPreview
                                    size={130}
                                    cursorColor={displayNameRecord?.cursorColor}
                                    fallbackSeed={displayNameRecord?.displayName ?? defaultDisplayName}
                                    profileImageUrl={user.imageUrl ?? undefined}
                                    clicksGiven={totalClicks}
                                    hatSlug={displayNameRecord?.hatSlug ?? undefined}
                                    name={displayNameRecord?.displayName ?? defaultDisplayName}
                                    showNameTag
                                />
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                            <p className="text-xs uppercase tracking-wide text-white/60">Available</p>
                                            <p className="text-2xl font-semibold text-white">{availableClicks}</p>
                                            <p className="text-[11px] text-white/50">of {totalClicks} clicks</p>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                            <p className="text-xs uppercase tracking-wide text-white/60">Spent</p>
                                            <p className="text-2xl font-semibold text-white">{spentClicks}</p>
                                            <p className="text-[11px] text-white/50">on avatar tweaks</p>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                            <p className="text-xs uppercase tracking-wide text-white/60">Unlocks</p>
                                            <p className="text-2xl font-semibold text-white">{ownedSlugs.size}</p>
                                            <p className="text-[11px] text-white/50">perks owned</p>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Account</p>
                                        <p className="text-sm text-white">{user.emailAddresses[0]?.emailAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_minmax(0,0.9fr)]">
                        <Card className="border-white/10 bg-black/30 backdrop-blur">
                            <CardHeader>
                                <CardTitle>Customize</CardTitle>
                                <CardDescription>Use unlocked upgrades to personalize your avatar.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white">Cursor color</Label>
                                        {!hasColorUpgrade && (
                                            <Button variant="ghost" className="text-xs text-white/70" onClick={scrollToShop}>
                                                Unlock in shop
                                            </Button>
                                        )}
                                    </div>
                                    {hasColorUpgrade ? (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <input
                                                type="color"
                                                value={pendingColor}
                                                onChange={(event) => setPendingColor(event.target.value)}
                                                className="h-10 rounded border border-white/20 bg-transparent"
                                            />
                                            <Button
                                                disabled={savingField === "color" || purchaseLoading === "color-change"}
                                                onClick={() => applyCustomization("color-change", { cursorColor: pendingColor }, "color", "Color updated!")}
                                            >
                                                {savingField === "color" ? "Saving..." : `Apply color (costs ${colorPrice})`}
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/60">Purchase the Cursor Color Lab to unlock this control.</p>
                                    )}
                                </section>

                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white">Display name</Label>
                                        {!hasNameUpgrade && (
                                            <Button variant="ghost" className="text-xs text-white/70" onClick={scrollToShop}>
                                                Unlock in shop
                                            </Button>
                                        )}
                                    </div>
                                    {hasNameUpgrade ? (
                                        <div className="flex flex-col gap-3">
                                            <Input value={pendingName} onChange={(event) => setPendingName(event.target.value.slice(0, 30))} maxLength={30} />
                                            <Button
                                                disabled={savingField === "name" || purchaseLoading === "name-change"}
                                                onClick={() =>
                                                    applyCustomization(
                                                        "name-change",
                                                        { displayName: pendingName.trim() || defaultDisplayName },
                                                        "name",
                                                        "Display name saved!"
                                                    )
                                                }
                                            >
                                                {savingField === "name" ? "Saving..." : `Save name (costs ${namePrice})`}
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/60">Purchase Stage Name to customize what other players see.</p>
                                    )}
                                </section>

                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white">Fun hat</Label>
                                        {!hasHatUpgrade && (
                                            <Button variant="ghost" className="text-xs text-white/70" onClick={scrollToShop}>
                                                Unlock in shop
                                            </Button>
                                        )}
                                    </div>
                                    {hasHatUpgrade ? (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="text-sm text-white/80">
                                                {displayNameRecord?.hatSlug === "fun-hat"
                                                    ? "Your cursor is rocking the fun hat."
                                                    : "Ready to try on a fancy hat?"}
                                            </div>
                                            <Button
                                                variant={displayNameRecord?.hatSlug === "fun-hat" ? "secondary" : "default"}
                                                disabled={savingField === "hat" || purchaseLoading === "fun-hat"}
                                                onClick={() =>
                                                    applyCustomization(
                                                        "fun-hat",
                                                        { hatSlug: displayNameRecord?.hatSlug === "fun-hat" ? null : "fun-hat" },
                                                        "hat",
                                                        displayNameRecord?.hatSlug === "fun-hat" ? "Hat removed!" : "Hat applied!"
                                                    )
                                                }
                                            >
                                                {savingField === "hat"
                                                    ? "Updating..."
                                                    : displayNameRecord?.hatSlug === "fun-hat"
                                                    ? `Remove hat (costs ${hatPrice})`
                                                    : `Wear hat (costs ${hatPrice})`}
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/60">Buy the Fun Hat to add flair to your live cursor.</p>
                                    )}
                                </section>
                                {statusMessage && (
                                    <div className="rounded-xl border border-amber-400/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                                        {statusMessage}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card id="avatar-shop" className="border-white/10 bg-black/30 backdrop-blur">
                            <CardHeader>
                                <CardTitle>Avatar Shop</CardTitle>
                                <CardDescription>Spend clicks to unlock new personalization perks.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <TabsList className="grid w-full grid-cols-6">
                                        {CATEGORIES.map((cat) => (
                                            <TabsTrigger key={cat} value={cat} className="capitalize">
                                                {cat === "all" ? "All" : cat}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>

                                <UpgradeFilters filters={filters} onFiltersChange={setFilters} maxPrice={maxPrice} />

                                {isLoading && avatarItems.length === 0 && (
                                    <p className="text-sm text-white/60">Loading shop items...</p>
                                )}

                                {filteredItems.length === 0 && !isLoading && (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-white/60 mb-2">No items found.</p>
                                        <p className="text-xs text-white/40">Try adjusting your filters.</p>
                                    </div>
                                )}

                                {filteredItems.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredItems.map((item) => {
                                            const owned = ownedSlugs.has(item.slug);
                                            const canAfford = availableClicks >= item.price;
                                            const rarity = item.rarity || "common";
                                            const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;

                                            return (
                                                <div
                                                    key={item.id ?? item.slug}
                                                    className={cn(
                                                        "rounded-lg border p-4 flex flex-col gap-3 transition-all hover:scale-[1.02]",
                                                        owned
                                                            ? "border-green-500/30 bg-green-500/5"
                                                            : canAfford
                                                            ? cn("border-white/20 bg-white/5", rarityStyle.border)
                                                            : "border-white/10 bg-white/5 opacity-60"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <h4 className="text-white font-semibold">{item.label}</h4>
                                                                {item.rarity && (
                                                                    <Badge
                                                                        className={cn(
                                                                            "text-xs capitalize",
                                                                            rarityStyle.bg,
                                                                            rarityStyle.border,
                                                                            rarityStyle.text
                                                                        )}
                                                                    >
                                                                        {item.rarity}
                                                                    </Badge>
                                                                )}
                                                                {item.category && (
                                                                    <Badge variant="outline" className="text-xs capitalize">
                                                                        {item.category}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-white/70">{item.description}</p>
                                                        </div>
                                                        {owned && (
                                                            <Badge variant="secondary" className="shrink-0">
                                                                Owned
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-white">{item.price}</span>
                                                            <span className="text-xs text-white/50">clicks</span>
                                                        </div>
                                                        <Button
                                                            variant={owned ? "outline" : "default"}
                                                            size="sm"
                                                            disabled={owned || (!canAfford && !owned) || purchaseLoading === item.slug}
                                                            onClick={() => handlePurchase(item)}
                                                        >
                                                            {owned
                                                                ? "Unlocked"
                                                                : purchaseLoading === item.slug
                                                                ? "Processing..."
                                                                : canAfford
                                                                ? "Unlock"
                                                                : `Need ${item.price - availableClicks}`}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {filteredItems.length > 0 && (
                                    <p className="text-xs text-white/40 text-center">
                                        Showing {filteredItems.length} of {avatarItems.length} items
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
