import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ACTIVE_LEVELS } from "~/lib/alerts/escalation";

export const checkInRouter = createTRPCRouter({
  record: protectedProcedure.mutation(async ({ ctx }) => {
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

    // Find any active alert for this profile
    const activeAlert = await ctx.db.alert.findFirst({
      where: {
        userProfileId: profile.id,
        level: { in: ACTIVE_LEVELS },
      },
    });

    // Use interactive transaction to ensure atomicity
    const checkIn = await ctx.db.$transaction(async (tx) => {
      // Create check-in
      const newCheckIn = await tx.checkIn.create({
        data: {
          userProfileId: profile.id,
          method: "MANUAL",
          performedAt: now,
        },
      });

      // Update lastCheckInAt
      await tx.userProfile.update({
        where: { id: profile.id },
        data: { lastCheckInAt: now },
      });

      // If there's an active alert, resolve it
      if (activeAlert) {
        await tx.alert.update({
          where: { id: activeAlert.id },
          data: {
            level: "RESOLVED",
            resolvedAt: now,
          },
        });
      }

      return newCheckIn;
    });

    return checkIn;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    // Find profile
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      return [];
    }

    // Return check-in history ordered by most recent first
    return ctx.db.checkIn.findMany({
      where: { userProfileId: profile.id },
      orderBy: { performedAt: "desc" },
      take: 20,
    });
  }),
});
