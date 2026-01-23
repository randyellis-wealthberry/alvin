/**
 * Twilio SMS Service
 *
 * Provides SMS sending capabilities for ALVIN notifications.
 * Gracefully degrades when Twilio is not configured.
 *
 * Phone numbers must be in E.164 format (e.g., +14155551234).
 *
 * Note: Twilio trial accounts can only send to verified phone numbers.
 * Upgrade to a paid account for production use.
 */

import Twilio from "twilio";
import { env } from "~/env";

// Initialize Twilio client conditionally
const client =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

/**
 * Result of an SMS send attempt
 */
export interface SmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

/**
 * Check if Twilio SMS is configured
 */
export function isSmsConfigured(): boolean {
  return client !== null && !!env.TWILIO_PHONE_NUMBER;
}

/**
 * Send an SMS message via Twilio.
 *
 * @param to - Recipient phone number in E.164 format (e.g., +14155551234)
 * @param body - Message body (max 1600 characters)
 * @returns SmsResult indicating success/failure with SID or error message
 */
export async function sendSMS(to: string, body: string): Promise<SmsResult> {
  // Check if client is configured
  if (!client) {
    console.warn(
      "[SMS] Twilio not configured (missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN)",
    );
    return { success: false, error: "SMS not configured" };
  }

  // Check if phone number is configured
  if (!env.TWILIO_PHONE_NUMBER) {
    console.warn("[SMS] Twilio phone number not configured");
    return { success: false, error: "Twilio phone number not configured" };
  }

  try {
    const message = await client.messages.create({
      body,
      to,
      from: env.TWILIO_PHONE_NUMBER,
    });

    console.log(`[SMS] Sent message ${message.sid} to ${to}`);
    return { success: true, sid: message.sid };
  } catch (error: unknown) {
    // Handle Twilio RestException errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error
    ) {
      const twilioError = error as {
        code: number;
        message: string;
        status?: number;
      };
      console.error(
        `[SMS] Twilio error ${twilioError.code}: ${twilioError.message}${
          twilioError.status ? ` (HTTP ${twilioError.status})` : ""
        }`,
      );
      return {
        success: false,
        error: `Twilio error ${twilioError.code}: ${twilioError.message}`,
      };
    }

    // Handle non-Twilio errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[SMS] Send failed:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}
