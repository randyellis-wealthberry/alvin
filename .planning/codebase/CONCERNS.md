# Codebase Concerns

**Analysis Date:** 2026-01-28

## Tech Debt

**Convex Integration Stubbed Out:**
- Issue: Convex real-time sync functions are fully stubbed with `console.log` instead of actual API calls. Two TODO comments confirm this.
- Files: `src/lib/convex/sync.ts`, `convex/schema.ts`, `convex/activities.ts`, `convex/alerts.ts`
- Impact: Real-time dashboard features (live indicator, activity log) have no backend. The `LiveIndicator` component in `src/app/dashboard/live-indicator.tsx` and `ActivityLog` in `src/app/dashboard/activity-log.tsx` cannot function as intended.
- Fix approach: Either implement the Convex integration fully or remove all Convex references and the `convex` dependency from `package.json`.

**Duplicate Dashboard Implementations:**
- Issue: Two large, near-identical dashboard page components exist with duplicated animated counter hooks and similar UI code.
- Files: `src/app/_components/dashboard.tsx` (816 lines), `src/app/(app)/page.tsx` (808 lines)
- Impact: Double maintenance burden, divergent behavior over time.
- Fix approach: Determine which is canonical (likely `src/app/(app)/page.tsx` given the route group structure), delete the other, and extract shared components.

**Deprecated Function Still in Use:**
- Issue: `getNotificationWithEmail()` in `src/lib/notifications.ts` is marked `@deprecated` in favor of `getNotificationWithFallbacks()`, but is still called.
- Files: `src/lib/notifications.ts:200`, `src/app/api/cron/reminders/route.ts:33`
- Impact: Reminders cron job does not include SMS fallback data in its notification template.
- Fix approach: Replace `getNotificationWithEmail` call in `src/app/api/cron/reminders/route.ts` with `getNotificationWithFallbacks`, then remove the deprecated function.

**Scaffold Code Left Over:**
- Issue: The T3 Stack scaffold `Post` model and `postRouter` remain in the codebase, unrelated to ALVIN functionality.
- Files: `prisma/schema.prisma:15-25` (Post model), `src/server/api/routers/post.ts`, `src/server/api/root.ts:8` (post import), `src/app/_components/post.test.tsx`
- Impact: Confusing for developers, unnecessary database table.
- Fix approach: Remove the Post model, post router, post test, and the registration in `root.ts`. Run a migration to drop the table.

**CLAUDE.md Documentation Outdated:**
- Issue: `CLAUDE.md` states "SQLite connection string" for `DATABASE_URL`, but the actual schema (`prisma/schema.prisma`) uses PostgreSQL with connection pooling.
- Files: `CLAUDE.md`, `prisma/schema.prisma:9-13`
- Impact: Misleading developer onboarding documentation.
- Fix approach: Update CLAUDE.md to reflect PostgreSQL usage.

## Security Considerations

**Untyped WebAuthn Input Validation:**
- Risk: Passkey registration and authentication accept `z.any()` for the WebAuthn response body, bypassing Zod schema validation entirely.
- Files: `src/server/api/routers/passkey.ts:188`, `src/server/api/routers/passkey.ts:313`
- Current mitigation: The `@simplewebauthn/server` library validates the structure during verification, so malformed data would cause a caught error.
- Recommendations: Define proper Zod schemas matching `RegistrationResponseJSON` and `AuthenticationResponseJSON` types to reject invalid payloads at the tRPC layer before reaching the verification logic.

**Generic Error Throws in tRPC Routers:**
- Risk: Several routers use `throw new Error(...)` instead of `throw new TRPCError(...)`, causing untyped 500 INTERNAL_SERVER_ERROR responses that may leak stack traces in development.
- Files: `src/server/api/routers/contact.ts:96,104,125,133`, `src/server/api/routers/conversation.ts:80,90,118,124`, `src/server/api/routers/push.ts:46,83,137`
- Current mitigation: None. These are raw Error throws.
- Recommendations: Replace all `throw new Error()` with `throw new TRPCError()` using appropriate codes (`NOT_FOUND`, `FORBIDDEN`, etc.) for consistent error handling and proper HTTP status codes.

**Rate Limiting Uses In-Memory Store:**
- Risk: Rate limit state resets on server restart and is not shared across serverless function instances on Vercel.
- Files: `src/server/api/rate-limit.ts:8` (Map-based store)
- Current mitigation: The rate limiter works within a single instance lifetime. Comment on line 112 of `src/server/api/trpc.ts` acknowledges this.
- Recommendations: Migrate to Redis-based rate limiting using the existing Upstash Redis connection (`src/lib/redis.ts`).

