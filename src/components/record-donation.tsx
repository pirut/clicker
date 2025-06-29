"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type RecordDonationProps = {
    customerId: string;
};

export default function RecordDonation({ customerId }: RecordDonationProps) {
    const router = useRouter();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        if (customerId) {
            fetch("/return/record-dollar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: customerId, createdAt: Date.now() }),
            }).then(() => {
                router.push("/thank-you");
            });
        } else {
            router.push("/thank-you");
        }
    }, [customerId, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p>Recording your contribution...</p>
        </div>
    );
}
