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
import { useEnsureDefaultAvatarItems } from "@/lib/avatar-items";

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
};

const EMPTY_LIST: unknown[] = [];

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [savingField, setSavingField] = useState<null | "color" | "name" | "hat">(null);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

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
            await db.transact(
                db.tx.avatarPurchases[id()].update({
                    userId: user.id,
                    itemSlug: item.slug,
                    purchasedAt: Date.now(),
                    amount: item.price,
                })
            );
            setStatusMessage(`Unlocked ${item.label}!`);
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
                                {isLoading && avatarItems.length === 0 && <p className="text-sm text-white/60">Loading shop items...</p>}

                                {avatarItems.length === 0 && !isLoading && (
                                    <p className="text-sm text-white/60">No items yet. They’ll appear here automatically.</p>
                                )}

                                {avatarItems.map((item) => {
                                    const owned = ownedSlugs.has(item.slug);
                                    const canAfford = availableClicks >= item.price;
                                    return (
                                        <div
                                            key={item.id ?? item.slug}
                                            className="rounded-lg border border-white/10 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-white font-semibold">{item.label}</h4>
                                                    {owned && <Badge variant="secondary">Owned</Badge>}
                                                </div>
                                                <p className="text-sm text-white/70 mt-1">{item.description}</p>
                                                <p className="text-xs text-white/50 mt-2">Requires {item.price} clicks</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant={owned ? "outline" : "default"}
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
