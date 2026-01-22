import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import {
  findUsersNeedingReminders,
  type UserNeedingReminder,
} from "~/lib/reminders/eligibility";
import {
  sendUserNotification,
  getNotificationWithEmail,
  type NotificationResult,
} from "~/lib/notifications";

interface ReminderResult {
  userId: string;
  channel: "push" | "email" | "sms" | "none";
  success: boolean;
  error?: string;
}

/**
 * Send a reminder notification to a single user.
 * Uses push-first, email-fallback, SMS-tertiary pattern via unified notification service.
 *
 * Fallback order: push -> email -> SMS
 *
 * @param user - User needing reminder
 * @returns Result of notification attempt
 */
async function sendReminderNotification(
  user: UserNeedingReminder
): Promise<ReminderResult> {
  try {
    const template = getNotificationWithEmail("CHECKIN_REMINDER");

    const result: NotificationResult = await sendUserNotification({
      userProfileId: user.profileId,
      ...template,
      userEmail: user.email ?? undefined,
      userPhone: user.phone ?? undefined,
    });

    console.log(
      `[Cron] Sent ${result.channel} reminder to user ${user.userId} (${result.sent} delivered)`
    );

    return {
      userId: user.userId,
      channel: result.channel,
      success: result.sent > 0,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[Cron] Exception sending reminder to user ${user.userId}:`,
      errorMessage
    );
    return {
      userId: user.userId,
      channel: "none",
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Cron endpoint for sending check-in reminder emails.
 *
 * Security: Requires valid CRON_SECRET in Authorization header.
 * Vercel Cron automatically sends the secret as a Bearer token.
 *
 * Schedule: Runs hourly (configured in vercel.json)
 *
 * @returns JSON with sent/failed counts and errors
 */
export async function GET(request: NextRequest) {
  // Validate CRON_SECRET
  const authHeader = request.headers.get("Authorization");
  const expectedToken = `Bearer ${env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find users who need reminders
    const usersNeedingReminders = await findUsersNeedingReminders();

    if (usersNeedingReminders.length === 0) {
      console.log("[Cron] No users need reminders at this time.");
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        errors: [],
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      `[Cron] Found ${usersNeedingReminders.length} users needing reminders`
    );

    // Send notifications to all users (don't let one failure stop others)
    const results: ReminderResult[] = [];
    for (const user of usersNeedingReminders) {
      const result = await sendReminderNotification(user);
      results.push(result);
    }

    // Summarize results by channel
    const pushSent = results.filter((r) => r.channel === "push" && r.success).length;
    const emailSent = results.filter((r) => r.channel === "email" && r.success).length;
    const smsSent = results.filter((r) => r.channel === "sms" && r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const errors = results
      .filter((r) => !r.success && r.error)
      .map((r) => `${r.userId}: ${r.error}`);

    console.log(`[Cron] Notification summary: ${pushSent} push, ${emailSent} email, ${smsSent} sms, ${failed} failed`);

    // Return success response (never expose user data in response)
    return NextResponse.json({
      success: true,
      sent: pushSent + emailSent + smsSent,
      pushSent,
      emailSent,
      smsSent,
      failed,
      errors: errors.slice(0, 10), // Limit error list to prevent large responses
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error processing reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
