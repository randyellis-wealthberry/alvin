# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** T3 Stack (Next.js 15 App Router + tRPC + Prisma) with AI chat integration

**Key Characteristics:**
- Next.js 15 App Router with route groups for layout isolation
- tRPC v11 for type-safe API layer with React Query integration
- Prisma ORM against PostgreSQL (Neon/Vercel Postgres with connection pooling)
- NextAuth v5 (beta) with credentials provider and JWT sessions
- Dual chat implementations: Vercel AI SDK streaming + CrayonAI/Thesys C1Chat
- Convex for real-time features (optional, gracefully degrades when not configured)
- PWA support via Serwist (service worker, offline, push notifications)

## Layers

**Presentation Layer (Client Components):**
- Purpose: React UI rendered in browser, handles user interaction
- Location: `src/app/`, `src/components/`
- Contains: Pages, client components, chat interfaces
- Depends on: tRPC React hooks (`src/trpc/react.tsx`), Zustand (available), Convex React client
- Used by: End users via browser

**Presentation Layer (Server Components):**
- Purpose: Server-rendered pages with data prefetching
- Location: `src/app/dashboard/page.tsx`, route group layouts
- Contains: RSC pages that prefetch tRPC data via `api.*.prefetch()`
- Depends on: tRPC server caller (`src/trpc/server.ts`), NextAuth `auth()`
- Used by: Next.js server rendering pipeline

**API Layer (tRPC):**
- Purpose: Type-safe RPC endpoints for all CRUD operations
- Location: `src/server/api/routers/`
- Contains: 10 routers (alert, auth, checkIn, contact, conversation, dashboard, passkey, post, profile, push)
- Depends on: Prisma (`ctx.db`), NextAuth session (`ctx.session`), Convex sync
- Used by: Client components via `api.*` hooks, Server components via `api.*.prefetch()`

**API Layer (REST):**
- Purpose: Streaming chat, cron jobs, auth handlers
- Location: `src/app/api/`
- Contains: Chat streaming endpoints, cron endpoints, NextAuth route handler
- Depends on: Vercel AI SDK, CrayonAI SDK, Prisma, NextAuth
- Used by: AI SDK `useChat`, C1Chat component, Vercel Cron scheduler

**Domain Logic:**
- Purpose: Business rules for alerts, reminders, AI check-in detection
- Location: `src/lib/`
- Contains: Alert escalation (`src/lib/alerts/`), reminder eligibility (`src/lib/reminders/`), AI config/prompts (`src/lib/ai/`), notifications (`src/lib/notifications.ts`)
- Depends on: Prisma, external SDKs (Resend, Twilio, web-push)
- Used by: tRPC routers, cron endpoints, chat API routes

**Data Layer:**
- Purpose: Database access and schema definition
- Location: `prisma/schema.prisma`, `src/server/db.ts`
- Contains: Prisma schema (13 models), singleton client
- Depends on: PostgreSQL via `DATABASE_URL`
- Used by: All server-side code via `db` import

**Real-time Layer (Convex):**
- Purpose: Real-time activity feed and user status updates on dashboard
- Location: `convex/`, `src/lib/convex/sync.ts`, `src/components/convex-provider.tsx`
- Contains: Convex schema (activities, userStatus), sync functions
- Depends on: Convex cloud service (optional)
- Used by: Dashboard components, tRPC routers (fire-and-forget sync)
- Note: Currently stubbed out with TODO comments; logs instead of syncing

## Data Flow

**Standard CRUD (e.g., check-in, contacts):**

1. Client component calls `api.checkIn.record.useMutation()` (`src/trpc/react.tsx`)
2. Request sent via `httpBatchStreamLink` to `/api/trpc` endpoint (`src/app/api/trpc/[trpc]/route.ts`)
3. tRPC resolves route to router handler in `src/server/api/routers/checkin.ts`
4. `protectedProcedure` middleware validates JWT session via `auth()`
5. Handler executes Prisma queries against PostgreSQL
6. (Optional) Fire-and-forget sync to Convex via `syncActivity()` / `syncUserStatus()`
7. Response serialized with SuperJSON, streamed back to client
8. React Query cache updated, UI re-renders

