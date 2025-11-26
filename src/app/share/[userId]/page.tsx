import { Metadata } from "next";
import { redirect } from "next/navigation";
import { db as adminDb } from "@/lib/instantdb.server";

type Props = {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate dynamic metadata for social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { userId: userIdParam } = await params;

    // Handle both formats: with or without "user_" prefix
    const userId = userIdParam.startsWith("user_") ? userIdParam : `user_${userIdParam}`;

    // Fetch user data from InstantDB
    const { displayNames, clicks } = await adminDb.query({
        displayNames: { $: { where: { userId } } },
        clicks: { $: { where: { userId } } },
    });

    const userProfile = displayNames?.[0];
    const clickCount = clicks?.length ?? 0;
    const displayName = userProfile?.displayName || "A Clicker";
    const hatSlug = userProfile?.hatSlug || "";
    const cursorColor = userProfile?.cursorColor || "";
    const profileImageUrl = userProfile?.profileImageUrl || "";

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clicker.jrbussard.com";
    
    // Build OG image URL with user data
    const ogParams = new URLSearchParams({
        userId,
        clicks: clickCount.toString(),
        name: displayName,
        ...(hatSlug && { hat: hatSlug }),
        ...(cursorColor && { color: cursorColor }),
        ...(profileImageUrl && { avatar: profileImageUrl }),
    });
    const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

    const title = `${displayName} has ${clickCount} clicks!`;
    const description = `Join ${displayName} on Clicker! They've clicked ${clickCount} times. Can you beat their score?`;

    return {
        title,
        description,
        openGraph: {
            type: "website",
            url: `${baseUrl}/share/${userId}`,
            siteName: "Clicker",
            title,
            description,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${displayName}'s Clicker profile`,
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
    // Redirect to home page - the share page is just for OG previews
    const { userId: userIdParam } = await params;
    // Handle both formats: with or without "user_" prefix
    const userId = userIdParam.startsWith("user_") ? userIdParam : `user_${userIdParam}`;
    redirect(`/?ref=${userId}`);
}

