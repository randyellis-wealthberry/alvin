/**
 * Push Notification Service
 *
 * Server-side utilities for sending Web Push notifications.
 * Uses web-push library with VAPID authentication.
 */

import webpush from "web-push";
import { env } from "~/env";
import { db } from "~/server/db";

// Configure web-push with VAPID details
webpush.setVapidDetails(
  `mailto:${env.VAPID_CONTACT_EMAIL}`,
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

/**
 * Push notification payload structure
 */
export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Push subscription structure (from database)
 */
export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Result of a push notification send attempt
 */
export interface PushResult {
  success: boolean;
  reason?: "expired" | "error";
  error?: Error;
}

/**
 * Send a push notification to a single subscription
 *
 * @param subscription - The push subscription data
 * @param payload - The notification payload
 * @returns Result indicating success or failure
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
): Promise<PushResult> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: "high",
      },
    );
    return { success: true };
  } catch (error) {
    // Handle expired/invalid subscriptions
    if (
      error instanceof Error &&
      "statusCode" in error &&
      (error.statusCode === 410 || error.statusCode === 404)
    ) {
      return { success: false, reason: "expired" };
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Send a push notification to all of a user's subscribed devices
 *
 * @param userProfileId - The user profile ID to send notifications to
 * @param payload - The notification payload
 * @returns Count of successful sends
 */
export async function sendPushToUser(
  userProfileId: string,
  payload: PushPayload,
): Promise<number> {
  // Fetch all subscriptions for this user
  const subscriptions = await db.pushSubscription.findMany({
    where: { userProfileId },
  });

  if (subscriptions.length === 0) {
    return 0;
  }

  let successCount = 0;
  const expiredEndpoints: string[] = [];

  // Send to all subscriptions (user may have multiple devices)
  for (const subscription of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
      payload,
    );

    if (result.success) {
      successCount++;
    } else if (result.reason === "expired") {
      expiredEndpoints.push(subscription.endpoint);
    }
  }

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    await db.pushSubscription.deleteMany({
      where: {
        endpoint: { in: expiredEndpoints },
      },
    });
  }

  return successCount;
}

// Export configured webpush instance for advanced usage
export { webpush };