**No Middleware for Route Protection:**
- Risk: No Next.js middleware exists to protect routes at the edge. Each page handles auth redirects individually, risking missed protection on new pages.
- Files: No `src/middleware.ts` exists. Auth checks are inline in pages like `src/app/dashboard/page.tsx:13`.
- Current mitigation: tRPC `protectedProcedure` guards API calls. Page-level redirects exist but are manual.
- Recommendations: Add a Next.js middleware to centralize route protection for all `/dashboard`, `/(app)`, and `/(chat)` routes.

**Cron Endpoint Authorization is Simple String Comparison:**
- Risk: The CRON_SECRET is compared with simple string equality, which could be vulnerable to timing attacks.
- Files: `src/app/api/cron/escalation/route.ts:40`, `src/app/api/cron/reminders/route.ts:81`
- Current mitigation: Vercel automatically sends the CRON_SECRET as a Bearer token and these endpoints are only accessible via Vercel's cron scheduler in production.
- Recommendations: Use a constant-time comparison function for the secret comparison.

**Email Sender Uses Default Resend Domain:**
- Risk: Emails are sent from `onboarding@resend.dev` and `alerts@resend.dev` (Resend's sandbox domain), which limits deliverability and looks unprofessional.
- Files: `src/lib/notifications.ts:141`, `src/lib/alerts/notifications.ts:161,276`
- Current mitigation: Works for testing with Resend sandbox.
- Recommendations: Configure a custom domain in Resend and update the `from` addresses.

## Performance Bottlenecks

**Sequential Notification Sends in Cron Jobs:**
- Problem: Both cron jobs iterate users sequentially with `for...of` loops, sending notifications one at a time.
- Files: `src/app/api/cron/escalation/route.ts:52-73` (alert creation loop), `src/app/api/cron/escalation/route.ts:81-153` (escalation loop), `src/app/api/cron/reminders/route.ts:106-109`
- Cause: Each iteration awaits the full notification send (push + possible email/SMS fallback) before moving to the next user.
- Improvement path: Use `Promise.allSettled()` with concurrency limits to process multiple users in parallel. With many users, sequential processing could exceed Vercel's function timeout.

**Chat Stream Accumulates Full Response Before Rendering:**
- Problem: The crayon-chat route accumulates the entire LLM response before writing it as a single markdown block.
- Files: `src/app/api/crayon-chat/route.ts:127-134`
- Cause: The C1Chat SDK's `writeCustomMarkdown` expects a complete string, so streaming chunks are collected rather than forwarded incrementally.
- Improvement path: Investigate if the C1Chat SDK supports incremental markdown writes, or switch to a streaming approach that sends chunks to the client.

**N+1 Query Pattern in Escalation:**
- Problem: The escalation cron job fetches profile+user+contacts inside each alert's escalation loop iteration.
- Files: `src/app/api/cron/escalation/route.ts:124-130`
- Cause: Profile data is fetched per-alert rather than batch-loaded.
- Improvement path: Pre-fetch all needed profiles with their contacts before the escalation loop.

**Repeated Profile Lookups Across Router Methods:**
- Problem: Every tRPC procedure begins by querying `userProfile` by `userId`, even when multiple procedures are called in sequence by the same user.
- Files: All routers in `src/server/api/routers/` (contact, alert, checkin, conversation, push, passkey)
- Cause: No caching or context-level profile resolution.
- Improvement path: Add a profile resolver to the tRPC context that lazily loads and caches the profile for the duration of the request.

## Fragile Areas

**Check-in Detection via Keyword Matching:**
- Files: `src/lib/ai/check-in-detection.ts`
- Why fragile: Uses a fixed list of ~30 English phrases to detect if a user is "okay." False positives (e.g., user says "I'm okay but need help") and false negatives (e.g., "all is well with me today") are both likely. No support for non-English users.
- Safe modification: Add phrases to the arrays. Do not change the logic flow without adding comprehensive tests.
- Test coverage: No test file exists for this module.

**Conversation Check-in Recording Not Transactional:**
- Files: `src/app/api/crayon-chat/route.ts:174-191`
- Why fragile: After check-in detection, three separate DB operations (create check-in, update conversation, update profile) are performed outside a transaction. A failure between steps leaves data in an inconsistent state.
- Safe modification: Wrap the three operations in a `db.$transaction()` call.
- Test coverage: No tests for the chat route.

**Large Monolithic Page Components:**
- Files: `src/app/(app)/page.tsx` (808 lines), `src/app/(app)/contacts/page.tsx` (733 lines), `src/app/(app)/alerts/page.tsx` (687 lines), `src/app/(app)/check-in/page.tsx` (593 lines), `src/app/(app)/profile/page.tsx` (540 lines)
- Why fragile: Massive single-file components with mixed concerns (data fetching, state management, UI rendering) are hard to modify without introducing regressions.
- Safe modification: Extract sub-components, custom hooks, and data-fetching logic into separate files.
- Test coverage: None for any of these page components.

## Dependencies at Risk

**next-auth v5 Beta:**
- Risk: Using `next-auth@^5.0.0-beta.30`, which is a pre-release version. API surface may change between beta releases.
- Impact: Auth configuration in `src/server/auth/config.ts` may break on updates. Session strategy and callbacks could change.
- Migration plan: Monitor the next-auth v5 stable release and update when available. Pin the exact beta version in the meantime (remove `^` prefix).

**Convex Dependency Unused:**
- Risk: `convex@^1.31.5` is listed as a dependency but the integration is entirely stubbed. Adds ~10MB+ to `node_modules` for no runtime value.
- Impact: Increased install times, potential version conflicts.
- Migration plan: Remove from `package.json` until Convex integration is actually implemented.

**@crayonai and @thesysai SDK Dependencies:**
- Risk: `@crayonai/react-core`, `@crayonai/react-ui`, `@crayonai/stream`, and `@thesysai/genui-sdk` are relatively niche packages with potential for breaking changes or abandonment.
- Impact: The chat UI (`src/app/(chat)/chat/[conversationId]/page.tsx`) and chat API (`src/app/api/crayon-chat/route.ts`) depend entirely on these SDKs.
- Migration plan: Keep these pinned. Have a fallback plan to replace with a simpler custom chat UI using the `ai` SDK's built-in React hooks if these packages become unmaintained.

## Missing Critical Features

**No Password Reset Flow:**
- Problem: The auth system uses credential-based login (`src/server/auth/config.ts`) with bcrypt password hashing, but there is no password reset or forgot-password functionality.
- Blocks: Users who forget their password have no self-service recovery path.

**No Email Verification:**
- Problem: The `User` model has an `emailVerified` field (`prisma/schema.prisma:59`) but no email verification flow exists. Users can register with any email.
- Blocks: Cannot trust that notification emails reach the actual account owner. Emergency contact notifications could be sent to wrong addresses.

**No Account Registration Endpoint:**
- Problem: While `src/server/auth/config.ts` handles credential login, no user registration/signup endpoint or page was found in the codebase.
- Blocks: New users cannot create accounts through the application.

**No Next.js Middleware:**
- Problem: No `src/middleware.ts` exists for edge-level route protection, CSP headers, or request preprocessing.
- Blocks: Centralized security policies, bot protection, and consistent auth redirects.

## Test Coverage Gaps

**Core Business Logic Untested:**
- What's not tested: Alert escalation (`src/lib/alerts/escalation.ts`), notification dispatch (`src/lib/notifications.ts`, `src/lib/alerts/notifications.ts`), check-in detection (`src/lib/ai/check-in-detection.ts`), push notification sending (`src/lib/push.ts`), SMS sending (`src/lib/sms.ts`).
- Files: All files in `src/lib/` directory
- Risk: The escalation logic determines when emergency contacts are notified. Bugs here could mean contacts are never notified or notified incorrectly. This is the most safety-critical code in the application.
- Priority: High

**No Router Tests for Domain Logic:**
- What's not tested: Alert, check-in, contact, conversation, passkey, push, profile, and dashboard routers have no test files.
- Files: `src/server/api/routers/alert.ts`, `src/server/api/routers/checkin.ts`, `src/server/api/routers/contact.ts`, `src/server/api/routers/conversation.ts`, `src/server/api/routers/passkey.ts`, `src/server/api/routers/push.ts`, `src/server/api/routers/dashboard.ts`, `src/server/api/routers/profile.ts`
- Risk: Authorization checks (e.g., verifying contacts belong to the requesting user) are untested. Ownership validation bugs could allow users to modify other users' data.
- Priority: High

**Cron Job Endpoints Untested:**
- What's not tested: Reminder and escalation cron endpoints have no tests.
- Files: `src/app/api/cron/reminders/route.ts`, `src/app/api/cron/escalation/route.ts`
- Risk: These run on a schedule and handle critical alert creation/escalation. Silent failures could mean no alerts are ever created for overdue users.
- Priority: High

**Existing Tests Are Only Scaffolds:**
- What's not tested: The 6 existing test files cover only the T3 scaffold (post router, env validation, trpc setup, rate limiting, auth config). No tests cover ALVIN's domain logic.
- Files: `src/app/_components/post.test.tsx`, `src/env.test.ts`, `src/server/api/rate-limit.test.ts`, `src/server/api/routers/post.test.ts`, `src/server/api/trpc.test.ts`, `src/server/auth/config.test.ts`
- Risk: The test suite gives a false sense of coverage while the actual application logic is entirely untested.
- Priority: Medium

**No E2E or Integration Tests:**
- What's not tested: No end-to-end tests exist for critical user flows (sign in, check in, receive alert, cancel alert).
- Files: No `e2e/` or `cypress/` or `playwright/` directory exists.
- Risk: Full user flows involving multiple components and API calls are never validated together.
- Priority: Medium

---

*Concerns audit: 2026-01-28*
