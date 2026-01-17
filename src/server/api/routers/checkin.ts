import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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

    // Create check-in and update lastCheckInAt in a transaction
    const [checkIn] = await ctx.db.$transaction([
      ctx.db.checkIn.create({
        data: {
          userProfileId: profile.id,
          method: "MANUAL",
          performedAt: now,
        },
      }),
      ctx.db.userProfile.update({
        where: { id: profile.id },
        data: { lastCheckInAt: now },
      }),
    ]);

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
