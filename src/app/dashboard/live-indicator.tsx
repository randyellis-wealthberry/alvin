"use client";

import { useState, useEffect } from "react";

/**
 * Shows a "Live" indicator when Convex real-time is active.
 * Displays nothing when Convex is not configured (graceful absence).
 */
export function LiveIndicator() {
  const [isConvexConfigured, setIsConvexConfigured] = useState(false);

  useEffect(() => {
    // Check on client only to avoid hydration mismatch
    setIsConvexConfigured(!!process.env.NEXT_PUBLIC_CONVEX_URL);
  }, []);

  if (!isConvexConfigured) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
      <span>Live</span>
    </div>
  );
}
