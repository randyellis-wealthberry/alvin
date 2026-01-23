/**
 * Unified Notification Service
 *
 * Push-first, email-fallback, SMS-tertiary notification system.
 * Sends push notifications to user's devices, falls back to email, then SMS.
 *
 * Fallback order: push -> email -> SMS -> none
 */

import { Resend } from "resend";
import { env } from "~/env";
import { sendPushToUser, type PushPayload } from "~/lib/push";
import { sendSMS } from "~/lib/sms";

// Initialize Resend client (only if API key is configured)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Notification templates for ALVIN events
 */
export const NOTIFICATION_TEMPLATES = {
  CHECKIN_REMINDER: {
    title: "Time to Check In",
    body: "ALVIN is waiting to hear from you. Tap to confirm you're okay.",
    url: "/check-in",
    tag: "reminder",
  },
  ESCALATION_L1: {
    title: "Check-in Overdue",
    body: "You missed your check-in. Please respond soon.",
    url: "/check-in",
    tag: "reminder",
  },
  ESCALATION_L2: {
    title: "Urgent: Check-in Required",
    body: "We haven't heard from you. Your contacts will be notified soon.",
    url: "/check-in",
    tag: "reminder",
  },
  ESCALATION_L3: {
    title: "Family Notified",
    body: "Your emergency contacts have been alerted.",
    url: "/dashboard",
    tag: "escalation-L3",
  },
  ESCALATION_L4: {
    title: "Critical Alert",
    body: "All contacts have been notified. Please respond immediately.",
    url: "/check-in",
    tag: "escalation-L4",
  },
  ALERT_CANCELLED: {
    title: "You're Back!",
    body: "Your alert has been cancelled. Your contacts have been notified.",
    url: "/dashboard",
    tag: "alert-cancelled",
  },
} as const;

/**
 * Result of a notification send attempt
 */
export interface NotificationResult {
  channel: "push" | "email" | "sms" | "none";
  sent: number;
}

/**
 * Input for sending a user notification
 */
export interface UserNotificationInput {
  userProfileId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  emailSubject?: string;
  emailHtml?: string;
  userEmail?: string;
  userPhone?: string; // E.164 format (e.g., +14155551234)
}

/**
 * Send a notification to a user via push (primary), email (fallback), or SMS (tertiary).
 *
 * Tries push first. If push succeeds (sent > 0), returns immediately.
 * If push fails (no subscriptions), falls back to email if provided.
 * If email fails or not available, falls back to SMS if provided.
 *
 * Fallback order: push -> email -> SMS -> none
 *
 * @param input - Notification parameters
 * @returns Result indicating which channel was used and count sent
 */
export async function sendUserNotification(
  input: UserNotificationInput,
): Promise<NotificationResult> {
  const {
    userProfileId,
    title,
    body,
    url,
    tag,
    emailSubject,
    emailHtml,
    userEmail,
    userPhone,
  } = input;

  // Build push payload
  const pushPayload: PushPayload = {
    title,
    body,
    url,
    tag,
    requireInteraction: true,
  };

  // Try push first
  try {
    const pushSent = await sendPushToUser(userProfileId, pushPayload);

    if (pushSent > 0) {
      console.log(
        `[Notification] Sent push to ${pushSent} device(s) for profile ${userProfileId}`,
      );
      return { channel: "push", sent: pushSent };
    }
  } catch (error) {
    console.error(
      `[Notification] Push failed for profile ${userProfileId}:`,
      error,
    );
    // Fall through to email
  }

  // No push subscriptions or push failed, try email fallback
  if (userEmail && emailSubject && emailHtml && resend) {
    try {
      const { error } = await resend.emails.send({
        from: "ALVIN <onboarding@resend.dev>",
        to: userEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      if (!error) {
        console.log(
          `[Notification] Sent fallback email to ${userEmail} for profile ${userProfileId}`,
        );
        return { channel: "email", sent: 1 };
      }

      console.error(
        `[Notification] Email failed for ${userEmail}:`,
        error.message,
      );
    } catch (err) {
      console.error(
        `[Notification] Email exception for ${userEmail}:`,
        err instanceof Error ? err.message : err,
      );
      // Fall through to SMS
    }
  }

  // No push or email, try SMS fallback
  if (userPhone) {
    const smsBody = `${title}\n\n${body}`;
    const smsResult = await sendSMS(userPhone, smsBody);

    if (smsResult.success) {
      console.log(
        `[Notification] Sent fallback SMS to ${userPhone} for profile ${userProfileId}`,
      );
      return { channel: "sms", sent: 1 };
    }

    console.error(
      `[Notification] SMS failed for ${userPhone}:`,
      smsResult.error,
    );
  }

  // Neither push, email, nor SMS succeeded
  console.log(
    `[Notification] No notification sent for profile ${userProfileId} (no push subscriptions, no email/SMS fallback)`,
  );
  return { channel: "none", sent: 0 };
}

/**
 * Helper to get a notification template with email fallback content.
 *
 * @param template - Template key from NOTIFICATION_TEMPLATES
 * @param overrides - Optional overrides for body text
 * @returns Template with emailSubject and emailHtml added
 * @deprecated Use getNotificationWithFallbacks instead
 */
export function getNotificationWithEmail(
  template: keyof typeof NOTIFICATION_TEMPLATES,
  overrides?: { body?: string },
): Omit<UserNotificationInput, "userProfileId" | "userEmail" | "userPhone"> {
  const t = NOTIFICATION_TEMPLATES[template];
  const body = overrides?.body ?? t.body;

  return {
    title: t.title,
    body,
    url: t.url,
    tag: t.tag,
    emailSubject: t.title,
    emailHtml: `<p>${body}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${t.url}">Open ALVIN</a></p>`,
  };
}

/**
 * Output type for notification template with all fallback content
 */
export interface NotificationWithFallbacks {
  title: string;
  body: string;
  url: string;
  tag: string;
  emailSubject: string;
  emailHtml: string;
  smsBody: string;
}

/**
 * Helper to get a notification template with email and SMS fallback content.
 *
 * @param template - Template key from NOTIFICATION_TEMPLATES
 * @param overrides - Optional overrides for body text
 * @returns Template with emailSubject, emailHtml, and smsBody added
 */
export function getNotificationWithFallbacks(
  template: keyof typeof NOTIFICATION_TEMPLATES,
  overrides?: { body?: string },
): NotificationWithFallbacks {
  const t = NOTIFICATION_TEMPLATES[template];
  const body = overrides?.body ?? t.body;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title: t.title,
    body,
    url: t.url,
    tag: t.tag,
    emailSubject: t.title,
    emailHtml: `<p>${body}</p><p><a href="${appUrl}${t.url}">Open ALVIN</a></p>`,
    smsBody: `${t.title}\n\n${body}\n\nOpen ALVIN: ${appUrl}${t.url}`,
  };
}
