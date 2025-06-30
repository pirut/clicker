"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>About</CardTitle>
                        <CardDescription>Learn more about Clicker and the tech behind it</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Clicker</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>This site is a playful experiment to see how many clicks we can get up to.</CardDescription>
                            </CardContent>
                        </Card>
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Built With</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button asChild variant="link" className="justify-start p-0 h-auto">
                                    <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
                                        Next.js
                                    </a>
                                </Button>
                                <Button asChild variant="link" className="justify-start p-0 h-auto">
                                    <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
                                        shadcn/ui
                                    </a>
                                </Button>
                                <Button asChild variant="link" className="justify-start p-0 h-auto">
                                    <a href="https://clerk.com/" target="_blank" rel="noopener noreferrer">
                                        Clerk
                                    </a>
                                </Button>
                                <Button asChild variant="link" className="justify-start p-0 h-auto">
                                    <a href="https://instantdb.com/" target="_blank" rel="noopener noreferrer">
                                        InstantDB
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </CardContent>
                    <CardFooter>
                        <CardDescription>Created by JR Bussard. Thanks for stopping by!</CardDescription>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
