# External Integrations

**Analysis Date:** 2026-01-28

## APIs & External Services

**AI/LLM:**
- Anthropic Claude - Conversational AI for user check-ins and wellness conversations
  - SDK: `@ai-sdk/anthropic` ^3.0.15 (via Vercel AI SDK)
  - Model: Claude Opus 4 (`claude-opus-4-20250514`)
  - Auth: `ANTHROPIC_API_KEY` env var
  - Config: `src/lib/ai/config.ts`
  - Usage: `src/app/api/chat/route.ts` (direct streaming), `src/app/api/crayon-chat/route.ts` (Crayon C1Chat streaming)
  - Pattern: `streamText()` from Vercel AI SDK with system prompt from `src/lib/ai/prompts.ts`
  - Max output tokens: 1500

**Email:**
- Resend - Transactional email delivery (optional, gracefully degrades)
  - SDK: `resend` ^6.7.0
  - Auth: `RESEND_API_KEY` env var (optional)
  - Client init: `src/lib/notifications.ts`, `src/lib/alerts/notifications.ts`
  - Templates: `src/emails/ContactAlertEmail.tsx`, `src/emails/ReminderEmail.tsx` (React Email)
  - Features: Single send, batch send (up to 100 emails)
  - From addresses: `ALVIN <onboarding@resend.dev>`, `ALVIN Alert <alerts@resend.dev>`

**SMS:**
- Twilio - SMS notifications for check-in reminders and alert escalations (optional)
  - SDK: `twilio` ^5.11.2
  - Auth: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` env vars
  - Client: `src/lib/sms.ts`
  - Pattern: Conditional initialization, returns `SmsResult` with success/failure

**Caching/Data Store:**
- Upstash Redis - Serverless Redis (REST-based)
  - SDK: `@upstash/redis` ^1.36.1
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` env vars
  - Client: `src/lib/redis.ts` (uses `Redis.fromEnv()`)
  - Usage: WebAuthn challenge storage (registration and authentication flows)

**Real-time (Disabled):**
- Convex - Real-time backend for dashboard updates (currently stubbed)
  - SDK: `convex` ^1.31.5
  - Auth: `NEXT_PUBLIC_CONVEX_URL` env var (optional)
  - Client: `src/lib/convex/sync.ts` (graceful no-op when not configured)
  - Provider: `src/components/convex-provider.tsx`
  - Status: Disabled - functions log but do not actually sync. Requires `npx convex dev` to generate API files.

**Chat UI:**
- Crayon AI / TheSys GenUI - Rich chat interface
  - SDK: `@crayonai/react-core` ^0.7.7, `@crayonai/react-ui` ^0.9.15, `@crayonai/stream` ^0.6.4
  - SDK: `@thesysai/genui-sdk` ^0.7.11 (server-side C1 response builder)
  - API endpoint: `src/app/api/crayon-chat/route.ts`
  - Client components: `src/components/chat/ChatInterface.tsx`, `src/components/chat/MessageList.tsx`
  - Pattern: Uses `makeC1Response()` for C1Chat-compatible streaming with think items and custom markdown

## Data Storage

**Database:**
- PostgreSQL (Vercel Postgres recommended, any PostgreSQL provider supported)
  - Connection: `DATABASE_URL` env var
  - Direct connection: `DATABASE_URL_UNPOOLED` env var (bypasses Vercel connection pooling for migrations)
  - ORM: Prisma ^6.6.0
  - Schema: `prisma/schema.prisma`
  - Generated client: `generated/prisma/`
  - DB singleton: `src/server/db.ts`

**File Storage:**
- None detected (no S3, Cloudflare R2, or local file upload handling)

**Caching:**
- Upstash Redis (REST API) - see above
- Service Worker cache (Serwist) - client-side offline caching for dashboard tRPC data

## Authentication & Identity

**Auth Provider:**
- NextAuth v5 (beta) with credentials provider
  - Config: `src/server/auth/config.ts`
  - Session strategy: JWT (not database sessions)
  - Adapter: `@auth/prisma-adapter` (for user/account storage)
  - Password hashing: `bcryptjs` ^3.0.3
  - Custom sign-in page: `/auth/signin`

**WebAuthn/Passkeys:**
- SimpleWebAuthn for passwordless authentication
  - Server: `@simplewebauthn/server` ^9.0.3
  - Browser: `@simplewebauthn/browser` ^9.0.1
  - Challenge storage: Upstash Redis (migrated from in-memory)
  - Credential storage: `Passkey` model in PostgreSQL
  - Router: `src/server/api/routers/passkey.ts`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar)

**Logs:**
- `console.log` / `console.error` / `console.warn` throughout
- Prefixed log messages: `[SMS]`, `[Notification]`, `[Convex sync]`, `[crayon-chat]`

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `vercel.json`, Vercel Postgres references, `@serwist/next` config)

**Cron Jobs:**
- Vercel Cron via `vercel.json`
  - `/api/cron/reminders` - Hourly (`0 * * * *`) - Send check-in reminders
  - `/api/cron/escalation` - Hourly (`0 * * * *`) - Escalate overdue alerts
  - Secured with `CRON_SECRET` env var
  - Implementations: `src/app/api/cron/reminders/route.ts`, `src/app/api/cron/escalation/route.ts`

**CI Pipeline:**
- Not detected (no `.github/workflows`, `Jenkinsfile`, or similar)

## PWA / Service Worker

**Framework:** Serwist ^9.5.0 via `@serwist/next`
- Source: `src/app/sw.ts`
- Output: `public/sw.js`
- Features: Precaching, runtime caching (StaleWhileRevalidate for dashboard data), offline fallback, push notification handling
- Disabled in development mode

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (production only)
- `ANTHROPIC_API_KEY` - Claude AI API key
- `UPSTASH_REDIS_REST_URL` - Redis REST endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token
- `CRON_SECRET` - Cron endpoint authentication
- `VAPID_PRIVATE_KEY` - Web Push VAPID private key
- `VAPID_CONTACT_EMAIL` - VAPID contact email
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Web Push VAPID public key (client-exposed)

**Optional env vars:**
- `DATABASE_URL_UNPOOLED` - Direct DB connection for migrations
- `RESEND_API_KEY` - Email delivery
- `TWILIO_ACCOUNT_SID` - SMS service account
- `TWILIO_AUTH_TOKEN` - SMS auth
- `TWILIO_PHONE_NUMBER` - SMS sender number
- `NEXT_PUBLIC_CONVEX_URL` - Convex real-time backend

**Secrets location:**
- Vercel dashboard (production)
- `.env.local` (local development, gitignored)
- `.env.example` (template, committed)

## Webhooks & Callbacks

**Incoming:**
- `/api/cron/reminders` - Vercel Cron (hourly) - secured with `CRON_SECRET`
- `/api/cron/escalation` - Vercel Cron (hourly) - secured with `CRON_SECRET`

**Outgoing:**
- Web Push notifications via `web-push` library (to browser push endpoints)
- Resend email API calls
- Twilio SMS API calls
- Anthropic Claude API calls (streaming)

## Notification Fallback Chain

The app implements a cascading notification system defined in `src/lib/notifications.ts`:

1. **Web Push** (primary) - via `web-push` library → browser push endpoints
2. **Email** (fallback) - via Resend API
3. **SMS** (tertiary) - via Twilio API
4. **None** - if all channels fail/unconfigured

Alert escalation notifications (`src/lib/alerts/notifications.ts`) use email + SMS directly (not the push-first chain) for emergency contact alerts at L3/L4 levels.

---

*Integration audit: 2026-01-28*
