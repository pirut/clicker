"use client";
import { db } from "@/lib/instantdb";

export default function TotalClicks() {
  const { data, isLoading } = db.useQuery({ clicks: {} });
  if (isLoading) return <div>...</div>;
  const totalClicks = data?.clicks?.length || 0;
  return (
    <div className="text-center text-sm text-muted-foreground mb-2">
      Total Clicks: {totalClicks}
    </div>
  );
}
