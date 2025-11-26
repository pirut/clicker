"use client";
import { db } from "@/lib/instantdb";

export default function TotalClicks() {
  // Limit query to reasonable number for counting (InstantDB doesn't have native count)
  const { data, isLoading } = db.useQuery({ 
    clicks: { 
      $: { 
        limit: 50000, // Reasonable upper bound
        order: { createdAt: "desc" }
      } 
    } 
  });
  if (isLoading) return <div className="text-center text-sm text-muted-foreground mb-2">...</div>;
  const totalClicks = data?.clicks?.length || 0;
  return (
    <div className="text-center text-sm text-muted-foreground mb-2">
      Total Clicks: {totalClicks.toLocaleString()}
    </div>
  );
}
