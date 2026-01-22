"use client";

// Check if Convex is configured via environment variable
const isConvexConfigured =
  typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_CONVEX_URL;

/**
 * Shows a "Live" indicator when Convex real-time is active.
 * Displays nothing when Convex is not configured (graceful absence).
 */
export function LiveIndicator() {
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
