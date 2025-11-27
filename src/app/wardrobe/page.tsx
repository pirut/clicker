"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { id } from "@instantdb/react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { AvatarPreview } from "@/components/avatar-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/instantdb";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type DisplayNameUpdates = {
    displayName?: string;
    cursorColor?: string;
    hatSlug?: string | null;
    accessorySlug?: string | null;
    effectSlug?: string | null;
};

type AvatarItem = {
    id: string;
    slug: string;
    label: string;
    description: string;
    price: number;
    type?: string;
    category?: string;
    rarity?: string;
    metadata?: { hatSlug?: string; [key: string]: unknown };
};

const EMPTY_LIST: unknown[] = [];

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: "bg-slate-500/20", border: "border-slate-400/40", text: "text-slate-300" },
    rare: { bg: "bg-blue-500/20", border: "border-blue-400/50", text: "text-blue-300" },
    epic: { bg: "bg-purple-500/20", border: "border-purple-400/50", text: "text-purple-300" },
    legendary: { bg: "bg-amber-500/20", border: "border-amber-400/50", text: "text-amber-300" },
};

export default function WardrobePage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
    const [savingField, setSavingField] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<"appearance" | "hats" | "accessories" | "effects">("appearance");

    const { data } = db.useQuery({
        clicks: user?.id ? { $: { where: { userId: user.id } } } : {},
        displayNames: user?.id ? { $: { where: { userId: user.id } } } : {},
        avatarItems: { $: { where: { isActive: true }, order: { createdAt: "asc" } } },
        avatarPurchases: user?.id ? { $: { where: { userId: user.id } } } : {},
    });

    const defaultDisplayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Anonymous";
    const clicks = (data?.clicks ?? EMPTY_LIST) as Array<unknown>;
    const totalClicks = clicks.length;
    const displayNameRecord = data?.displayNames?.[0];
    const avatarItems = (data?.avatarItems ?? EMPTY_LIST) as AvatarItem[];
    const avatarPurchases = (data?.avatarPurchases ?? EMPTY_LIST) as Array<{ itemSlug: string; amount?: number }>;

    const ownedSlugs = useMemo(() => new Set(avatarPurchases.map((p) => p.itemSlug)), [avatarPurchases]);
    const spentClicks = useMemo(() => avatarPurchases.reduce((sum, p) => sum + (p.amount ?? 0), 0), [avatarPurchases]);
    const availableClicks = Math.max(totalClicks - spentClicks, 0);

    // Owned items grouped by category
    const ownedItems = useMemo(() => {
        return avatarItems.filter((item) => ownedSlugs.has(item.slug));
    }, [avatarItems, ownedSlugs]);

    const ownedHats = useMemo(() => ownedItems.filter((i) => i.type === "hat"), [ownedItems]);
    const ownedAccessories = useMemo(() => ownedItems.filter((i) => i.type === "accessory"), [ownedItems]);
    const ownedEffects = useMemo(() => ownedItems.filter((i) => i.type === "effect"), [ownedItems]);
    const hasColorUpgrade = ownedSlugs.has("color-change");
    const hasNameUpgrade = ownedSlugs.has("name-change");

    const [pendingColor, setPendingColor] = useState<string>("#ff6b6b");
    const [pendingName, setPendingName] = useState<string>("");

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

        if (updates.displayName !== undefined) payload.displayName = updates.displayName;
        if (updates.cursorColor !== undefined) payload.cursorColor = updates.cursorColor;
        if (updates.hatSlug !== undefined) payload.hatSlug = updates.hatSlug;
        if (updates.accessorySlug !== undefined) payload.accessorySlug = updates.accessorySlug;
        if (updates.effectSlug !== undefined) payload.effectSlug = updates.effectSlug;

        return payload;
    };

    const applyChange = async (slug: string, updates: DisplayNameUpdates, fieldName: string) => {
        if (!user?.id) return;
        const item = getItemBySlug(slug);
        if (!item) {
            setStatusMessage({ type: "error", text: "Item not found." });
            return;
        }

        if (availableClicks < item.price) {
            setStatusMessage({ type: "error", text: `Need ${item.price - availableClicks} more clicks.` });
            return;
        }

        let targetId = displayNameRecord?.id || displayNameIdRef.current;
        if (!targetId) {
            targetId = id();
            displayNameIdRef.current = targetId;
        }

        const payload = buildPayload(updates);
        setSavingField(fieldName);
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
            setStatusMessage({ type: "success", text: "Changes saved!" });
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: "error", text: "Failed to save changes." });
        } finally {
            setSavingField(null);
        }
    };

    const equipItem = async (slotType: "hat" | "accessory" | "effect", slug: string | null) => {
        if (!user?.id) return;

        let targetId = displayNameRecord?.id || displayNameIdRef.current;
        if (!targetId) {
            targetId = id();
            displayNameIdRef.current = targetId;
        }

        setSavingField(slotType);
        setStatusMessage(null);

        const updatePayload: Record<string, unknown> = {
            userId: user.id,
            updatedAt: Date.now(),
        };

        if (slotType === "hat") updatePayload.hatSlug = slug;
        if (slotType === "accessory") updatePayload.accessorySlug = slug;
        if (slotType === "effect") updatePayload.effectSlug = slug;

        try {
            await db.transact(db.tx.displayNames[targetId].update(updatePayload));
            setStatusMessage({ type: "success", text: slug ? "Equipped!" : "Unequipped!" });
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: "error", text: "Failed to update." });
        } finally {
            setSavingField(null);
        }
    };

    const colorPrice = getItemBySlug("color-change")?.price ?? 25;
    const namePrice = getItemBySlug("name-change")?.price ?? 15;

    if (!isLoaded || !isSignedIn || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-white/60">Loading...</div>
            </div>
        );
    }

    const currentHatSlug = displayNameRecord?.hatSlug;
    const currentAccessorySlug = (displayNameRecord as { accessorySlug?: string } | undefined)?.accessorySlug;
    const currentEffectSlug = (displayNameRecord as { effectSlug?: string } | undefined)?.effectSlug;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6 sm:mb-10"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                            Your Wardrobe
                        </h1>
                        <p className="text-white/60 text-sm sm:text-base md:text-lg px-2">
                            Customize your avatar with your unlocked items
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-[320px_1fr] xl:grid-cols-[400px_1fr] gap-6 lg:gap-8">
                        {/* Avatar Preview Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:sticky lg:top-24 lg:self-start"
                        >
                            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center">
                                <h2 className="text-xs sm:text-sm uppercase tracking-wider text-white/50 mb-4 sm:mb-6">Preview</h2>
                                <div className="flex justify-center mb-4 sm:mb-6">
                                    <AvatarPreview
                                        size={140}
                                        cursorColor={displayNameRecord?.cursorColor}
                                        fallbackSeed={displayNameRecord?.displayName ?? defaultDisplayName}
                                        profileImageUrl={user.imageUrl ?? undefined}
                                        clicksGiven={totalClicks}
                                        hatSlug={currentHatSlug ?? undefined}
                                        accessorySlug={currentAccessorySlug ?? undefined}
                                        effectSlug={currentEffectSlug ?? undefined}
                                        name={displayNameRecord?.displayName ?? defaultDisplayName}
                                        showNameTag
                                        className="sm:scale-110 lg:scale-125 origin-center"
                                    />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="rounded-lg sm:rounded-xl bg-white/5 p-2 sm:p-3">
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{availableClicks}</p>
                                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-white/40">Available</p>
                                    </div>
                                    <div className="rounded-lg sm:rounded-xl bg-white/5 p-2 sm:p-3">
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{spentClicks}</p>
                                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-white/40">Spent</p>
                                    </div>
                                    <div className="rounded-lg sm:rounded-xl bg-white/5 p-2 sm:p-3">
                                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{ownedItems.length}</p>
                                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-white/40">Owned</p>
                                    </div>
                                </div>

                                <Link href="/shop">
                                    <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 gap-2 text-sm sm:text-base">
                                        <span>🛒</span>
                                        Visit Shop
                                    </Button>
                                </Link>
                            </div>

                            {/* Status Message */}
                            <AnimatePresence>
                                {statusMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className={cn(
                                            "mt-4 rounded-xl p-4 text-sm",
                                            statusMessage.type === "success" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                                            statusMessage.type === "error" && "bg-red-500/20 text-red-300 border border-red-500/30",
                                            statusMessage.type === "info" && "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        )}
                                    >
                                        {statusMessage.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Customization Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Tab Navigation */}
                            <div className="flex gap-1 sm:gap-2 p-1 bg-white/5 rounded-xl overflow-x-auto">
                                {[
                                    { id: "appearance", label: "Appearance", icon: "🎨" },
                                    { id: "hats", label: "Hats", icon: "🎩", count: ownedHats.length },
                                    { id: "accessories", label: "Accessories", icon: "🎭", count: ownedAccessories.length },
                                    { id: "effects", label: "Effects", icon: "✨", count: ownedEffects.length },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                                        className={cn(
                                            "flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 min-w-0",
                                            selectedTab === tab.id
                                                ? "bg-white/10 text-white"
                                                : "text-white/50 hover:text-white/70"
                                        )}
                                    >
                                        <span className="text-sm sm:text-base">{tab.icon}</span>
                                        <span className="hidden sm:inline text-sm">{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs">{tab.count}</Badge>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Appearance Tab */}
                            {selectedTab === "appearance" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 sm:space-y-6"
                                >
                                    {/* Cursor Color */}
                                    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                                            <div>
                                                <h3 className="font-semibold text-white text-base sm:text-lg">Cursor Color</h3>
                                                <p className="text-xs sm:text-sm text-white/50">Change your cursor color</p>
                                            </div>
                                            {!hasColorUpgrade && (
                                                <Link href="/shop">
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-white/10 text-xs">
                                                        🔒 Unlock in Shop
                                                    </Badge>
                                                </Link>
                                            )}
                                        </div>
                                        {hasColorUpgrade ? (
                                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={pendingColor}
                                                        onChange={(e) => setPendingColor(e.target.value)}
                                                        className="w-full sm:w-20 h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-white/20 bg-transparent cursor-pointer"
                                                    />
                                                </div>
                                                <Button
                                                    disabled={savingField === "color"}
                                                    onClick={() => applyChange("color-change", { cursorColor: pendingColor }, "color")}
                                                    className="flex-1 sm:flex-none text-sm"
                                                >
                                                    {savingField === "color" ? "Saving..." : `Apply (${colorPrice} clicks)`}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-white/40 text-xs sm:text-sm">Purchase Cursor Color Lab from the shop to unlock custom colors.</p>
                                        )}
                                    </div>

                                    {/* Display Name */}
                                    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                                            <div>
                                                <h3 className="font-semibold text-white text-base sm:text-lg">Display Name</h3>
                                                <p className="text-xs sm:text-sm text-white/50">What others see above your cursor</p>
                                            </div>
                                            {!hasNameUpgrade && (
                                                <Link href="/shop">
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-white/10 text-xs">
                                                        🔒 Unlock in Shop
                                                    </Badge>
                                                </Link>
                                            )}
                                        </div>
                                        {hasNameUpgrade ? (
                                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                <Input
                                                    value={pendingName}
                                                    onChange={(e) => setPendingName(e.target.value.slice(0, 30))}
                                                    maxLength={30}
                                                    placeholder="Enter your display name"
                                                    className="flex-1 bg-white/5 border-white/10 text-sm"
                                                />
                                                <Button
                                                    disabled={savingField === "name"}
                                                    onClick={() =>
                                                        applyChange(
                                                            "name-change",
                                                            { displayName: pendingName.trim() || defaultDisplayName },
                                                            "name"
                                                        )
                                                    }
                                                    className="text-sm"
                                                >
                                                    {savingField === "name" ? "Saving..." : `Save (${namePrice} clicks)`}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-white/40 text-xs sm:text-sm">Purchase Stage Name from the shop to customize your name.</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Hats Tab */}
                            {selectedTab === "hats" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {ownedHats.length === 0 ? (
                                        <div className="glass rounded-2xl p-12 text-center">
                                            <p className="text-5xl mb-4">🎩</p>
                                            <h3 className="text-xl font-semibold text-white mb-2">No Hats Yet</h3>
                                            <p className="text-white/50 mb-6">Visit the shop to buy some stylish headwear!</p>
                                            <Link href="/shop">
                                                <Button>Browse Hats</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {/* None option */}
                                            <button
                                                onClick={() => equipItem("hat", null)}
                                                disabled={savingField === "hat"}
                                                className={cn(
                                                    "rounded-xl p-4 border-2 transition-all text-center",
                                                    !currentHatSlug
                                                        ? "border-emerald-500/50 bg-emerald-500/10"
                                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                                )}
                                            >
                                                <div className="text-4xl mb-2">❌</div>
                                                <p className="font-medium text-white">None</p>
                                                <p className="text-xs text-white/40">No hat</p>
                                            </button>

                                            {ownedHats.map((item) => {
                                                const hatSlug = item.metadata?.hatSlug || item.slug;
                                                const isEquipped = currentHatSlug === hatSlug;
                                                const rarity = item.rarity || "common";
                                                const rarityStyle = RARITY_COLORS[rarity];

                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => equipItem("hat", hatSlug)}
                                                        disabled={savingField === "hat"}
                                                        className={cn(
                                                            "rounded-xl p-4 border-2 transition-all text-center",
                                                            isEquipped
                                                                ? "border-emerald-500/50 bg-emerald-500/10"
                                                                : cn("hover:border-white/30", rarityStyle.border, "bg-white/5")
                                                        )}
                                                    >
                                                        <div className="text-4xl mb-2">
                                                            {item.label.includes("Crown") ? "👑" :
                                                             item.label.includes("Wizard") ? "🧙" :
                                                             item.label.includes("Party") ? "🥳" :
                                                             item.label.includes("Cowboy") ? "🤠" :
                                                             item.label.includes("Cap") ? "🧢" :
                                                             item.label.includes("Beanie") ? "🧶" :
                                                             item.label.includes("Helmet") ? "⛑️" :
                                                             item.label.includes("Beret") ? "🎨" :
                                                             item.label.includes("Santa") ? "🎅" :
                                                             "🎩"}
                                                        </div>
                                                        <p className="font-medium text-white text-sm">{item.label}</p>
                                                        <Badge className={cn("text-xs mt-1", rarityStyle.bg, rarityStyle.text)}>
                                                            {rarity}
                                                        </Badge>
                                                        {isEquipped && (
                                                            <p className="text-xs text-emerald-400 mt-2">✓ Equipped</p>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Accessories Tab */}
                            {selectedTab === "accessories" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {ownedAccessories.length === 0 ? (
                                        <div className="glass rounded-2xl p-12 text-center">
                                            <p className="text-5xl mb-4">🎭</p>
                                            <h3 className="text-xl font-semibold text-white mb-2">No Accessories Yet</h3>
                                            <p className="text-white/50 mb-6">Visit the shop to buy some cool accessories!</p>
                                            <Link href="/shop">
                                                <Button>Browse Accessories</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {/* None option */}
                                            <button
                                                onClick={() => equipItem("accessory", null)}
                                                disabled={savingField === "accessory"}
                                                className={cn(
                                                    "rounded-xl p-4 border-2 transition-all text-center",
                                                    !currentAccessorySlug
                                                        ? "border-emerald-500/50 bg-emerald-500/10"
                                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                                )}
                                            >
                                                <div className="text-4xl mb-2">❌</div>
                                                <p className="font-medium text-white">None</p>
                                                <p className="text-xs text-white/40">No accessory</p>
                                            </button>

                                            {ownedAccessories.map((item) => {
                                                const accessorySlug = item.metadata?.hatSlug || item.slug;
                                                const isEquipped = currentAccessorySlug === accessorySlug;
                                                const rarity = item.rarity || "common";
                                                const rarityStyle = RARITY_COLORS[rarity];

                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => equipItem("accessory", accessorySlug)}
                                                        disabled={savingField === "accessory"}
                                                        className={cn(
                                                            "rounded-xl p-4 border-2 transition-all text-center",
                                                            isEquipped
                                                                ? "border-emerald-500/50 bg-emerald-500/10"
                                                                : cn("hover:border-white/30", rarityStyle.border, "bg-white/5")
                                                        )}
                                                    >
                                                        <div className="text-4xl mb-2">
                                                            {item.label.includes("Sunglasses") ? "🕶️" :
                                                             item.label.includes("Mask") ? "😷" :
                                                             item.label.includes("Halo") ? "😇" :
                                                             item.label.includes("Wings") ? "👼" :
                                                             item.label.includes("Devil") ? "😈" :
                                                             item.label.includes("Robot") ? "🤖" :
                                                             item.label.includes("Alien") ? "👽" :
                                                             "🎭"}
                                                        </div>
                                                        <p className="font-medium text-white text-sm">{item.label}</p>
                                                        <Badge className={cn("text-xs mt-1", rarityStyle.bg, rarityStyle.text)}>
                                                            {rarity}
                                                        </Badge>
                                                        {isEquipped && (
                                                            <p className="text-xs text-emerald-400 mt-2">✓ Equipped</p>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Effects Tab */}
                            {selectedTab === "effects" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {ownedEffects.length === 0 ? (
                                        <div className="glass rounded-2xl p-12 text-center">
                                            <p className="text-5xl mb-4">✨</p>
                                            <h3 className="text-xl font-semibold text-white mb-2">No Effects Yet</h3>
                                            <p className="text-white/50 mb-6">Visit the shop to buy some magical effects!</p>
                                            <Link href="/shop">
                                                <Button>Browse Effects</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {/* None option */}
                                            <button
                                                onClick={() => equipItem("effect", null)}
                                                disabled={savingField === "effect"}
                                                className={cn(
                                                    "rounded-xl p-4 border-2 transition-all text-center",
                                                    !currentEffectSlug
                                                        ? "border-emerald-500/50 bg-emerald-500/10"
                                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                                )}
                                            >
                                                <div className="text-4xl mb-2">❌</div>
                                                <p className="font-medium text-white">None</p>
                                                <p className="text-xs text-white/40">No effect</p>
                                            </button>

                                            {ownedEffects.map((item) => {
                                                const effectSlug = item.metadata?.hatSlug || item.slug;
                                                const isEquipped = currentEffectSlug === effectSlug;
                                                const rarity = item.rarity || "common";
                                                const rarityStyle = RARITY_COLORS[rarity];

                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => equipItem("effect", effectSlug)}
                                                        disabled={savingField === "effect"}
                                                        className={cn(
                                                            "rounded-xl p-4 border-2 transition-all text-center",
                                                            isEquipped
                                                                ? "border-emerald-500/50 bg-emerald-500/10"
                                                                : cn("hover:border-white/30", rarityStyle.border, "bg-white/5")
                                                        )}
                                                    >
                                                        <div className="text-4xl mb-2">
                                                            {item.label.includes("Sparkle") ? "✨" :
                                                             item.label.includes("Glow") ? "💫" :
                                                             item.label.includes("Rainbow") ? "🌈" :
                                                             item.label.includes("Fire") ? "🔥" :
                                                             item.label.includes("Ice") ? "❄️" :
                                                             item.label.includes("Lightning") ? "⚡" :
                                                             item.label.includes("Star") ? "⭐" :
                                                             "✨"}
                                                        </div>
                                                        <p className="font-medium text-white text-sm">{item.label}</p>
                                                        <Badge className={cn("text-xs mt-1", rarityStyle.bg, rarityStyle.text)}>
                                                            {rarity}
                                                        </Badge>
                                                        {isEquipped && (
                                                            <p className="text-xs text-emerald-400 mt-2">✓ Equipped</p>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Shop CTA */}
                            {ownedItems.length < 5 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="glass rounded-2xl p-6 text-center border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"
                                >
                                    <p className="text-4xl mb-3">✨</p>
                                    <h3 className="text-lg font-semibold text-white mb-2">Expand Your Collection</h3>
                                    <p className="text-white/60 text-sm mb-4">
                                        You have {availableClicks} clicks to spend. Browse the shop for more items!
                                    </p>
                                    <Link href="/shop">
                                        <Button className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500">
                                            Browse Shop
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

