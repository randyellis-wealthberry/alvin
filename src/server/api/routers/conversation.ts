import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const conversationRouter = createTRPCRouter({
  // Create a new conversation
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // Get or create user profile (required for conversation)
    let profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      profile = await ctx.db.userProfile.create({
        data: { userId: ctx.session.user.id },
      });
    }

    const conversation = await ctx.db.conversation.create({
      data: { userProfileId: profile.id },
    });

    return conversation;
  }),

  // Get all conversations for current user (most recent first)
  list: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) return [];

    return ctx.db.conversation.findMany({
      where: { userProfileId: profile.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }),

  // Get a single conversation with messages
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) return null;

      return ctx.db.conversation.findUnique({
        where: {
          id: input.id,
          userProfileId: profile.id, // Ensure user owns conversation
        },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });
    }),

  // Save messages to a conversation (called from API route)
  saveMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) throw new Error("Profile not found");

      // Verify ownership
      const conversation = await ctx.db.conversation.findUnique({
        where: {
          id: input.conversationId,
          userProfileId: profile.id,
        },
      });

      if (!conversation) throw new Error("Conversation not found");

      // Create messages
      await ctx.db.message.createMany({
        data: input.messages.map((msg) => ({
          conversationId: input.conversationId,
          role: msg.role,
          content: msg.content,
        })),
      });

      // Update conversation timestamp
      await ctx.db.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      return { success: true };
    }),
});
