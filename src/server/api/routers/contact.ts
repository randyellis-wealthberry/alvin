import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  rateLimitMiddleware,
} from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Find user's profile first
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      return [];
    }

    // Return all non-deleted contacts ordered by priority
    return ctx.db.contact.findMany({
      where: {
        userProfileId: profile.id,
        deletedAt: null,
      },
      orderBy: {
        priority: "asc",
      },
    });
  }),

  create: protectedProcedure
    .use(rateLimitMiddleware)
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
        phone: z.string().optional(),
        relationship: z.string().optional(),
        priority: z.number().int().min(1).default(999),
        notifyByEmail: z.boolean().default(true),
        notifyBySms: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find or create user's profile
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

      // Create contact linked to profile
      return ctx.db.contact.create({
        data: {
          userProfileId: profile.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          relationship: input.relationship,
          priority: input.priority,
          notifyByEmail: input.notifyByEmail,
          notifyBySms: input.notifyBySms,
        },
      });
    }),

  update: protectedProcedure
    .use(rateLimitMiddleware)
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional().nullable(),
        relationship: z.string().optional().nullable(),
        priority: z.number().int().min(1).optional(),
        notifyByEmail: z.boolean().optional(),
        notifyBySms: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify contact belongs to user's profile
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      const contact = await ctx.db.contact.findUnique({
        where: { id: input.id },
      });

      if (contact?.userProfileId !== profile.id) {
        throw new Error("Contact not found");
      }

      // Update only provided fields
      const { id, ...updateData } = input;
      return ctx.db.contact.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .use(rateLimitMiddleware)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify contact belongs to user's profile
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      const contact = await ctx.db.contact.findUnique({
        where: { id: input.id },
      });

      if (contact?.userProfileId !== profile.id) {
        throw new Error("Contact not found");
      }

      // Soft delete: set deletedAt timestamp
      return ctx.db.contact.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),
});
