import { ConvexHttpClient } from "convex/browser";

// Server-side Convex client (for tRPC routers)
// Gracefully degrades when NEXT_PUBLIC_CONVEX_URL is not configured
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

/**
 * Sync an activity to Convex for real-time dashboard updates.
 * Silently skips if Convex is not configured.
 * 
 * NOTE: Convex API integration is disabled until `npx convex dev` is run
 * to generate the required API files. This is intentional to allow the app
 * to work without Convex during initial development.
 */
export async function syncActivity(data: {
  userId: string;
  type: "check-in" | "alert" | "conversation";
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!convex) return; // Graceful skip if Convex not configured

  // TODO: Re-enable when Convex is set up
  // For now, just log that we would sync
  console.log("[Convex sync] Would sync activity:", data.type, data.description);
}

/**
 * Sync user status to Convex for real-time dashboard updates.
 * Silently skips if Convex is not configured.
 */
export async function syncUserStatus(data: {
  userId: string;
  lastCheckIn?: Date;
  nextDue?: Date;
  alertLevel?: "L1" | "L2" | "L3" | "L4" | null;
  alertTriggeredAt?: Date | null;
}): Promise<void> {
  if (!convex) return; // Graceful skip if Convex not configured

  // TODO: Re-enable when Convex is set up
  // For now, just log that we would sync
  console.log("[Convex sync] Would sync user status for:", data.userId);
}

/**
 * Check if Convex is configured and available
 */
export function isConvexConfigured(): boolean {
  return convex !== null;
}
