"use client";

import { useState, useEffect } from "react";
import { id } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { db } from "@/lib/instantdb";

type AvatarItem = {
    id?: string;
    slug: string;
    label: string;
    description?: string;
    type: string;
    category: string;
    rarity?: string;
    price: number;
    sortOrder?: number;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
};

const CATEGORIES = ["hats", "effects", "accessories", "colors", "names"] as const;
const TYPES = ["hat", "effect", "accessory", "color", "name"] as const;
const RARITIES = ["common", "rare", "epic", "legendary"] as const;

interface UpgradeEditorProps {
    item?: AvatarItem | null;
    onSave: () => void;
    onCancel: () => void;
}

export function UpgradeEditor({ item, onSave, onCancel }: UpgradeEditorProps) {
    const [formData, setFormData] = useState<Partial<AvatarItem>>({
        slug: "",
        label: "",
        description: "",
        type: "hat",
        category: "hats",
        rarity: "common",
        price: 0,
        sortOrder: 0,
        isActive: true,
        metadata: {},
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (item) {
            setFormData({
                slug: item.slug || "",
                label: item.label || "",
                description: item.description || "",
                type: item.type || "hat",
                category: item.category || "hats",
                rarity: item.rarity || "common",
                price: item.price || 0,
                sortOrder: item.sortOrder || 0,
                isActive: item.isActive !== undefined ? item.isActive : true,
                metadata: item.metadata || {},
            });
        } else {
            setFormData({
                slug: "",
                label: "",
                description: "",
                type: "hat",
                category: "hats",
                rarity: "common",
                price: 0,
                sortOrder: 0,
                isActive: true,
                metadata: {},
            });
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const itemId = item?.id || id();
            const payload: Record<string, unknown> = {
                slug: formData.slug!,
                label: formData.label!,
                description: formData.description || "",
                type: formData.type!,
                category: formData.category!,
                price: formData.price!,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                createdAt: item?.id ? undefined : Date.now(),
            };

            if (formData.rarity) {
                payload.rarity = formData.rarity;
            }
            if (formData.sortOrder !== undefined) {
                payload.sortOrder = formData.sortOrder;
            }
            if (formData.metadata) {
                payload.metadata = formData.metadata;
            }

            await db.transact(db.tx.avatarItems[itemId].update(payload));
            onSave();
        } catch (err) {
            console.error("Failed to save item:", err);
            setError("Failed to save item. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!item?.id || !confirm("Are you sure you want to delete this item?")) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await db.transact(db.tx.avatarItems[item.id].update({ isActive: false }));
            onSave();
        } catch (err) {
            console.error("Failed to delete item:", err);
            setError("Failed to delete item. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border-white/10 bg-black/40 backdrop-blur">
            <CardHeader>
                <CardTitle>{item ? "Edit Upgrade" : "Create New Upgrade"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-white">
                                Slug *
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                                disabled={!!item?.id}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="fun-hat"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="label" className="text-white">
                                Label *
                            </Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Fun Hat"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                            Description
                        </Label>
                        <Input
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Adds a classy top hat to your avatar trail."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-white">
                                Type *
                            </Label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFormData({
                                        ...formData,
                                        type: newType,
                                        category: newType === "hat" ? "hats" : formData.category,
                                    });
                                }}
                                required
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            >
                                {TYPES.map((type) => (
                                    <option key={type} value={type} className="bg-black">
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-white">
                                Category *
                            </Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="bg-black capitalize">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rarity" className="text-white">
                                Rarity
                            </Label>
                            <select
                                id="rarity"
                                value={formData.rarity || "common"}
                                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            >
                                {RARITIES.map((rarity) => (
                                    <option key={rarity} value={rarity} className="bg-black capitalize">
                                        {rarity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-white">
                                Price *
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min={0}
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sortOrder" className="text-white">
                                Sort Order
                            </Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                value={formData.sortOrder || 0}
                                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive !== false}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-white/20"
                        />
                        <Label htmlFor="isActive" className="text-white cursor-pointer">
                            Active (visible in shop)
                        </Label>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : item ? "Update" : "Create"}
                        </Button>
                        {item?.id && (
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
                                Delete
                            </Button>
                        )}
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

