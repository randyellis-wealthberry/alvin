import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  findUsersNeedingAlerts,
  findAlertsNeedingEscalation,
  getNextLevel,
} from "~/lib/alerts/escalation";
import {
  notifyPrimaryContact,
  notifyAllContacts,
} from "~/lib/alerts/notifications";
import {
  sendUserNotification,
  NOTIFICATION_TEMPLATES,
} from "~/lib/notifications";

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
 * 3. Send notifications on L3/L4 transitions:
 *    - L3: Notify primary contact only
 *    - L4: Notify all contacts (batch)
 *
 * @returns JSON with alertsCreated/alertsEscalated/notification counts
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
    let userPushNotifications = 0;

    for (const user of usersNeedingAlerts) {
      await db.alert.create({
        data: {
          userProfileId: user.profileId,
          level: "LEVEL_1",
          triggeredAt: now,
        },
      });
      console.log(
        `[Escalation] Created LEVEL_1 alert for user ${user.userId} (profile: ${user.profileId})`,
      );
      alertsCreated++;

      // Send push notification to user for L1
      const pushResult = await sendUserNotification({
        userProfileId: user.profileId,
        ...NOTIFICATION_TEMPLATES.ESCALATION_L1,
      });
      if (pushResult.sent > 0) {
        userPushNotifications++;
      }
    }

    // Step 2: Escalate alerts that need it and send notifications for L3/L4
    const alertsNeedingEscalation = await findAlertsNeedingEscalation();
    let alertsEscalated = 0;
    let notificationsL3 = 0;
    let notificationsL4 = 0;

    for (const alert of alertsNeedingEscalation) {
      const nextLevel = getNextLevel(alert.level);

      if (nextLevel) {
        // Update alert and get the full updated record
        const updatedAlert = await db.alert.update({
          where: { id: alert.id },
          data: {
            level: nextLevel,
            lastEscalatedAt: now,
          },
        });
        console.log(
          `[Escalation] Escalated alert ${alert.id} from ${alert.level} to ${nextLevel}`,
        );
        alertsEscalated++;

        // Send push notification to user at each escalation level
        if (updatedAlert.userProfileId) {
          const template =
            nextLevel === "LEVEL_2"
              ? NOTIFICATION_TEMPLATES.ESCALATION_L2
              : nextLevel === "LEVEL_3"
                ? NOTIFICATION_TEMPLATES.ESCALATION_L3
                : nextLevel === "LEVEL_4"
                  ? NOTIFICATION_TEMPLATES.ESCALATION_L4
                  : null;

          if (template) {
            const pushResult = await sendUserNotification({
              userProfileId: updatedAlert.userProfileId,
              ...template,
            });
            if (pushResult.sent > 0) {
              userPushNotifications++;
            }
          }
        }

        // Send email notifications to family contacts for L3 and L4 transitions
        if (nextLevel === "LEVEL_3" || nextLevel === "LEVEL_4") {
          // Fetch profile with user for name, and contacts for notifications
          if (updatedAlert.userProfileId) {
            const profileWithUserAndContacts = await db.userProfile.findUnique({
              where: { id: updatedAlert.userProfileId },
              include: {
                user: true,
                contacts: true,
              },
            });

            if (profileWithUserAndContacts) {
              if (nextLevel === "LEVEL_3") {
                const result = await notifyPrimaryContact(
                  updatedAlert,
                  profileWithUserAndContacts,
                  profileWithUserAndContacts.contacts,
                );
                if (result.success) {
                  notificationsL3++;
                }
              } else if (nextLevel === "LEVEL_4") {
                const result = await notifyAllContacts(
                  updatedAlert,
                  profileWithUserAndContacts,
                  profileWithUserAndContacts.contacts,
                );
                notificationsL4 += result.sent;
              }
            }
          }
        }
      }
    }

    console.log(
      `[Escalation] Summary: ${alertsCreated} created, ${alertsEscalated} escalated, user push: ${userPushNotifications}, L3 family: ${notificationsL3}, L4 family: ${notificationsL4}`,
    );

    return NextResponse.json({
      success: true,
      alertsCreated,
      alertsEscalated,
      userPushNotifications,
      notificationsL3,
      notificationsL4,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Escalation] Error processing escalation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
