"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { fetchClientSecret } from "../app/actions/stripe";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const fetchClientSecretWrapper = async () => {
    const secret = await fetchClientSecret();
    if (!secret) {
        throw new Error("Failed to create checkout session");
    }
    return secret;
};

export default function Checkout() {
    return (
        <div
            id="checkout"
            style={{
                height: "75vh",
                overflow: "scroll",
                width: "100%",
                maxWidth: "100%",
                margin: "0",
            }}
        >
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: fetchClientSecretWrapper }}>
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}
