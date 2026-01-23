import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ACTIVE_LEVELS } from "~/lib/alerts/escalation";
import { syncActivity, syncUserStatus } from "~/lib/convex/sync";

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

    // Sync to Convex for real-time updates (non-critical)
    try {
      // Calculate next due time based on check-in frequency
      const nextDue = new Date(
        now.getTime() + profile.checkInFrequencyHours * 60 * 60 * 1000
      );

      await syncActivity({
        userId: ctx.session.user.id,
        type: "check-in",
        description: "Manual check-in completed",
        timestamp: now,
      });

      await syncUserStatus({
        userId: ctx.session.user.id,
        lastCheckIn: now,
        nextDue,
        alertLevel: null, // Check-in clears any alerts
      });
    } catch (e) {
      console.error("Convex sync failed (non-critical):", e);
    }

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

  stats: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      return { totalCheckIns: 0, currentStreak: 0 };
    }

    // Get total check-ins
    const totalCheckIns = await ctx.db.checkIn.count({
      where: { userProfileId: profile.id },
    });

    // Calculate streak (simplified: count consecutive days with check-ins)
    const checkIns = await ctx.db.checkIn.findMany({
      where: { userProfileId: profile.id },
      orderBy: { performedAt: "desc" },
      take: 30,
    });

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - i);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const hasCheckIn = checkIns.some((c) => {
        const checkInDate = new Date(c.performedAt);
        return checkInDate >= targetDate && checkInDate < nextDate;
      });

      if (hasCheckIn) {
        currentStreak++;
      } else if (i > 0) {
        // Allow missing today, but break on earlier gaps
        break;
      }
    }

    return { totalCheckIns, currentStreak };
  }),
});
