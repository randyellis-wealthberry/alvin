import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    // Accepts both SQLite (file:./db.sqlite) and PostgreSQL (postgres://...) URLs
    DATABASE_URL: z.string().min(1),
    // Direct connection URL for Prisma migrations (bypasses Vercel connection pooling)
    DATABASE_URL_UNPOOLED: z.string().optional(),
    ANTHROPIC_API_KEY: z.string(),
    // Upstash Redis - Get from https://console.upstash.com
    // Optional: falls back to in-memory storage (see src/lib/redis.ts)
    // Required in production for WebAuthn challenge persistence across instances
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    CRON_SECRET: z.string().min(1),
    // RESEND_API_KEY - Get from https://resend.com/api-keys
    // Optional in development; required in production for email delivery
    RESEND_API_KEY: z.string().optional(),
    // VAPID keys for Web Push notifications
    // Generate with: npx web-push generate-vapid-keys --json
    VAPID_PRIVATE_KEY: z.string().min(1),
    VAPID_CONTACT_EMAIL: z.string().email(), // Used in VAPID "subject" field
    // Twilio SMS - Get from https://console.twilio.com
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // VAPID public key (client-exposed for push subscription)
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    // Upstash Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    // VAPID keys for Web Push
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    VAPID_CONTACT_EMAIL: process.env.VAPID_CONTACT_EMAIL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    // Twilio SMS
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
