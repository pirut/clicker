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
    common: "bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500/30",
    rare: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30",
    epic: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
    legendary: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30",
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
        <div className={cn("space-y-3 sm:space-y-4", className)}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        placeholder="Search upgrades..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-muted-foreground text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                        {isExpanded ? "Less" : "More"} Filters
                    </Button>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground text-xs sm:text-sm flex-1 sm:flex-none">
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border border-border bg-card shadow-sm">
                    {/* Categories */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Categories</label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {CATEGORIES.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={filters.categories.includes(cat) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleCategory(cat)}
                                    className="capitalize text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Rarities */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Rarity</label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {RARITIES.map((rarity) => (
                                <Badge
                                    key={rarity}
                                    variant={filters.rarities.includes(rarity) ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer capitalize text-xs",
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
                        <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">
                            Price: {filters.priceRange[0]} - {filters.priceRange[1]} clicks
                        </label>
                        <div className="grid grid-cols-2 gap-2">
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
                                className="bg-background/50 border-border text-foreground text-sm"
                                placeholder="Min"
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
                                className="bg-background/50 border-border text-foreground text-sm"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Owned Filter */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Ownership</label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <Button
                                variant={filters.showOwned === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ showOwned: null })}
                                className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                            >
                                All
                            </Button>
                            <Button
                                variant={filters.showOwned === true ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ showOwned: true })}
                                className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                            >
                                Owned
                            </Button>
                            <Button
                                variant={filters.showOwned === false ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({ showOwned: false })}
                                className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                            >
                                Unowned
                            </Button>
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">Sort By</label>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilters({ sortBy: e.target.value as FilterState["sortBy"] })}
                                className="bg-background/50 border border-border rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-foreground flex-1 sm:flex-none min-w-[100px]"
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
                                className="text-xs sm:text-sm h-7 sm:h-8 px-3"
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

