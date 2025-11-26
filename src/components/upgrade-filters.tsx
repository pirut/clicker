"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FilterState = {
    search: string;
    categories: string[];
    rarities: string[];
    priceRange: [number, number];
    showOwned: boolean | null; // null = all, true = owned only, false = unowned only
    sortBy: "price" | "name" | "rarity" | "date";
    sortOrder: "asc" | "desc";
};

const CATEGORIES = ["hats", "effects", "accessories", "colors", "names"] as const;
const RARITIES = ["common", "rare", "epic", "legendary"] as const;

const RARITY_COLORS: Record<string, string> = {
    common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    legendary: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

interface UpgradeFiltersProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    maxPrice: number;
    className?: string;
}

export function UpgradeFilters({ filters, onFiltersChange, maxPrice, className }: UpgradeFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateFilters = (updates: Partial<FilterState>) => {
        onFiltersChange({ ...filters, ...updates });
    };

    const toggleCategory = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter((c) => c !== category)
            : [...filters.categories, category];
        updateFilters({ categories: newCategories });
    };

    const toggleRarity = (rarity: string) => {
        const newRarities = filters.rarities.includes(rarity)
            ? filters.rarities.filter((r) => r !== rarity)
            : [...filters.rarities, rarity];
        updateFilters({ rarities: newRarities });
    };

    const resetFilters = () => {
        onFiltersChange({
            search: "",
            categories: [],
            rarities: [],
            priceRange: [0, maxPrice],
            showOwned: null,
            sortBy: "price",
            sortOrder: "asc",
        });
    };

    const hasActiveFilters =
        filters.search !== "" ||
        filters.categories.length > 0 ||
        filters.rarities.length > 0 ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < maxPrice ||
        filters.showOwned !== null;

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        placeholder="Search upgrades..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/70"
                >
                    {isExpanded ? "Less" : "More"} Filters
                </Button>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-white/70">
                        Reset
                    </Button>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/5">
                    {/* Categories */}
                    <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={filters.categories.includes(cat) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleCategory(cat)}
                                    className="capitalize"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Rarities */}
                    <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">Rarity</label>
                        <div className="flex flex-wrap gap-2">
                            {RARITIES.map((rarity) => (
                                <Badge
                                    key={rarity}
                                    variant={filters.rarities.includes(rarity) ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer capitalize",
                                        filters.rarities.includes(rarity) && RARITY_COLORS[rarity]
                                    )}
                                    onClick={() => toggleRarity(rarity)}
                                >
                                    {rarity}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">
                            Price: {filters.priceRange[0]} - {filters.priceRange[1]} clicks
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={0}
                                max={maxPrice}
                                value={filters.priceRange[0]}
                                onChange={(e) =>
                                    updateFilters({
                                        priceRange: [Number(e.target.value), filters.priceRange[1]],
                                    })
                                }
                                className="bg-white/5 border-white/10 text-white"
                            />
                            <Input
                                type="number"
                                min={0}
                                max={maxPrice}
                                value={filters.priceRange[1]}
                                onChange={(e) =>
                                    updateFilters({
                                        priceRange: [filters.priceRange[0], Number(e.target.value)],
                                    })
                                }
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Owned Filter */}
                    <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">Ownership</label>
                        <div className="flex gap-2">
                            <Button
                                variant={filters.showOwned === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ showOwned: null })}
                            >
                                All
                            </Button>
                            <Button
                                variant={filters.showOwned === true ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ showOwned: true })}
                            >
                                Owned
                            </Button>
                            <Button
                                variant={filters.showOwned === false ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ showOwned: false })}
                            >
                                Unowned
                            </Button>
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="text-sm font-medium text-white/80 mb-2 block">Sort By</label>
                        <div className="flex gap-2">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilters({ sortBy: e.target.value as FilterState["sortBy"] })}
                                className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white"
                            >
                                <option value="price">Price</option>
                                <option value="name">Name</option>
                                <option value="rarity">Rarity</option>
                                <option value="date">Date</option>
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
                            >
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

