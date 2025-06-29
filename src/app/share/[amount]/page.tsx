import type { Metadata } from "next";
import ShareClientPage from "./client-page";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata({ params }: any): Promise<Metadata> {
    const amount = params.amount;
    const title = `I've given $${amount} on gimme.jrbussard.com`;
    const description = "You should too!";
    const url = `https://gimme.jrbussard.com/share/${amount}`;
    const imageUrl = `https://gimme.jrbussard.com/api/og?amount=${amount}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default function SharePage() {
    return <ShareClientPage />;
}
