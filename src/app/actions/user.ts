"use server";

import { db } from "@/lib/instantdb.server";
import { auth } from "@clerk/nextjs/server";
import { id } from "@instantdb/admin";
import { revalidatePath } from "next/cache";

export async function setDisplayName(displayName: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!displayName || typeof displayName !== "string" || displayName.length > 50) {
        throw new Error("Invalid display name");
    }

    const { displayNames } = await db.query({
        displayNames: {
            $: {
                where: { userId: userId },
            },
        },
    });

    const existing = displayNames[0];

    if (existing) {
        await db.transact(
            db.tx.displayNames[existing.id].update({
                userId,
                displayName,
            })
        );
    } else {
        await db.transact(
            db.tx.displayNames[id()].update({
                userId,
                displayName,
            })
        );
    }
    revalidatePath("/");
}
