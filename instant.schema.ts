// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
        }),
        $users: i.entity({
            email: i.string().unique().indexed().optional(),
        }),
        clicks: i.entity({
            createdAt: i.number().indexed(),
            userId: i.string().indexed(),
        }),
        displayNames: i.entity({
            displayName: i.string(),
            userId: i.string().unique(),
            cursorColor: i.string().optional(),
            hatSlug: i.string().optional(),
            profileImageUrl: i.string().optional(),
            updatedAt: i.number().optional().indexed(),
        }),
        avatarItems: i.entity({
            slug: i.string().unique().indexed(),
            label: i.string(),
            description: i.string().optional(),
            type: i.string().indexed(),
            category: i.string().indexed().optional(),
            rarity: i.string().indexed().optional(),
            sortOrder: i.number().optional(),
            price: i.number(),
            metadata: i.json().optional(),
            isActive: i.boolean().optional(),
            createdAt: i.number().indexed(),
        }),
        avatarPurchases: i.entity({
            userId: i.string().indexed(),
            itemSlug: i.string().indexed(),
            purchasedAt: i.number().indexed(),
            amount: i.number().indexed(),
        }),
    },
    links: {
        clickAuthor: {
            forward: { on: "clicks", has: "one", label: "author" },
            reverse: { on: "displayNames", has: "many", label: "clicks" },
        },
    },
    rooms: {
        chat: {
            presence: i.entity({
                clicksGiven: i.number(),
                name: i.string(),
                profileImageUrl: i.string(),
                status: i.string(),
                cursorColor: i.string().optional(),
                hatSlug: i.string().optional(),
            }),
        },
    },
});

// This helps Typescript display nicer intellisense
type AppSchema = typeof _schema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
