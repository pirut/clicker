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
            createdAt: i.number(),
            userId: i.string(),
        }),
        displayNames: i.entity({
            displayName: i.string(),
            userId: i.string().unique(),
        }),
        dollars: i.entity({
            createdAt: i.number(),
            used: i.boolean().optional(),
            usedFor: i.string().optional(),
            userId: i.string(),
        }),
    },
    links: {},
    rooms: {
        chat: {
            presence: i.entity({
                clicksGiven: i.number(),
                name: i.string(),
                profileImageUrl: i.string(),
                status: i.string(),
            }),
        },
    },
});

// This helps Typescript display nicer intellisense
type AppSchema = typeof _schema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
