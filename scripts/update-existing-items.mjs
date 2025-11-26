#!/usr/bin/env node

/**
 * Script to update existing avatarItems with category and other new fields
 * Run with: node scripts/update-existing-items.mjs
 */

import { readFileSync } from "fs";
import { init } from "@instantdb/admin";

// Load env vars from .env.local or .env
function loadEnv() {
    try {
        const envLocal = readFileSync(".env.local", "utf8");
        envLocal.split("\n").forEach((line) => {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) {
                const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
                process.env[key.trim()] = value;
            }
        });
    } catch (e) {
        try {
            const env = readFileSync(".env", "utf8");
            env.split("\n").forEach((line) => {
                const [key, ...valueParts] = line.split("=");
                if (key && valueParts.length > 0) {
                    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
                    process.env[key.trim()] = value;
                }
            });
        } catch (e2) {
            // No .env file
        }
    }
}

loadEnv();

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const adminToken = process.env.INSTANTDB_SECRET_KEY;

if (!appId || !adminToken) {
    console.error("Missing required environment variables:");
    console.error("  NEXT_PUBLIC_INSTANT_APP_ID:", appId ? "✓" : "✗");
    console.error("  INSTANTDB_SECRET_KEY:", adminToken ? "✓" : "✗");
    process.exit(1);
}

const db = init({
    appId,
    adminToken,
});

const TYPE_TO_CATEGORY = {
    color: "colors",
    name: "names",
    hat: "hats",
    effect: "effects",
    accessory: "accessories",
};

async function updateExistingItems() {
    console.log("Fetching existing avatar items...");
    const { avatarItems } = await db.query({ avatarItems: {} });

    if (avatarItems.length === 0) {
        console.log("No items to update.");
        return;
    }

    console.log(`Found ${avatarItems.length} items to update.`);

    const transactions = avatarItems
        .filter((item) => !item.category && item.type)
        .map((item) => {
            const category = TYPE_TO_CATEGORY[item.type] || "hats";
            const updates = {
                category,
            };

            // Set default rarity if missing
            if (!item.rarity) {
                updates.rarity = "common";
            }

            console.log(`Updating ${item.slug}: category=${category}, rarity=${updates.rarity || item.rarity || "common"}`);

            return db.tx.avatarItems[item.id].update(updates);
        });

    if (transactions.length === 0) {
        console.log("All items already have categories.");
        return;
    }

    console.log(`Updating ${transactions.length} items...`);
    await db.transact(transactions);
    console.log("✓ Successfully updated all items!");
}

updateExistingItems().catch((error) => {
    console.error("Error updating items:", error);
    process.exit(1);
});

