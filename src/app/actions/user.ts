"use server";

import { db } from "@/lib/instantdb.server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { id } from "@instantdb/admin";
import { revalidatePath } from "next/cache";

export async function recordClick() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const oneSecondAgo = Date.now() - 1000;
    const { clicks = [], displayNames = [] } = await db.query({
        clicks: {
            $: {
                where: {
                    userId: userId,
                    createdAt: { $gte: oneSecondAgo },
                },
            },
        },
        displayNames: {
            $: {
                where: { userId: userId },
            },
        },
    });

    if (clicks.length > 0) {
        throw new Error("You can only click once per second");
    }

    // If user doesn't have a display name yet, get it from Clerk
    if (displayNames.length === 0) {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const displayName = user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || "Anonymous";

        // Create display name entry
        await db.transact([
            db.tx.displayNames[id()].update({
                userId,
                displayName,
            }),
        ]);
    }

    // Record the click
    await db.transact(
        db.tx.clicks[id()].update({
            userId,
            createdAt: Date.now(),
        })
    );

    console.log("recordClick called for user:", userId);
    revalidatePath("/");
}

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
