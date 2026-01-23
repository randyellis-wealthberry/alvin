import { ConvexHttpClient } from "convex/browser";

// Server-side Convex client (for tRPC routers)
// Gracefully degrades when NEXT_PUBLIC_CONVEX_URL is not configured
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConvexApi = any;

// Path to the generated Convex API - uses template to prevent static resolution
const CONVEX_API_PATH = `${"../../../convex/_generated/api"}`;

/**
 * Dynamically load the Convex API.
 * Returns null if the generated files don't exist yet.
 */
async function getApi(): Promise<ConvexApi | null> {
  try {
    // Dynamic import - will fail gracefully if generated files don't exist
    // Uses variable path to prevent TypeScript from resolving at compile time
    const module = (await import(/* @vite-ignore */ CONVEX_API_PATH)) as {
      api: ConvexApi;
    };
    return module.api;
  } catch {
    console.warn(
      "[Convex sync] Generated API not available. Run 'npx convex dev' to generate.",
    );
    return null;
  }
}

/**
 * Sync an activity to Convex for real-time dashboard updates.
 * Silently skips if Convex is not configured or API not generated.
 */
export async function syncActivity(data: {
  userId: string;
  type: "check-in" | "alert" | "conversation";
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!convex) return; // Graceful skip if Convex not configured

  try {
    const api = await getApi();
    if (!api) return;

    await convex.mutation(api.activities.addActivity, {
      userId: data.userId,
      type: data.type,
      description: data.description,
      timestamp: data.timestamp.getTime(),
      metadata: data.metadata,
    });
  } catch (error) {
    // Log but don't throw - sync failures shouldn't break primary operations
    console.error("[Convex sync] Failed to sync activity:", error);
  }
}

/**
 * Sync user status to Convex for real-time dashboard updates.
 * Silently skips if Convex is not configured or API not generated.
 */
export async function syncUserStatus(data: {
  userId: string;
  lastCheckIn?: Date;
  nextDue?: Date;
  alertLevel?: "L1" | "L2" | "L3" | "L4" | null;
  alertTriggeredAt?: Date | null;
}): Promise<void> {
  if (!convex) return; // Graceful skip if Convex not configured

  try {
    const api = await getApi();
    if (!api) return;

    await convex.mutation(api.alerts.updateUserStatus, {
      userId: data.userId,
      lastCheckIn: data.lastCheckIn?.getTime(),
      nextDue: data.nextDue?.getTime(),
      alertLevel: data.alertLevel,
      alertTriggeredAt: data.alertTriggeredAt?.getTime() ?? undefined,
    });
  } catch (error) {
    // Log but don't throw - sync failures shouldn't break primary operations
    console.error("[Convex sync] Failed to sync user status:", error);
  }
}

/**
 * Check if Convex is configured and available
 */
export function isConvexConfigured(): boolean {
  return convex !== null;
}
