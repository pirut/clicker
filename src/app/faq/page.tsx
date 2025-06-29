"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
    {
        question: "What is this site?",
        answer: "It's a fun way to give me a dollar. No catch, just a dollar!",
    },
    {
        question: "Is this a joke?",
        answer: "Kind of, but your dollar is real.",
    },
    {
        question: "What do you do with the money?",
        answer: "I use it for coffee, snacks, or to keep the site running.",
    },
    {
        question: "Can I get a refund?",
        answer: "No refunds, but you get my eternal gratitude.",
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
                <Card className="w-full mb-6">
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>Everything you want to know about Give Me a Dollar</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {faqs.map((faq, idx) => (
                            <Card key={idx} className="w-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{faq.answer}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                        <Button asChild className="mt-4 self-center" variant="outline">
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
