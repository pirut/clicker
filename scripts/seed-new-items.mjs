#!/usr/bin/env node

/**
 * Script to seed all new avatar items
 * Run with: node scripts/seed-new-items.mjs
 */

import { readFileSync } from "fs";
import { init, id } from "@instantdb/admin";

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
    console.error("Missing required environment variables");
    process.exit(1);
}

const db = init({ appId, adminToken });

const DEFAULT_AVATAR_ITEMS = [
    // Colors
    {
        slug: "color-change",
        label: "Cursor Color Lab",
        description: "Unlock a custom hue for your live cursor.",
        type: "color",
        category: "colors",
        rarity: "common",
        price: 25,
        sortOrder: 1,
    },
    {
        slug: "gradient-colors",
        label: "Gradient Palette",
        description: "Beautiful gradient color options for your cursor.",
        type: "color",
        category: "colors",
        rarity: "rare",
        price: 75,
        sortOrder: 2,
        metadata: { gradient: true },
    },
    {
        slug: "rainbow-colors",
        label: "Rainbow Spectrum",
        description: "Animated rainbow colors that cycle through the spectrum.",
        type: "color",
        category: "colors",
        rarity: "epic",
        price: 200,
        sortOrder: 3,
        metadata: { animated: true, rainbow: true },
    },
    {
        slug: "neon-colors",
        label: "Neon Glow",
        description: "Vibrant neon colors with an electric glow effect.",
        type: "color",
        category: "colors",
        rarity: "epic",
        price: 180,
        sortOrder: 4,
        metadata: { neon: true },
    },
    {
        slug: "premium-colors",
        label: "Premium Palette",
        description: "Exclusive luxury color options for the elite.",
        type: "color",
        category: "colors",
        rarity: "legendary",
        price: 500,
        sortOrder: 5,
        metadata: { premium: true },
    },
    // Names
    {
        slug: "name-change",
        label: "Stage Name",
        description: "Show a custom moniker over your cursor.",
        type: "name",
        category: "names",
        rarity: "common",
        price: 15,
        sortOrder: 1,
    },
    {
        slug: "fancy-name",
        label: "Fancy Font",
        description: "Display your name with an elegant serif font.",
        type: "name",
        category: "names",
        rarity: "rare",
        price: 60,
        sortOrder: 2,
        metadata: { fontStyle: "serif" },
    },
    {
        slug: "glow-name",
        label: "Glowing Text",
        description: "Your name with a radiant glow effect.",
        type: "name",
        category: "names",
        rarity: "epic",
        price: 150,
        sortOrder: 3,
        metadata: { glow: true },
    },
    {
        slug: "animated-name",
        label: "Animated Text",
        description: "Your name with smooth animation effects.",
        type: "name",
        category: "names",
        rarity: "epic",
        price: 175,
        sortOrder: 4,
        metadata: { animated: true },
    },
    // Hats
    {
        slug: "fun-hat",
        label: "Fun Hat",
        description: "Adds a classy top hat to your avatar trail.",
        type: "hat",
        category: "hats",
        rarity: "common",
        price: 40,
        sortOrder: 1,
        metadata: { hatSlug: "fun-hat" },
    },
    {
        slug: "party-hat",
        label: "Party Hat",
        description: "Celebrate with a festive party hat!",
        type: "hat",
        category: "hats",
        rarity: "common",
        price: 30,
        sortOrder: 2,
        metadata: { hatSlug: "party-hat" },
    },
    {
        slug: "crown",
        label: "Royal Crown",
        description: "Rule the clicker kingdom with a majestic crown.",
        type: "hat",
        category: "hats",
        rarity: "rare",
        price: 100,
        sortOrder: 3,
        metadata: { hatSlug: "crown" },
    },
    {
        slug: "wizard-hat",
        label: "Wizard Hat",
        description: "Channel your inner magic with a wizard's hat.",
        type: "hat",
        category: "hats",
        rarity: "rare",
        price: 85,
        sortOrder: 4,
        metadata: { hatSlug: "wizard" },
    },
    {
        slug: "cap",
        label: "Baseball Cap",
        description: "A classic cap for casual clicking.",
        type: "hat",
        category: "hats",
        rarity: "common",
        price: 25,
        sortOrder: 5,
        metadata: { hatSlug: "cap" },
    },
    {
        slug: "cowboy-hat",
        label: "Cowboy Hat",
        description: "Yeehaw! A western-style cowboy hat.",
        type: "hat",
        category: "hats",
        rarity: "rare",
        price: 90,
        sortOrder: 6,
        metadata: { hatSlug: "cowboy" },
    },
    {
        slug: "beanie",
        label: "Cozy Beanie",
        description: "Stay warm with a cozy knitted beanie.",
        type: "hat",
        category: "hats",
        rarity: "common",
        price: 35,
        sortOrder: 7,
        metadata: { hatSlug: "beanie" },
    },
    {
        slug: "helmet",
        label: "Safety Helmet",
        description: "Protect your clicks with a safety helmet.",
        type: "hat",
        category: "hats",
        rarity: "common",
        price: 45,
        sortOrder: 8,
        metadata: { hatSlug: "helmet" },
    },
    {
        slug: "beret",
        label: "Artistic Beret",
        description: "Express your creative side with a beret.",
        type: "hat",
        category: "hats",
        rarity: "rare",
        price: 70,
        sortOrder: 9,
        metadata: { hatSlug: "beret" },
    },
    {
        slug: "santa-hat",
        label: "Santa Hat",
        description: "Spread holiday cheer all year round!",
        type: "hat",
        category: "hats",
        rarity: "epic",
        price: 150,
        sortOrder: 10,
        metadata: { hatSlug: "santa" },
    },
    {
        slug: "top-hat",
        label: "Top Hat",
        description: "The ultimate in formal headwear.",
        type: "hat",
        category: "hats",
        rarity: "epic",
        price: 200,
        sortOrder: 11,
        metadata: { hatSlug: "top-hat" },
    },
    // Accessories
    {
        slug: "sunglasses",
        label: "Cool Sunglasses",
        description: "Look cool with stylish sunglasses.",
        type: "accessory",
        category: "accessories",
        rarity: "common",
        price: 50,
        sortOrder: 1,
        metadata: { hatSlug: "sunglasses" },
    },
    {
        slug: "mask",
        label: "Mystery Mask",
        description: "Hide your identity with a mysterious mask.",
        type: "accessory",
        category: "accessories",
        rarity: "common",
        price: 40,
        sortOrder: 2,
        metadata: { hatSlug: "mask" },
    },
    {
        slug: "halo",
        label: "Divine Halo",
        description: "A heavenly halo for the pure of click.",
        type: "accessory",
        category: "accessories",
        rarity: "epic",
        price: 250,
        sortOrder: 3,
        metadata: { hatSlug: "halo" },
    },
    {
        slug: "wings",
        label: "Angel Wings",
        description: "Soar above with angelic wings.",
        type: "accessory",
        category: "accessories",
        rarity: "epic",
        price: 300,
        sortOrder: 4,
        metadata: { hatSlug: "wings" },
    },
    {
        slug: "devil-horns",
        label: "Devil Horns",
        description: "Embrace your mischievous side.",
        type: "accessory",
        category: "accessories",
        rarity: "rare",
        price: 120,
        sortOrder: 5,
        metadata: { hatSlug: "devil" },
    },
    {
        slug: "robot-head",
        label: "Robot Head",
        description: "Transform into a futuristic robot.",
        type: "accessory",
        category: "accessories",
        rarity: "epic",
        price: 220,
        sortOrder: 6,
        metadata: { hatSlug: "robot" },
    },
    {
        slug: "alien-head",
        label: "Alien Head",
        description: "From another world, for another level of clicking.",
        type: "accessory",
        category: "accessories",
        rarity: "legendary",
        price: 450,
        sortOrder: 7,
        metadata: { hatSlug: "alien" },
    },
    // Effects
    {
        slug: "sparkles",
        label: "Sparkle Effect",
        description: "Add magical sparkles around your cursor.",
        type: "effect",
        category: "effects",
        rarity: "rare",
        price: 110,
        sortOrder: 1,
        metadata: { effect: "sparkles" },
    },
    {
        slug: "glow-effect",
        label: "Enhanced Glow",
        description: "A powerful glow effect that makes you shine.",
        type: "effect",
        category: "effects",
        rarity: "rare",
        price: 95,
        sortOrder: 2,
        metadata: { effect: "glow" },
    },
    {
        slug: "rainbow-effect",
        label: "Rainbow Aura",
        description: "Surround yourself with a rainbow aura.",
        type: "effect",
        category: "effects",
        rarity: "epic",
        price: 180,
        sortOrder: 3,
        metadata: { effect: "rainbow" },
    },
    {
        slug: "fire-effect",
        label: "Fire Trail",
        description: "Leave a trail of fire as you click.",
        type: "effect",
        category: "effects",
        rarity: "epic",
        price: 200,
        sortOrder: 4,
        metadata: { effect: "fire" },
    },
    {
        slug: "ice-effect",
        label: "Ice Crystals",
        description: "Frosty ice crystals follow your cursor.",
        type: "effect",
        category: "effects",
        rarity: "epic",
        price: 190,
        sortOrder: 5,
        metadata: { effect: "ice" },
    },
    {
        slug: "lightning-effect",
        label: "Lightning Strike",
        description: "Electric lightning crackles around you.",
        type: "effect",
        category: "effects",
        rarity: "legendary",
        price: 400,
        sortOrder: 6,
        metadata: { effect: "lightning" },
    },
    {
        slug: "stars-effect",
        label: "Stardust",
        description: "A trail of twinkling stars follows your clicks.",
        type: "effect",
        category: "effects",
        rarity: "rare",
        price: 130,
        sortOrder: 7,
        metadata: { effect: "stars" },
    },
];

async function seedItems() {
    console.log("Fetching existing items...");
    const { avatarItems } = await db.query({ avatarItems: {} });
    
    const existingSlugs = new Set(avatarItems.map((item) => item.slug));
    console.log(`Found ${avatarItems.length} existing items: ${[...existingSlugs].join(", ")}`);
    
    const missingItems = DEFAULT_AVATAR_ITEMS.filter((item) => !existingSlugs.has(item.slug));
    
    if (missingItems.length === 0) {
        console.log("All items already exist!");
        return;
    }
    
    console.log(`\nSeeding ${missingItems.length} new items...`);
    
    const now = Date.now();
    const transactions = missingItems.map((item, index) => {
        console.log(`  - ${item.slug} (${item.category}, ${item.rarity}, ${item.price} clicks)`);
        return db.tx.avatarItems[id()].update({
            ...item,
            isActive: true,
            createdAt: now + index,
        });
    });
    
    await db.transact(transactions);
    console.log("\n✓ Successfully seeded all new items!");
}

seedItems().catch((error) => {
    console.error("Error seeding items:", error);
    process.exit(1);
});

