"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function ShareClientPage() {
    useEffect(() => {
        // Only runs in the browser, not during SSR or for bots
        window.location.replace("/");
    }, []);

    return (
        <main>
            <h1>Thank you for coming!</h1>
            <p>
                If you are not redirected, <Link href="/">click here</Link>.
            </p>
        </main>
    );
}
