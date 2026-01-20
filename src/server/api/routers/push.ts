/**
 * Push Notification Router
 *
 * tRPC router for managing push notification subscriptions.
 * Provides subscribe, unsubscribe, status, and test notification endpoints.
 */

import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { sendPushToUser } from "~/lib/push";

// Input validation schemas
const subscribeInput = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

const unsubscribeInput = z.object({
  endpoint: z.string().url(),
});

const testNotificationInput = z
  .object({
    message: z.string().optional(),
  })
  .optional();

export const pushRouter = createTRPCRouter({
  /**
   * Subscribe to push notifications
   * Creates or updates a push subscription for the current user
   */
  subscribe: protectedProcedure
    .input(subscribeInput)
    .mutation(async ({ ctx, input }) => {
      // Get user profile ID
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!profile) {
        throw new Error("User profile not found");
      }

      // Upsert subscription (update if endpoint exists, create if not)
      const subscription = await ctx.db.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        update: {
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: input.userAgent,
        },
        create: {
          userProfileId: profile.id,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: input.userAgent,
        },
      });

      return { success: true, subscriptionId: subscription.id };
    }),

  /**
   * Unsubscribe from push notifications
   * Deletes the push subscription for the given endpoint
   */
  unsubscribe: protectedProcedure
    .input(unsubscribeInput)
    .mutation(async ({ ctx, input }) => {
      // Get user profile ID
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!profile) {
        throw new Error("User profile not found");
      }

      // Delete subscription only if it belongs to the current user
      await ctx.db.pushSubscription.deleteMany({
        where: {
          endpoint: input.endpoint,
          userProfileId: profile.id,
        },
      });

      return { success: true };
    }),

  /**
   * Get push notification status
   * Returns whether push is enabled and the number of subscriptions
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    // Get user profile ID
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return { enabled: false, subscriptionCount: 0 };
    }

    // Count active subscriptions
    const subscriptionCount = await ctx.db.pushSubscription.count({
      where: { userProfileId: profile.id },
    });

    return {
      enabled: subscriptionCount > 0,
      subscriptionCount,
    };
  }),

  /**
   * Send a test notification
   * Sends a test push notification to all of the user's subscribed devices
   */
  testNotification: protectedProcedure
    .input(testNotificationInput)
    .mutation(async ({ ctx, input }) => {
      // Get user profile ID
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!profile) {
        throw new Error("User profile not found");
      }

      // Get subscription count first
      const subscriptionCount = await ctx.db.pushSubscription.count({
        where: { userProfileId: profile.id },
      });

      if (subscriptionCount === 0) {
        return { sent: 0, failed: 0 };
      }

      // Send test notification
      const successCount = await sendPushToUser(profile.id, {
        title: "ALVIN Test",
        body: input?.message ?? "This is a test notification from ALVIN!",
        url: "/dashboard",
        tag: "test",
      });

      return {
        sent: successCount,
        failed: subscriptionCount - successCount,
      };
    }),
});