**AI Chat (Vercel AI SDK path):**

1. User types message in `src/app/(chat)/chat/[conversationId]/page.tsx`
2. Client calls `api.conversation.saveMessages.useMutation()` to persist + get AI response
3. Alternative path: Direct POST to `/api/chat` (`src/app/api/chat/route.ts`)
4. Server authenticates via `auth()`, verifies conversation ownership
5. `streamText()` called with Claude Opus 4 model via `@ai-sdk/anthropic`
6. Response streamed back as `UIMessageStreamResponse`
7. `onFinish` callback persists messages to DB and runs check-in detection
8. `analyzeConversationForCheckIn()` in `src/lib/ai/check-in-detection.ts` determines if user confirmed wellness

**AI Chat (CrayonAI/C1Chat path):**

1. `AlvinCrayonChat` component (`src/components/chat/AlvinCrayonChat.tsx`) renders `C1Chat`
2. C1Chat sends POST to `/api/crayon-chat` (`src/app/api/crayon-chat/route.ts`)
3. Server extracts text from XML-wrapped prompt, builds message history from DB
4. `makeC1Response()` creates SSE stream with think items and markdown responses
5. Claude streams in background, accumulated text written as `writeCustomMarkdown()`
6. Messages persisted to DB, check-in detection runs

**Server-Side Rendering with Prefetch:**

1. RSC page (e.g., `src/app/dashboard/page.tsx`) calls `auth()` for session check
2. `void api.dashboard.getStatus.prefetch()` populates React Query cache on server
3. `<HydrateClient>` serializes prefetched data into HTML
4. Client components use same `api.dashboard.getStatus.useQuery()` -- data available instantly

**State Management:**
- Server state: React Query via tRPC (primary state management approach)
- Client state: React `useState` for local UI state (modals, form inputs, scroll position)
- Zustand available (`zustand` in dependencies) but usage not observed in current codebase
- Real-time state: Convex subscriptions (when configured) for live dashboard updates

## Key Abstractions

**tRPC Procedures:**
- Purpose: Define authentication and middleware requirements per endpoint
- Examples: `src/server/api/trpc.ts`
- Patterns:
  - `publicProcedure` -- no auth required, timing middleware only
  - `rateLimitedProcedure` -- public + in-memory rate limiting
  - `protectedProcedure` -- requires valid JWT session, `ctx.session.user` guaranteed non-null

**Route Groups:**
- Purpose: Isolate layouts and auth requirements by app section
- `(app)` group (`src/app/(app)/`): Authenticated pages with `AppShell` (Header + BottomNav)
- `(chat)` group (`src/app/(chat)/`): Authenticated chat pages with custom gradient background, no shell
- Auth pages (`src/app/auth/`): Public, no layout wrapper
- Dashboard (`src/app/dashboard/`): Separate from (app) group, own layout with RSC prefetch

**AppShell:**
- Purpose: Consistent layout wrapper for main app pages
- Location: `src/components/shell/AppShell.tsx`
- Contains: `Header` + `BottomNav` + content area with bottom padding for nav
- Exports via barrel: `src/components/shell/index.ts`

**Convex Sync (fire-and-forget):**
- Purpose: Mirror critical state changes to Convex for real-time UI
- Location: `src/lib/convex/sync.ts`
- Pattern: Called after Prisma writes, wrapped in try/catch, failures logged but non-blocking
- Functions: `syncActivity()`, `syncUserStatus()`, `isConvexConfigured()`

## Entry Points

**Next.js App:**
- Location: `src/app/layout.tsx`
- Provider hierarchy: `SessionProvider` > `ConvexClientProvider` > `TRPCReactProvider`
- Global components: `MobileNav`, `InstallPrompt`, `IOSInstallInstructions`

