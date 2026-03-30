"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

const techStack = [
    { name: "Next.js", url: "https://nextjs.org/", description: "React framework" },
    { name: "shadcn/ui", url: "https://ui.shadcn.com/", description: "Component library" },
    { name: "Clerk", url: "https://clerk.com/", description: "Authentication" },
    { name: "InstantDB", url: "https://instantdb.com/", description: "Realtime database" },
    { name: "Framer Motion", url: "https://motion.dev/", description: "Animations" },
    { name: "Tailwind CSS", url: "https://tailwindcss.com/", description: "Styling" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center px-4 pb-8 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl font-bold sm:text-4xl text-gradient">About</h1>
                        <p className="mt-2 text-sm text-foreground/60">The story behind Clicker</p>
                    </div>

                    <div className="kraft-label p-5 sm:p-6 mb-4">
                        <h2 className="font-display text-lg font-semibold">What is Clicker?</h2>
                        <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                            A playful experiment to see how many clicks we can rack up together. Every click is tracked in real time, every cursor is visible, and the leaderboard updates instantly. It&apos;s competitive, social, and completely pointless — in the best way.
                        </p>
                    </div>

                    <div className="kraft-label p-5 sm:p-6 mb-4">
                        <h2 className="font-display text-lg font-semibold mb-3">Built with</h2>
                        <div className="grid gap-2">
                            {techStack.map((tech) => (
                                <a
                                    key={tech.name}
                                    href={tech.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/40 px-3.5 py-2.5 text-sm transition-colors hover:bg-card hover:shadow-xs"
                                >
                                    <span className="font-medium">{tech.name}</span>
                                    <span className="text-xs text-muted-foreground">{tech.description}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="kraft-label p-5 sm:p-6">
                        <p className="text-sm text-foreground/60">
                            Created by <span className="font-medium text-foreground">JR Bussard</span>. Thanks for stopping by and clicking.
                        </p>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
