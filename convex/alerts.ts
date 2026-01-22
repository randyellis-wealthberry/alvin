import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current status for a user
 */
export const getUserStatus = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("userStatus")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return status;
  },
});

/**
 * Update or create user status (upsert pattern)
 */
export const updateUserStatus = mutation({
  args: {
    userId: v.string(),
    lastCheckIn: v.optional(v.number()),
    nextDue: v.optional(v.number()),
    alertLevel: v.optional(
      v.union(
        v.literal("L1"),
        v.literal("L2"),
        v.literal("L3"),
        v.literal("L4"),
        v.null()
      )
    ),
    alertTriggeredAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Find existing status for this user
    const existing = await ctx.db
      .query("userStatus")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // Patch existing record with provided fields
      const patchData: Record<string, unknown> = {};
      if (updates.lastCheckIn !== undefined)
        patchData.lastCheckIn = updates.lastCheckIn;
      if (updates.nextDue !== undefined) patchData.nextDue = updates.nextDue;
      if (updates.alertLevel !== undefined)
        patchData.alertLevel = updates.alertLevel;
      if (updates.alertTriggeredAt !== undefined)
        patchData.alertTriggeredAt = updates.alertTriggeredAt;

      await ctx.db.patch(existing._id, patchData);
      return existing._id;
    } else {
      // Insert new record
      const statusId = await ctx.db.insert("userStatus", {
        userId,
        lastCheckIn: updates.lastCheckIn,
        nextDue: updates.nextDue,
        alertLevel: updates.alertLevel,
        alertTriggeredAt: updates.alertTriggeredAt,
      });
      return statusId;
    }
  },
});
