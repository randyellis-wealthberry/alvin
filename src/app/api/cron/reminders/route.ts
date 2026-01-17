import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { findUsersNeedingReminders } from "~/lib/reminders/eligibility";

/**
 * Cron endpoint for checking which users need check-in reminders.
 *
 * Security: Requires valid CRON_SECRET in Authorization header.
 * Vercel Cron automatically sends the secret as a Bearer token.
 *
 * Schedule: Runs hourly (configured in vercel.json)
 *
 * @returns JSON with count of users needing reminders
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

    // Log users who need reminders (email sending will be implemented in 06-02)
    if (usersNeedingReminders.length > 0) {
      console.log(
        `[Cron] Found ${usersNeedingReminders.length} users needing reminders:`
      );
      for (const user of usersNeedingReminders) {
        console.log(
          `  - User ${user.userId} (${user.email ?? "no email"}): last check-in ${
            user.lastCheckInAt?.toISOString() ?? "never"
          }`
        );
      }
    } else {
      console.log("[Cron] No users need reminders at this time.");
    }

    // Return success response (never expose user data in response)
    return NextResponse.json({
      success: true,
      count: usersNeedingReminders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error checking reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
