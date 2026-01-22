import { Resend } from "resend";
import { env } from "~/env";
import { ContactAlertEmail } from "~/emails/ContactAlertEmail";
import { sendSMS } from "~/lib/sms";
import type { Alert, Contact, User, UserProfile } from "~/../generated/prisma";

// Initialize Resend client (only if API key is configured)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * SMS message templates for family contact notifications (plain text).
 * L3 is courteous/concerned tone, L4 is urgent.
 */
const SMS_TEMPLATES = {
  L3: (contactName: string, userName: string, lastCheckIn: string) =>
    `Hi ${contactName}, ALVIN hasn't heard from ${userName} since ${lastCheckIn}. This is a courtesy notification - please reach out when you can.`,
  L4: (contactName: string, userName: string, lastCheckIn: string) =>
    `URGENT: ${contactName}, ${userName} has not responded to ALVIN for an extended period (last check-in: ${lastCheckIn}). Please contact them immediately.`,
};

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
  smsSuccess?: boolean;
  error?: string;
}

/**
 * Result of batch notification to all contacts
 */
interface BatchNotifyResult {
  sent: number;
  failed: number;
  smsSent: number;
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
 * Filter contacts to only those eligible for SMS notifications.
 *
 * Eligible contacts must:
 * - Not be soft-deleted (deletedAt === null)
 * - Have SMS notifications enabled (notifyBySms === true)
 * - Have a valid phone number
 *
 * @param contacts - Array of contacts to filter
 * @returns Filtered array of eligible contacts
 */
function getEligibleContactsForSms(contacts: Contact[]): Contact[] {
  return contacts.filter(
    (c) => c.deletedAt === null && c.notifyBySms && c.phone
  );
}

/**
 * Notify the primary contact about an L3 (LEVEL_3) alert.
 *
 * Primary contact is determined by the lowest priority number.
 * Lower priority = higher importance (notified first).
 *
 * SMS is sent in addition to email if the contact has notifyBySms enabled.
 *
 * @param alert - The alert being escalated
 * @param profile - User profile with nested user data
 * @param contacts - All contacts for the user
 * @returns Result indicating success/failure and channels used
 */
export async function notifyPrimaryContact(
  alert: Alert,
  profile: ProfileWithUser,
  contacts: Contact[]
): Promise<PrimaryNotifyResult> {
  const eligibleContacts = getEligibleContacts(contacts);
  const smsEligibleContacts = getEligibleContactsForSms(contacts);

  // Sort by priority (ascending - lower = higher priority) and take first
  const primaryContact = eligibleContacts.sort(
    (a, b) => a.priority - b.priority
  )[0];

  // Also check if primary contact is SMS-eligible (may be different if no email-eligible contacts)
  const smsPrimaryContact = smsEligibleContacts.sort(
    (a, b) => a.priority - b.priority
  )[0];

  // If no eligible contacts for either channel, return early
  if (!primaryContact && !smsPrimaryContact) {
    console.log(`[Notification] Alert ${alert.id}: No eligible primary contact for email or SMS`);
    return { success: false, error: "No eligible contact" };
  }

  const userName = profile.user.name ?? "your loved one";
  const lastCheckIn = formatLastCheckIn(profile.lastCheckInAt);

  let emailSuccess = false;
  let emailError: string | undefined;

  // Send email to primary contact if email-eligible
  if (primaryContact && resend) {
    try {
      console.log(
        `[Notification] Notifying primary contact by email: ${primaryContact.email}`
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
        emailError = error.message;
      } else {
        console.log(
          `[Notification] Alert ${alert.id}: Notified primary contact ${primaryContact.email}`
        );
        emailSuccess = true;
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `[Notification] Alert ${alert.id}: Exception notifying ${primaryContact.email}:`,
        emailError
      );
    }
  } else if (primaryContact && !resend) {
    console.warn(
      `[Notification] Alert ${alert.id}: RESEND_API_KEY not configured, skipping email to ${primaryContact.email}`
    );
    emailError = "Email not configured";
  }

  // Send SMS to primary SMS-eligible contact (supplementary to email)
  let smsSuccess = false;
  if (smsPrimaryContact?.phone) {
    console.log(
      `[Notification] Alert ${alert.id}: Sending SMS to primary contact ${smsPrimaryContact.phone}`
    );

    const smsMessage = SMS_TEMPLATES.L3(smsPrimaryContact.name, userName, lastCheckIn);
    const smsResult = await sendSMS(smsPrimaryContact.phone, smsMessage);

    if (smsResult.success) {
      console.log(
        `[Notification] Alert ${alert.id}: SMS sent to ${smsPrimaryContact.phone}`
      );
      smsSuccess = true;
    } else {
      console.error(
        `[Notification] Alert ${alert.id}: SMS failed to ${smsPrimaryContact.phone}:`,
        smsResult.error
      );
    }
  }

  // Success if either channel succeeded
  const success = emailSuccess || smsSuccess;

  return {
    success,
    email: primaryContact?.email,
    smsSuccess,
    error: !success ? (emailError ?? "No notification sent") : undefined,
  };
}

/**
 * Notify all contacts about an L4 (LEVEL_4) alert.
 *
 * Uses Resend batch API to send up to 100 emails in a single request.
 * This is more efficient than sequential sends and rate-limit friendly.
 *
 * SMS is sent in addition to email for contacts with notifyBySms enabled.
 *
 * @param alert - The alert being escalated to L4
 * @param profile - User profile with nested user data
 * @param contacts - All contacts for the user
 * @returns Result with count of sent and failed emails, and SMS count
 */
export async function notifyAllContacts(
  alert: Alert,
  profile: ProfileWithUser,
  contacts: Contact[]
): Promise<BatchNotifyResult> {
  const eligibleContacts = getEligibleContacts(contacts);
  const smsEligibleContacts = getEligibleContactsForSms(contacts);

  const userName = profile.user.name ?? "your loved one";
  const lastCheckIn = formatLastCheckIn(profile.lastCheckInAt);

  let emailsSent = 0;
  let emailsFailed = 0;

  // Send batch email to all email-eligible contacts
  if (eligibleContacts.length > 0 && resend) {
    try {
      console.log(
        `[Notification] Notifying ${eligibleContacts.length} contacts by email for L4 alert`
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
          `[Notification] Alert ${alert.id}: Batch email send failed:`,
          error
        );
        emailsFailed = eligibleContacts.length;
      } else {
        console.log(
          `[Notification] Alert ${alert.id}: Sent ${eligibleContacts.length} emails`
        );
        emailsSent = eligibleContacts.length;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `[Notification] Alert ${alert.id}: Batch email exception:`,
        errorMessage
      );
      emailsFailed = eligibleContacts.length;
    }
  } else if (eligibleContacts.length > 0 && !resend) {
    console.warn(
      `[Notification] Alert ${alert.id}: RESEND_API_KEY not configured, skipping ${eligibleContacts.length} emails`
    );
  } else {
    console.log(`[Notification] Alert ${alert.id}: No email-eligible contacts for L4`);
  }

  // Send SMS to all SMS-eligible contacts (supplementary to email)
  let smsSent = 0;
  if (smsEligibleContacts.length > 0) {
    console.log(
      `[Notification] Alert ${alert.id}: Sending SMS to ${smsEligibleContacts.length} contacts for L4`
    );

    for (const contact of smsEligibleContacts) {
      if (!contact.phone) continue;

      const smsMessage = SMS_TEMPLATES.L4(contact.name, userName, lastCheckIn);
      const smsResult = await sendSMS(contact.phone, smsMessage);

      if (smsResult.success) {
        smsSent++;
        console.log(
          `[Notification] Alert ${alert.id}: SMS sent to ${contact.phone}`
        );
      } else {
        console.error(
          `[Notification] Alert ${alert.id}: SMS failed to ${contact.phone}:`,
          smsResult.error
        );
      }
    }

    console.log(
      `[Notification] Alert ${alert.id}: Sent ${smsSent}/${smsEligibleContacts.length} SMS messages`
    );
  } else {
    console.log(`[Notification] Alert ${alert.id}: No SMS-eligible contacts for L4`);
  }

  return { sent: emailsSent, failed: emailsFailed, smsSent };
}
