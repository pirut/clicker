"use client";
import { useTotalClickStats } from "@/lib/use-click-stats";

export default function TotalClicks() {
  const { totalClicks, isLoading } = useTotalClickStats();
  if (isLoading) return <div className="text-center text-sm text-muted-foreground mb-2">...</div>;
  return (
    <div className="text-center text-sm text-muted-foreground mb-2">
      Total Clicks: {totalClicks.toLocaleString()}
    </div>
  );
}
