import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get recent activities for a user, ordered by timestamp descending
 */
export const getRecentActivities = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return activities;
  },
});

/**
 * Add a new activity record
 */
export const addActivity = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("check-in"),
      v.literal("alert"),
      v.literal("conversation"),
    ),
    description: v.string(),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activities", {
      userId: args.userId,
      type: args.type,
      description: args.description,
      timestamp: args.timestamp,
      metadata: args.metadata,
    });

    return activityId;
  },
});