**tRPC API Handler:**
- Location: `src/app/api/trpc/[trpc]/route.ts`
- Triggers: All tRPC client calls via `/api/trpc/*`

**NextAuth Handler:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Sign in/out, session checks

**Chat API (AI SDK):**
- Location: `src/app/api/chat/route.ts`
- Triggers: POST from AI SDK `useChat` hook
- Responsibilities: Stream Claude responses, persist messages, detect check-ins

**Chat API (CrayonAI):**
- Location: `src/app/api/crayon-chat/route.ts`
- Triggers: POST from C1Chat component
- Responsibilities: Stream via `makeC1Response()`, persist messages, detect check-ins

**Cron: Escalation:**
- Location: `src/app/api/cron/escalation/route.ts`
- Triggers: Vercel Cron (hourly), requires `CRON_SECRET` Bearer token
- Responsibilities: Create alerts for overdue users, escalate existing alerts (L1-L4), send notifications

**Cron: Reminders:**
- Location: `src/app/api/cron/reminders/route.ts`
- Triggers: Vercel Cron (hourly), requires `CRON_SECRET` Bearer token
- Responsibilities: Find users needing reminders, send via push/email/SMS fallback chain

## Error Handling

**Strategy:** Mixed -- tRPC errors for API layer, HTTP responses for REST routes

**Patterns:**
- tRPC procedures throw `TRPCError` with standard codes (`UNAUTHORIZED`, `NOT_FOUND`, `TOO_MANY_REQUESTS`)
- Zod validation errors automatically formatted via `errorFormatter` in `src/server/api/trpc.ts`
- REST chat routes return `new Response("message", { status: code })` for auth/not-found errors
- Cron endpoints return `NextResponse.json({ error: "..." }, { status: code })`
- Convex sync failures caught and logged, never propagated to user
- Chat streaming errors caught in async IIFE, error message written to stream before closing

## Cross-Cutting Concerns

**Logging:**
- `console.log` / `console.error` throughout (no structured logging framework)
- tRPC timing middleware logs execution time in development
- Cron endpoints log summary statistics
- Chat routes log request/response metadata with `[crayon-chat]` / `[Escalation]` prefixes

**Validation:**
- Zod schemas for environment variables (`src/env.js`)
- Zod schemas for tRPC procedure inputs (inline in routers)
- `@t3-oss/env-nextjs` for compile-time env validation

**Authentication:**
- NextAuth v5 with credentials provider (email/password with bcrypt)
- JWT session strategy (no database sessions for auth -- PrismaAdapter used for user storage only)
- WebAuthn/Passkey support via `@simplewebauthn/server` + `@simplewebauthn/browser`
- Challenge storage: Redis via `@upstash/redis` (`src/lib/redis.ts`)
- Auth check in layouts: `auth()` call with redirect to `/auth/signin`
- Auth check in API routes: `auth()` call with 401 response
- Custom sign-in page: `src/app/auth/signin/page.tsx`
- Custom sign-up page: `src/app/auth/signup/page.tsx`

**Rate Limiting:**
- In-memory rate limiter at `src/server/api/rate-limit.ts`
- 100 requests per minute per IP (default config)
- Probabilistic cleanup of expired entries (1% chance per request)
- Applied via `rateLimitedProcedure` (used for public mutation endpoints)

**Notifications (multi-channel):**
- Unified notification service: `src/lib/notifications.ts`
- Web Push: `src/lib/push.ts` (via `web-push` package)
- Email: Resend API (`resend` package)
- SMS: Twilio (`twilio` package)
- Fallback chain: push > email > SMS

**Environment Configuration:**
- Validated at build time via `@t3-oss/env-nextjs` at `src/env.js`
- Server vars: `DATABASE_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_*`, `CRON_SECRET`, `VAPID_*`, optional `RESEND_API_KEY`, `TWILIO_*`
- Client vars: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_CONVEX_URL` (checked at runtime, not in env schema)

---

*Architecture analysis: 2026-01-28*
