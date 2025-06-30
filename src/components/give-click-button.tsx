"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/instantdb";
import { id } from "@instantdb/react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function GiveClickButton() {
    const { userId } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [lastClickTime, setLastClickTime] = useState(0);

    const handleClick = async () => {
        if (!userId) {
            setError("You must be logged in to click.");
            return;
        }

        if (Date.now() - lastClickTime < 1000) {
            setError("You can only click once per second.");
            return;
        }

        db.transact(
            db.tx.clicks[id()].update({
                userId,
                createdAt: Date.now(),
            })
        );
        setLastClickTime(Date.now());
        setError(null);
    };

    return (
        <div>
            <Button size="lg" onClick={handleClick}>
                Give Me a Click
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}
