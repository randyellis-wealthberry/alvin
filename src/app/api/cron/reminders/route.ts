import { Resend } from "resend";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { ReminderEmail } from "~/emails/ReminderEmail";
import {
  findUsersNeedingReminders,
  type UserNeedingReminder,
} from "~/lib/reminders/eligibility";

// Initialize Resend client (only if API key is configured)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Base URL for check-in links (should come from env in production)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface EmailResult {
  userId: string;
  email: string;
  success: boolean;
  error?: string;
}

/**
 * Send a reminder email to a single user.
 *
 * @param user - User needing reminder
 * @returns Result of email send attempt
 */
async function sendReminderEmail(
  user: UserNeedingReminder
): Promise<EmailResult> {
  if (!user.email) {
    return {
      userId: user.userId,
      email: "none",
      success: false,
      error: "No email address",
    };
  }

  if (!resend) {
    // Log for debugging but treat as "success" to not block cron
    console.log(
      `[Cron] RESEND_API_KEY not configured, skipping email to ${user.email}`
    );
    return {
      userId: user.userId,
      email: user.email,
      success: false,
      error: "RESEND_API_KEY not configured",
    };
  }

  try {
    const lastCheckInText = user.lastCheckInAt
      ? formatLastCheckIn(user.lastCheckInAt)
      : "never";

    const checkInUrl = `${APP_URL}/check-in`;

    const { error } = await resend.emails.send({
      from: "ALVIN <onboarding@resend.dev>",
      to: user.email,
      subject: "Time for your ALVIN check-in",
      react: ReminderEmail({
        userName: user.name ?? "there",
        checkInUrl,
        lastCheckIn: lastCheckInText,
      }),
    });

    if (error) {
      console.error(`[Cron] Failed to send email to ${user.email}:`, error);
      return {
        userId: user.userId,
        email: user.email,
        success: false,
        error: error.message,
      };
    }

    console.log(`[Cron] Sent reminder email to ${user.email}`);
    return {
      userId: user.userId,
      email: user.email,
      success: true,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[Cron] Exception sending email to ${user.email}:`,
      errorMessage
    );
    return {
      userId: user.userId,
      email: user.email,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Format last check-in date for display in email.
 */
function formatLastCheckIn(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  return "recently";
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

    // Send emails to all users (don't let one failure stop others)
    const results: EmailResult[] = [];
    for (const user of usersNeedingReminders) {
      const result = await sendReminderEmail(user);
      results.push(result);
    }

    // Summarize results
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const errors = results
      .filter((r) => !r.success && r.error)
      .map((r) => `${r.email}: ${r.error}`);

    console.log(`[Cron] Email summary: ${sent} sent, ${failed} failed`);

    // Return success response (never expose user data in response)
    return NextResponse.json({
      success: true,
      sent,
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
