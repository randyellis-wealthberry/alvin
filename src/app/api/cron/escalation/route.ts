import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  findUsersNeedingAlerts,
  findAlertsNeedingEscalation,
  getNextLevel,
} from "~/lib/alerts/escalation";

/**
 * Cron endpoint for creating and escalating alerts.
 *
 * Security: Requires valid CRON_SECRET in Authorization header.
 * Vercel Cron automatically sends the secret as a Bearer token.
 *
 * Schedule: Runs hourly (configured in vercel.json)
 *
 * Flow:
 * 1. Find users who are overdue and don't have an active alert - create LEVEL_1 alerts
 * 2. Find alerts that need escalation - escalate to next level
 *
 * Note: Contact notifications (L3/L4) will be added in Phase 8.
 *
 * @returns JSON with alertsCreated/alertsEscalated counts
 */
export async function GET(request: NextRequest) {
  // Validate CRON_SECRET
  const authHeader = request.headers.get("Authorization");
  const expectedToken = `Bearer ${env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Step 1: Create alerts for users needing them
    const usersNeedingAlerts = await findUsersNeedingAlerts();
    let alertsCreated = 0;

    for (const user of usersNeedingAlerts) {
      await db.alert.create({
        data: {
          userProfileId: user.profileId,
          level: "LEVEL_1",
          triggeredAt: now,
        },
      });
      console.log(
        `[Escalation] Created LEVEL_1 alert for user ${user.userId} (profile: ${user.profileId})`
      );
      alertsCreated++;
    }

    // Step 2: Escalate alerts that need it
    const alertsNeedingEscalation = await findAlertsNeedingEscalation();
    let alertsEscalated = 0;

    for (const alert of alertsNeedingEscalation) {
      const nextLevel = getNextLevel(alert.level);

      if (nextLevel) {
        await db.alert.update({
          where: { id: alert.id },
          data: {
            level: nextLevel,
            lastEscalatedAt: now,
          },
        });
        console.log(
          `[Escalation] Escalated alert ${alert.id} from ${alert.level} to ${nextLevel}`
        );
        alertsEscalated++;
      }
    }

    console.log(
      `[Escalation] Summary: ${alertsCreated} created, ${alertsEscalated} escalated`
    );

    return NextResponse.json({
      success: true,
      alertsCreated,
      alertsEscalated,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Escalation] Error processing escalation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
