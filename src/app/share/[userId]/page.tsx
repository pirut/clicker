import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getUserClickCountSnapshot } from "@/lib/click-stats.server";
import { db as adminDb } from "@/lib/instantdb.server";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site";

type Props = {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type DisplayProfile = {
    id: string;
    userId: string;
    displayName?: string;
    hatSlug?: string;
    accessorySlug?: string;
    effectSlug?: string;
    cursorColor?: string;
    profileImageUrl?: string;
};

function getFirstString(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

function normalizeUserId(rawUserId: string) {
    return rawUserId.startsWith("user_") ? rawUserId : `user_${rawUserId}`;
}

function parseClickCount(value?: string) {
    if (!value) return null;

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return null;

    return parsed;
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ userId: userIdParam }, search] = await Promise.all([params, searchParams]);
    const userId = normalizeUserId(userIdParam);

    let clickCount = parseClickCount(getFirstString(search.clicks));
    let displayName = getFirstString(search.name) || undefined;
    let hatSlug = getFirstString(search.hat) || undefined;
    let accessorySlug = getFirstString(search.accessory) || undefined;
    let effectSlug = getFirstString(search.effect) || undefined;
    let cursorColor = getFirstString(search.color) || undefined;
    let profileImageUrl = getFirstString(search.avatar) || undefined;

    // Fallback to database values when essential URL params are missing.
    if (!displayName || clickCount === null) {
        const [profileResult, clickCountResult] = await Promise.all([
            adminDb.query({
                displayNames: {
                    $: {
                        where: { userId },
                        fields: [
                            "userId",
                            "displayName",
                            "hatSlug",
                            "accessorySlug",
                            "effectSlug",
                            "cursorColor",
                            "profileImageUrl",
                        ],
                    },
                },
            }),
            clickCount === null ? getUserClickCountSnapshot(userId) : Promise.resolve(null),
        ]);

        const userProfile = (profileResult.displayNames?.[0] ?? null) as DisplayProfile | null;

        clickCount ??= clickCountResult?.clickCount ?? 0;
        displayName ||= userProfile?.displayName || "A Clicker";
        hatSlug ||= userProfile?.hatSlug || "";
        accessorySlug ||= userProfile?.accessorySlug || "";
        effectSlug ||= userProfile?.effectSlug || "";
        cursorColor ||= userProfile?.cursorColor || "";
        profileImageUrl ||= userProfile?.profileImageUrl || "";
    }

    const ogParams = new URLSearchParams({
        userId,
        clicks: String(clickCount ?? 0),
        name: displayName || "A Clicker",
        ...(hatSlug ? { hat: hatSlug } : {}),
        ...(accessorySlug ? { accessory: accessorySlug } : {}),
        ...(effectSlug ? { effect: effectSlug } : {}),
        ...(cursorColor ? { color: cursorColor } : {}),
        ...(profileImageUrl ? { avatar: profileImageUrl } : {}),
    });

    const ogImageUrl = toAbsoluteUrl(`/api/og?${ogParams.toString()}`);

    const title = `${displayName || "A Clicker"} has ${(clickCount ?? 0).toLocaleString()} clicks!`;
    const description = `Join ${displayName || "this clicker"} on Clicker. Can you beat ${(clickCount ?? 0).toLocaleString()} clicks?`;

    return {
        title,
        description,
        openGraph: {
            type: "website",
            url: `${SITE_URL}/share/${userId}`,
            siteName: "Clicker",
            title,
            description,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${displayName || "Clicker"}'s Clicker profile`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageUrl],
        },
    };
}

export default async function SharePage({ params }: Props) {
    const { userId: userIdParam } = await params;
    const userId = normalizeUserId(userIdParam);
    redirect(`/?ref=${userId}`);
}
