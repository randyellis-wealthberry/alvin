import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Activities table for real-time activity feed
  activities: defineTable({
    userId: v.string(), // NextAuth user ID (not Convex ID)
    type: v.union(
      v.literal("check-in"),
      v.literal("alert"),
      v.literal("conversation")
    ),
    description: v.string(),
    timestamp: v.number(), // Unix timestamp ms
    metadata: v.optional(v.any()), // Flexible JSON for type-specific data
  })
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  // User status table (singleton per user)
  userStatus: defineTable({
    userId: v.string(),
    lastCheckIn: v.optional(v.number()), // Unix timestamp
    nextDue: v.optional(v.number()), // Unix timestamp
    alertLevel: v.optional(
      v.union(
        v.literal("L1"),
        v.literal("L2"),
        v.literal("L3"),
        v.literal("L4"),
        v.null_()
      )
    ),
    alertTriggeredAt: v.optional(v.number()), // Unix timestamp
  }).index("by_user", ["userId"]),
});
