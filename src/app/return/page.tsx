"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import RecordDonation from "@/components/record-donation";

// Optionally, you could use Clerk's API to look up the user by email if you want to match to a real userId
// For now, we'll use the email as the userId if we can't match

export default function ReturnPage() {
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sessionStatus, setSessionStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            const sessionId = searchParams.get("session_id");
            if (!sessionId || typeof sessionId !== "string") {
                setError("Please provide a valid session_id (`cs_test_...`)");
                return;
            }
            try {
                const res = await fetch(`/api/stripe-session?session_id=${sessionId}`);
                if (!res.ok) throw new Error("Failed to fetch session");
                const data = await res.json();
                setSessionStatus(data.status);
            } catch {
                setError("Error fetching session");
            }
        };
        fetchSession();
    }, [searchParams]);

    useEffect(() => {
        if (sessionStatus === "open" || (sessionStatus && sessionStatus !== "complete")) {
            router.replace("/");
        }
    }, [sessionStatus, router]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p>{error}</p>
            </div>
        );
    }

    if (sessionStatus === "complete") {
        const customerId = user?.id ?? "unknown";
        return <RecordDonation customerId={customerId} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p>Checking your payment status...</p>
        </div>
    );
}
