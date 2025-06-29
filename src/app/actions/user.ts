"use server";

import { db } from "@/lib/instantdb.server";
import { auth } from "@clerk/nextjs/server";
import { id } from "@instantdb/admin";

export async function setDisplayName(displayName: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    if (!displayName || typeof displayName !== "string" || displayName.length > 50) {
        throw new Error("Invalid display name");
    }

    // Query for existing display name and available dollars
    const { displayNames, dollars } = await db.query({
        displayNames: {
            $: {
                where: { userId: userId },
            },
        },
        dollars: {
            $: {
                where: { userId: userId },
            },
        },
    });

    // Count unused dollars
    const unusedDollars = dollars.filter((dollar) => !dollar.used).length;
    if (unusedDollars === 0) {
        throw new Error("You need to give another dollar to change your display name");
    }

    // Get the first unused dollar to mark as used
    const unusedDollar = dollars.find((dollar) => !dollar.used);
    if (!unusedDollar) {
        throw new Error("No unused dollars found");
    }

    const existing = displayNames[0];

    try {
        // First transaction: Update or create display name
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

        // Second transaction: Mark dollar as used
        const dollarUpdateResult = await db.transact(
            db.tx.dollars[unusedDollar.id].update({
                used: true,
                usedFor: existing ? "Changed display name to: " + displayName : "Set initial display name to: " + displayName,
            })
        );
        console.log("Dollar update result:", dollarUpdateResult);
    } catch (error) {
        console.error("Transaction failed:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to update display name");
    }
}

export async function getAvailableDollars(userId: string) {
    const { dollars } = await db.query({
        dollars: {
            $: {
                where: { userId },
            },
        },
    });

    return dollars.filter((dollar) => !dollar.used).length;
}

export async function useDollar(userId: string, purpose: string) {
    const { dollars } = await db.query({
        dollars: {
            $: {
                where: { userId },
            },
        },
    });

    const unusedDollar = dollars.find((dollar) => !dollar.used);
    if (!unusedDollar) {
        throw new Error("No unused dollars available");
    }

    await db.transact(
        db.tx.dollars[unusedDollar.id].update({
            userId: unusedDollar.userId,
            createdAt: unusedDollar.createdAt,
            used: true,
            usedFor: purpose,
        })
    );

    return true;
}

// TEMPORARY: Migration function to fix missing fields on dollars
export async function migrateDollarsForCurrentUser() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const { dollars } = await db.query({
        dollars: {
            $: { where: { userId } },
        },
    });
    const txs = dollars
        .filter((d) => d.used === undefined || d.usedFor === undefined)
        .map((d) => {
            const payload = {
                id: d.id,
                userId: d.userId,
                createdAt: d.createdAt,
                used: d.used !== undefined ? d.used : false,
                usedFor: d.usedFor !== undefined ? d.usedFor : "",
            };
            console.log("Migrating dollar:", d, "with payload:", payload);
            return db.tx.dollars[d.id].update(payload);
        });
    if (txs.length > 0) {
        await db.transact(txs);
        return `${txs.length} dollars migrated.`;
    } else {
        return "No dollars needed migration.";
    }
}
