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

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete all user data in transaction
    await ctx.db.$transaction(async (tx) => {
      // Find profile
      const profile = await tx.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (profile) {
        // Delete related data
        await tx.message.deleteMany({
          where: { conversation: { userProfileId: profile.id } },
        });
        await tx.conversation.deleteMany({
          where: { userProfileId: profile.id },
        });
        await tx.checkIn.deleteMany({
          where: { userProfileId: profile.id },
        });
        await tx.alert.deleteMany({
          where: { userProfileId: profile.id },
        });
        await tx.contact.deleteMany({
          where: { userProfileId: profile.id },
        });
        await tx.passkey.deleteMany({
          where: { userProfileId: profile.id },
        });
        await tx.userProfile.delete({
          where: { id: profile.id },
        });
      }

      // Delete user account
      await tx.user.delete({
        where: { id: ctx.session.user.id },
      });
    });

    return { success: true };
  }),
});
