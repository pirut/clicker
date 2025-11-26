"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/instantdb";
import { UpgradeEditor } from "@/components/admin/upgrade-editor";
import { cn } from "@/lib/utils";

type AvatarItem = {
    id: string;
    slug: string;
    label: string;
    description?: string;
    type?: string;
    category?: string;
    rarity?: string;
    price: number;
    sortOrder?: number;
    isActive?: boolean;
    createdAt?: number;
};

const RARITY_COLORS: Record<string, string> = {
    common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    legendary: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

// Simple admin check - you can enhance this with Clerk metadata or env vars
function isAdmin(userEmail?: string): boolean {
    if (!userEmail) return false;
    // For now, check if email contains admin or is a specific domain
    // You should replace this with proper admin checking via Clerk metadata
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    return adminEmails.includes(userEmail) || userEmail.includes("admin");
}

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const [editingItem, setEditingItem] = useState<AvatarItem | null>(null);
    const [showEditor, setShowEditor] = useState(false);

    const { data, isLoading } = db.useQuery({
        avatarItems: {},
    });

    const userEmail = user?.emailAddresses[0]?.emailAddress;
    const admin = isAdmin(userEmail);

    // Move useMemo before any conditional returns to follow React hooks rules
    const sortedItems = useMemo(() => {
        const items = (data?.avatarItems ?? []) as AvatarItem[];
        return [...items].sort((a, b) => {
            if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
                return a.sortOrder - b.sortOrder;
            }
            return (a.createdAt || 0) - (b.createdAt || 0);
        });
    }, [data?.avatarItems]);

    const handleEdit = (item: AvatarItem) => {
        setEditingItem(item);
        setShowEditor(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setShowEditor(true);
    };

    const handleSave = () => {
        setShowEditor(false);
        setEditingItem(null);
    };

    const handleCancel = () => {
        setShowEditor(false);
        setEditingItem(null);
    };

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center text-white/80">Loading...</div>;
    }

    if (!admin) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4">
                    <Card className="border-red-500/30 bg-red-500/10 max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-300">Access Denied</CardTitle>
                            <CardDescription className="text-red-200/70">
                                You do not have permission to access this page.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 px-4 py-10 lg:py-14">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Card className="border-white/10 bg-black/40 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-semibold">Admin Panel</CardTitle>
                                    <CardDescription>Manage avatar upgrades and items</CardDescription>
                                </div>
                                <Button onClick={handleCreate}>Create New Item</Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {showEditor && (
                        <UpgradeEditor item={editingItem} onSave={handleSave} onCancel={handleCancel} />
                    )}

                    <Card className="border-white/10 bg-black/30 backdrop-blur">
                        <CardHeader>
                            <CardTitle>All Items ({sortedItems.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p className="text-sm text-white/60">Loading items...</p>
                            ) : sortedItems.length === 0 ? (
                                <p className="text-sm text-white/60">No items found. Create one to get started.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/10">
                                                <TableHead className="text-white">Slug</TableHead>
                                                <TableHead className="text-white">Label</TableHead>
                                                <TableHead className="text-white">Category</TableHead>
                                                <TableHead className="text-white">Rarity</TableHead>
                                                <TableHead className="text-white">Price</TableHead>
                                                <TableHead className="text-white">Sort</TableHead>
                                                <TableHead className="text-white">Status</TableHead>
                                                <TableHead className="text-white">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedItems.map((item) => (
                                                <TableRow key={item.id} className="border-white/10">
                                                    <TableCell className="text-white/80 font-mono text-sm">
                                                        {item.slug}
                                                    </TableCell>
                                                    <TableCell className="text-white">{item.label}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {item.category || "N/A"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.rarity && (
                                                            <Badge
                                                                className={cn(
                                                                    "capitalize",
                                                                    RARITY_COLORS[item.rarity] || RARITY_COLORS.common
                                                                )}
                                                            >
                                                                {item.rarity}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-white">{item.price}</TableCell>
                                                    <TableCell className="text-white/60">{item.sortOrder ?? 0}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={item.isActive !== false ? "default" : "secondary"}
                                                        >
                                                            {item.isActive !== false ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
