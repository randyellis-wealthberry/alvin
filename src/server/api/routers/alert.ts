import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ACTIVE_LEVELS, getNextLevel } from "~/lib/alerts/escalation";
import { sendUserNotification, NOTIFICATION_TEMPLATES } from "~/lib/notifications";
import { syncActivity, syncUserStatus } from "~/lib/convex/sync";

export const alertRouter = createTRPCRouter({
  /**
   * List all alerts for the current user's profile.
   * Returns alerts ordered by triggeredAt desc with active/resolved counts.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      return {
        alerts: [],
        activeCount: 0,
        resolvedCount: 0,
        cancelledCount: 0,
      };
    }

    const alerts = await ctx.db.alert.findMany({
      where: { userProfileId: profile.id },
      orderBy: { triggeredAt: "desc" },
    });

    const activeCount = alerts.filter((a) =>
      ACTIVE_LEVELS.includes(a.level)
    ).length;
    const resolvedCount = alerts.filter((a) => a.level === "RESOLVED").length;
    const cancelledCount = alerts.filter((a) => a.level === "CANCELLED").length;

    return {
      alerts,
      activeCount,
      resolvedCount,
      cancelledCount,
    };
  }),

  /**
   * Get the currently active alert for the user's profile.
   * Returns null if no active alert exists.
   */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      return null;
    }

    const activeAlert = await ctx.db.alert.findFirst({
      where: {
        userProfileId: profile.id,
        level: { in: ACTIVE_LEVELS },
      },
      orderBy: { triggeredAt: "desc" },
    });

    return activeAlert;
  }),

  /**
   * Create a new alert at LEVEL_1 for the user's profile.
   * Note: This is primarily for internal use by the cron job, but exposed for testing.
   */
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // Get or create profile
    const profile =
      (await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      })) ??
      (await ctx.db.userProfile.create({
        data: {
          userId: ctx.session.user.id,
          checkInFrequencyHours: 24,
          timezone: "UTC",
          isActive: true,
        },
      }));

    const now = new Date();

    const alert = await ctx.db.alert.create({
      data: {
        userProfileId: profile.id,
        level: "LEVEL_1",
        triggeredAt: now,
      },
    });

    // Sync to Convex for real-time updates (non-critical)
    try {
      await syncActivity({
        userId: ctx.session.user.id,
        type: "alert",
        description: "Alert triggered at Level 1",
        timestamp: now,
      });

      await syncUserStatus({
        userId: ctx.session.user.id,
        alertLevel: "L1",
        alertTriggeredAt: now,
      });
    } catch (e) {
      console.error("Convex sync failed (non-critical):", e);
    }

    return alert;
  }),

  /**
   * Escalate an alert to the next level.
   * Validates that the alert belongs to the user's profile.
   * Note: For internal use by cron job.
   */
  escalate: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      // Fetch alert and validate ownership
      const alert = await ctx.db.alert.findUnique({
        where: { id: input.alertId },
      });

      if (!alert) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alert not found",
        });
      }

      if (alert.userProfileId !== profile.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Alert does not belong to this user",
        });
      }

      // Get next level
      const nextLevel = getNextLevel(alert.level);

      if (!nextLevel) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Alert cannot be escalated further",
        });
      }

      const now = new Date();

      const updatedAlert = await ctx.db.alert.update({
        where: { id: input.alertId },
        data: {
          level: nextLevel,
          lastEscalatedAt: now,
        },
      });

      // Sync to Convex for real-time updates (non-critical)
      try {
        // Map Prisma level to Convex level format
        const levelMap: Record<string, "L1" | "L2" | "L3" | "L4"> = {
          LEVEL_1: "L1",
          LEVEL_2: "L2",
          LEVEL_3: "L3",
          LEVEL_4: "L4",
        };
        const convexLevel = levelMap[nextLevel];

        await syncActivity({
          userId: ctx.session.user.id,
          type: "alert",
          description: `Alert escalated to Level ${nextLevel.replace("LEVEL_", "")}`,
          timestamp: now,
        });

        if (convexLevel) {
          await syncUserStatus({
            userId: ctx.session.user.id,
            alertLevel: convexLevel,
            alertTriggeredAt: alert.triggeredAt,
          });
        }
      } catch (e) {
        console.error("Convex sync failed (non-critical):", e);
      }

      return updatedAlert;
    }),

  /**
   * Cancel an active alert.
   * Validates that the alert belongs to the user's profile and is active.
   */
  cancel: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get profile
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      // Find and validate alert belongs to user and is active
      const alert = await ctx.db.alert.findFirst({
        where: {
          id: input.alertId,
          userProfileId: profile.id,
          level: { in: ACTIVE_LEVELS },
        },
      });

      if (!alert) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active alert not found",
        });
      }

      // Cancel alert
      const cancelledAlert = await ctx.db.alert.update({
        where: { id: alert.id },
        data: {
          level: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: input.reason,
        },
      });

      // Send push notification to user confirming cancellation
      await sendUserNotification({
        userProfileId: profile.id,
        ...NOTIFICATION_TEMPLATES.ALERT_CANCELLED,
      });

      // Sync to Convex for real-time updates (non-critical)
      try {
        await syncActivity({
          userId: ctx.session.user.id,
          type: "alert",
          description: "Alert cancelled",
          timestamp: new Date(),
        });

        await syncUserStatus({
          userId: ctx.session.user.id,
          alertLevel: null,
          alertTriggeredAt: null,
        });
      } catch (e) {
        console.error("Convex sync failed (non-critical):", e);
      }

      return cancelledAlert;
    }),
});
