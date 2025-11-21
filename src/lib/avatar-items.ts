"use client";

import { useEffect } from "react";
import { id } from "@instantdb/react";

import { db } from "@/lib/instantdb";

export type AvatarItemSeed = {
    slug: string;
    label: string;
    description: string;
    type: "color" | "name" | "hat";
    price: number;
    metadata?: Record<string, unknown>;
};

export const DEFAULT_AVATAR_ITEMS: AvatarItemSeed[] = [
    {
        slug: "color-change",
        label: "Cursor Color Lab",
        description: "Unlock a custom hue for your live cursor.",
        type: "color",
        price: 25,
    },
    {
        slug: "name-change",
        label: "Stage Name",
        description: "Show a custom moniker over your cursor.",
        type: "name",
        price: 15,
    },
    {
        slug: "fun-hat",
        label: "Fun Hat",
        description: "Adds a classy top hat to your avatar trail.",
        type: "hat",
        price: 40,
        metadata: { hatSlug: "fun-hat" },
    },
];

export function useEnsureDefaultAvatarItems(items: Array<{ slug: string }> | undefined) {
    useEffect(() => {
        if (!items) return;
        if (items.length > 0) return;

        const now = Date.now();
        const txs = DEFAULT_AVATAR_ITEMS.map((item, index) =>
            db.tx.avatarItems[id()].update({
                ...item,
                isActive: true,
                createdAt: now + index,
            })
        );

        db.transact(txs).catch((error) => {
            console.error("Failed to seed avatar items", error);
        });
    }, [items]);
}

