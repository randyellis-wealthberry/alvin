import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ACTIVE_LEVELS } from "~/lib/alerts/escalation";
import { calculateNextCheckInDue } from "~/lib/reminders/eligibility";

// Activity types for the unified log
type ActivityType = "check-in" | "alert" | "conversation";

interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: Date;
  description: string;
  metadata: Record<string, unknown>;
}

export const dashboardRouter = createTRPCRouter({
  /**
   * Get the current status of the user's ALVIN account.
   * Returns last check-in, next due date, days until due, and active alert info.
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    // Get profile with relevant data
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!profile) {
      return {
        lastCheckIn: null,
        nextDue: null,
        daysUntilDue: null,
        activeAlert: null,
        alertLevel: null,
      };
    }

    // Calculate next check-in due using existing function
    const nextDue = calculateNextCheckInDue(profile);

    // Calculate days until due (negative means overdue)
    const now = new Date();
    const diffMs = nextDue.getTime() - now.getTime();
    const daysUntilDue = diffMs / (1000 * 60 * 60 * 24);

    // Get active alert if any
    const activeAlert = await ctx.db.alert.findFirst({
      where: {
        userProfileId: profile.id,
        level: { in: ACTIVE_LEVELS },
      },
      orderBy: { triggeredAt: "desc" },
    });

    return {
      lastCheckIn: profile.lastCheckInAt,
      nextDue,
      daysUntilDue: Math.round(daysUntilDue * 10) / 10, // Round to 1 decimal
      activeAlert: activeAlert
        ? {
            id: activeAlert.id,
            level: activeAlert.level,
            triggeredAt: activeAlert.triggeredAt,
          }
        : null,
      alertLevel: activeAlert?.level ?? null,
    };
  }),

  /**
   * Get a unified activity log of check-ins, alerts, and conversations.
   * Sorted by timestamp descending.
   */
  getActivityLog: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      // Get profile
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        return [];
      }

      // Fetch all three types of activities in parallel
      const [checkIns, alerts, conversations] = await Promise.all([
        ctx.db.checkIn.findMany({
          where: { userProfileId: profile.id },
          orderBy: { performedAt: "desc" },
          take: limit,
        }),
        ctx.db.alert.findMany({
          where: { userProfileId: profile.id },
          orderBy: { triggeredAt: "desc" },
          take: limit,
        }),
        ctx.db.conversation.findMany({
          where: { userProfileId: profile.id },
          orderBy: { updatedAt: "desc" },
          take: limit,
          include: {
            _count: {
              select: { messages: true },
            },
          },
        }),
      ]);

      // Transform to unified activity items
      const activities: ActivityItem[] = [];

      // Add check-ins
      for (const checkIn of checkIns) {
        const methodLabel =
          checkIn.method === "MANUAL"
            ? "Manual"
            : checkIn.method === "BIOMETRIC"
              ? "Biometric"
              : checkIn.method === "CONVERSATION"
                ? "Conversation"
                : checkIn.method;

        activities.push({
          id: `checkin-${checkIn.id}`,
          type: "check-in",
          timestamp: checkIn.performedAt,
          description: `Checked in via ${methodLabel}`,
          metadata: { method: checkIn.method },
        });
      }

      // Add alerts
      for (const alert of alerts) {
        let description: string;
        if (alert.level === "RESOLVED") {
          description = "Alert resolved";
        } else if (alert.level === "CANCELLED") {
          description = "Alert cancelled";
        } else {
          description = `Alert ${alert.level.replace("_", " ")} triggered`;
        }

        // Use the most recent relevant timestamp
        const timestamp = alert.resolvedAt ?? alert.cancelledAt ?? alert.lastEscalatedAt ?? alert.triggeredAt;

        activities.push({
          id: `alert-${alert.id}`,
          type: "alert",
          timestamp,
          description,
          metadata: {
            level: alert.level,
            triggeredAt: alert.triggeredAt,
            resolvedAt: alert.resolvedAt,
            cancelledAt: alert.cancelledAt,
          },
        });
      }

      // Add conversations
      for (const conversation of conversations) {
        const messageCount = conversation._count.messages;
        activities.push({
          id: `conversation-${conversation.id}`,
          type: "conversation",
          timestamp: conversation.updatedAt,
          description: `Conversation with ALVIN (${messageCount} message${messageCount === 1 ? "" : "s"})`,
          metadata: {
            conversationId: conversation.id,
            messageCount,
            createdAt: conversation.createdAt,
          },
        });
      }

      // Sort by timestamp descending and limit
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return activities.slice(0, limit);
    }),
});
