import { Resend } from "resend";
import { env } from "~/env";
import { ContactAlertEmail } from "~/emails/ContactAlertEmail";
import type { Alert, Contact, User, UserProfile } from "~/../generated/prisma";

// Initialize Resend client (only if API key is configured)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Profile with nested user for notification context
 */
type ProfileWithUser = UserProfile & { user: User };

/**
 * Result of a notification attempt to primary contact
 */
interface PrimaryNotifyResult {
  success: boolean;
  email?: string;
  error?: string;
}

/**
 * Result of batch notification to all contacts
 */
interface BatchNotifyResult {
  sent: number;
  failed: number;
}

/**
 * Format last check-in date as a relative time string.
 *
 * @param date - Last check-in date, or null if never checked in
 * @returns Human-readable relative time (e.g., "2 days ago", "never")
 */
export function formatLastCheckIn(date: Date | null): string {
  if (!date) {
    return "never";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

/**
 * Filter contacts to only those eligible for email notifications.
 *
 * Eligible contacts must:
 * - Not be soft-deleted (deletedAt === null)
 * - Have email notifications enabled (notifyByEmail === true)
 * - Have a valid email address
 *
 * @param contacts - Array of contacts to filter
 * @returns Filtered array of eligible contacts
 */
function getEligibleContacts(contacts: Contact[]): Contact[] {
  return contacts.filter(
    (c) => c.deletedAt === null && c.notifyByEmail && c.email
  );
}

/**
 * Notify the primary contact about an L3 (LEVEL_3) alert.
 *
 * Primary contact is determined by the lowest priority number.
 * Lower priority = higher importance (notified first).
 *
 * @param alert - The alert being escalated
 * @param profile - User profile with nested user data
 * @param contacts - All contacts for the user
 * @returns Result indicating success/failure and email sent to
 */
export async function notifyPrimaryContact(
  alert: Alert,
  profile: ProfileWithUser,
  contacts: Contact[]
): Promise<PrimaryNotifyResult> {
  const eligibleContacts = getEligibleContacts(contacts);

  // Sort by priority (ascending - lower = higher priority) and take first
  const primaryContact = eligibleContacts.sort(
    (a, b) => a.priority - b.priority
  )[0];

  if (!primaryContact) {
    console.log(`[Notification] Alert ${alert.id}: No eligible primary contact`);
    return { success: false, error: "No eligible contact" };
  }

  if (!resend) {
    console.warn(
      `[Notification] Alert ${alert.id}: RESEND_API_KEY not configured, skipping email to ${primaryContact.email}`
    );
    return { success: false, error: "Email not configured" };
  }

  try {
    const userName = profile.user.name ?? "your loved one";
    const lastCheckIn = formatLastCheckIn(profile.lastCheckInAt);

    console.log(
      `[Notification] Notifying primary contact: ${primaryContact.email}`
    );

    const { error } = await resend.emails.send({
      from: "ALVIN Alert <alerts@resend.dev>",
      to: primaryContact.email,
      subject: `We haven't heard from ${userName}`,
      react: ContactAlertEmail({
        contactName: primaryContact.name,
        userName,
        alertLevel: "L3",
        lastCheckIn,
      }),
      tags: [
        { name: "alert_id", value: alert.id },
        { name: "level", value: "LEVEL_3" },
      ],
    });

    if (error) {
      console.error(
        `[Notification] Alert ${alert.id}: Failed to notify ${primaryContact.email}:`,
        error
      );
      return {
        success: false,
        email: primaryContact.email,
        error: error.message,
      };
    }

    console.log(
      `[Notification] Alert ${alert.id}: Notified primary contact ${primaryContact.email}`
    );
    return { success: true, email: primaryContact.email };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[Notification] Alert ${alert.id}: Exception notifying ${primaryContact.email}:`,
      errorMessage
    );
    return {
      success: false,
      email: primaryContact.email,
      error: errorMessage,
    };
  }
}

/**
 * Notify all contacts about an L4 (LEVEL_4) alert.
 *
 * Uses Resend batch API to send up to 100 emails in a single request.
 * This is more efficient than sequential sends and rate-limit friendly.
 *
 * @param alert - The alert being escalated to L4
 * @param profile - User profile with nested user data
 * @param contacts - All contacts for the user
 * @returns Result with count of sent and failed emails
 */
export async function notifyAllContacts(
  alert: Alert,
  profile: ProfileWithUser,
  contacts: Contact[]
): Promise<BatchNotifyResult> {
  const eligibleContacts = getEligibleContacts(contacts);

  if (eligibleContacts.length === 0) {
    console.log(`[Notification] Alert ${alert.id}: No contacts to notify for L4`);
    return { sent: 0, failed: 0 };
  }

  if (!resend) {
    console.warn(
      `[Notification] Alert ${alert.id}: RESEND_API_KEY not configured, skipping ${eligibleContacts.length} emails`
    );
    return { sent: 0, failed: 0 };
  }

  try {
    const userName = profile.user.name ?? "your loved one";
    const lastCheckIn = formatLastCheckIn(profile.lastCheckInAt);

    console.log(
      `[Notification] Notifying ${eligibleContacts.length} contacts for L4 alert`
    );

    const emails = eligibleContacts.map((contact) => ({
      from: "ALVIN Alert <alerts@resend.dev>",
      to: contact.email,
      subject: `Urgent: Please contact ${userName}`,
      react: ContactAlertEmail({
        contactName: contact.name,
        userName,
        alertLevel: "L4",
        lastCheckIn,
      }),
      tags: [
        { name: "alert_id", value: alert.id },
        { name: "level", value: "LEVEL_4" },
      ],
    }));

    const { error } = await resend.batch.send(emails);

    if (error) {
      console.error(
        `[Notification] Alert ${alert.id}: Batch send failed:`,
        error
      );
      return { sent: 0, failed: eligibleContacts.length };
    }

    console.log(
      `[Notification] Alert ${alert.id}: Notified ${eligibleContacts.length} contacts`
    );
    return { sent: eligibleContacts.length, failed: 0 };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[Notification] Alert ${alert.id}: Batch exception:`,
      errorMessage
    );
    return { sent: 0, failed: eligibleContacts.length };
  }
}
