import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId || typeof sessionId !== "string") {
        return NextResponse.json({ error: "Missing or invalid session_id" }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["line_items", "payment_intent"],
        });
        return NextResponse.json({ status: session.status });
    } catch {
        return NextResponse.json({ error: "Session not found or Stripe error" }, { status: 404 });
    }
}
