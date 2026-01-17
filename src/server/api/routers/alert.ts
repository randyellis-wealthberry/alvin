import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ACTIVE_LEVELS, getNextLevel } from "~/lib/alerts/escalation";

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

      return updatedAlert;
    }),
});
