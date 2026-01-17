import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  rateLimitMiddleware,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    // Find existing profile or create one with defaults
    const existing = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (existing) {
      return existing;
    }

    // Create default profile
    return ctx.db.userProfile.create({
      data: {
        userId: ctx.session.user.id,
        checkInFrequencyHours: 24,
        timezone: "UTC",
        isActive: true,
      },
    });
  }),

  update: protectedProcedure
    .use(rateLimitMiddleware)
    .input(
      z.object({
        checkInFrequencyHours: z.number().min(1).max(168),
        preferredCheckInTime: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .nullable()
          .optional(),
        timezone: z.string(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.update({
        where: { userId: ctx.session.user.id },
        data: {
          checkInFrequencyHours: input.checkInFrequencyHours,
          preferredCheckInTime: input.preferredCheckInTime ?? null,
          timezone: input.timezone,
          isActive: input.isActive,
        },
      });
    }),
});
