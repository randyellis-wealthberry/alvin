# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
alvin/
├── convex/                    # Convex real-time backend (optional)
├── docs/                      # Documentation and UX specs
│   ├── plans/                 # Feature planning docs
│   └── ux-pilot/              # UX design specs (screens, components)
├── generated/
│   └── prisma/                # Generated Prisma client (gitignored output)
├── prisma/
│   └── schema.prisma          # Database schema (source of truth)
├── public/                    # Static assets (icons, manifest, sw.js)
├── scripts/                   # Utility scripts
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── (app)/             # Main app pages (with AppShell layout)
│   │   ├── (chat)/            # Chat pages (custom gradient layout)
│   │   ├── _components/       # Legacy/shared page components
│   │   ├── api/               # REST API routes
│   │   ├── auth/              # Auth pages (signin, signup)
│   │   ├── dashboard/         # Dashboard page (RSC with prefetch)
│   │   └── offline/           # Offline fallback page (PWA)
│   ├── components/            # Shared React components
│   │   ├── chat/              # Chat UI components
│   │   ├── layout/            # Layout components (mobile nav)
│   │   ├── offline/           # Offline indicator
│   │   ├── push/              # Push notification UI
│   │   ├── pwa/               # PWA install prompts
│   │   ├── shell/             # App shell (Header, BottomNav, AppShell)
│   │   └── ui/                # Reusable UI primitives (shadcn/ui)
│   ├── emails/                # Email templates (React Email)
│   ├── lib/                   # Shared utilities and domain logic
│   │   ├── ai/                # AI config, prompts, check-in detection
│   │   ├── alerts/            # Alert escalation logic and notifications
│   │   ├── convex/            # Convex sync utilities
│   │   └── reminders/         # Reminder eligibility logic
│   ├── server/                # Server-only code
│   │   ├── api/               # tRPC routers and configuration
│   │   │   └── routers/       # Individual tRPC routers
│   │   └── auth/              # NextAuth configuration
│   ├── styles/                # Global CSS
│   ├── trpc/                  # tRPC client setup (React + RSC)
│   └── types/                 # Shared TypeScript types
├── .env.example               # Environment variable template
├── .planning/                 # GSD planning documents
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── prisma/schema.prisma       # Database schema
└── tsconfig.json              # TypeScript configuration
```

## Directory Purposes

**`src/app/(app)/`:**
- Purpose: Authenticated main application pages wrapped in `AppShell`
- Contains: Page components for core features
- Key files:
  - `layout.tsx`: Auth guard + `<AppShell>` wrapper
  - `page.tsx`: Home/landing page (rich animated dashboard UI)
  - `alerts/page.tsx`: Alert management
  - `check-in/page.tsx`: Check-in interface
  - `contacts/page.tsx`: Contact management
  - `profile/page.tsx`: User profile
  - `profile/passkeys/page.tsx`: WebAuthn passkey management
  - `settings/page.tsx`: App settings

**`src/app/(chat)/`:**
- Purpose: Chat interface with isolated layout (no AppShell, custom background)
- Contains: Chat pages using CrayonAI C1Chat
- Key files:
  - `layout.tsx`: Auth guard + gradient background
  - `chat/page.tsx`: Main chat view (renders `AlvinCrayonChat`)
  - `chat/[conversationId]/page.tsx`: Individual conversation view (direct tRPC-based chat)

**`src/app/api/`:**
- Purpose: REST API route handlers
- Contains: Non-tRPC endpoints
- Key files:
  - `auth/[...nextauth]/route.ts`: NextAuth route handler
  - `chat/route.ts`: AI SDK streaming chat endpoint
  - `crayon-chat/route.ts`: CrayonAI C1Chat streaming endpoint
  - `cron/escalation/route.ts`: Alert escalation cron job
  - `cron/reminders/route.ts`: Reminder notification cron job
  - `trpc/[trpc]/route.ts`: tRPC HTTP handler

**`src/app/dashboard/`:**
- Purpose: Dashboard with server-side data prefetching
- Contains: RSC page + co-located client widgets
- Key files:
  - `page.tsx`: RSC entry with `api.dashboard.*.prefetch()`
  - `status-widget.tsx`: Check-in status display
  - `activity-log.tsx`: Recent activity list
  - `live-indicator.tsx`: Real-time connection indicator
  - `push-prompt-wrapper.tsx`: Push notification opt-in

**`src/server/api/routers/`:**
- Purpose: All tRPC router definitions
- Contains: One file per domain entity
- Key files:
  - `alert.ts`: Alert queries (active alerts, history)
  - `auth.ts`: Registration endpoint
  - `checkin.ts`: Check-in recording, listing, stats
  - `contact.ts`: CRUD for emergency contacts
  - `conversation.ts`: Conversation management (create, list, get, save messages, delete)
  - `dashboard.ts`: Dashboard-specific aggregated queries
  - `passkey.ts`: WebAuthn registration/authentication flows
  - `profile.ts`: User profile CRUD
  - `push.ts`: Push subscription management
  - `post.ts`: Legacy T3 scaffold (example CRUD)

**`src/components/chat/`:**
- Purpose: Chat UI components shared between chat implementations
- Contains: Both CrayonAI and custom chat components
- Key files:
  - `AlvinCrayonChat.tsx`: Full C1Chat integration with thread management
  - `ChatInterface.tsx`: Custom chat interface component
  - `ConversationList.tsx`: Sidebar conversation list
  - `MessageList.tsx`: Message display
  - `MessageInput.tsx`: Input field
  - `CheckInBanner.tsx`: Check-in confirmation banner
  - `AlvinThinkComponent.tsx`: Custom thinking indicator for C1Chat
  - `AlvinResponseFooter.tsx`: Custom footer for C1Chat responses
  - `WellnessCheckInCard.tsx`: Custom C1Chat component for wellness check-in

**`src/components/shell/`:**
- Purpose: App layout shell components
- Contains: Header, bottom navigation, wrapping shell
- Key files:
  - `AppShell.tsx`: Main layout wrapper with Header + BottomNav
  - `Header.tsx`: Top app bar
  - `BottomNav.tsx`: Bottom tab navigation
  - `index.ts`: Barrel export

**`src/components/ui/`:**
- Purpose: shadcn/ui primitives and custom icon components
- Contains: ~37 UI component files
- Key files: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `dialog.tsx`, `form.tsx`, `select.tsx`, `sheet.tsx`, `switch.tsx`, `badge.tsx`, `checkbox.tsx`, `dropdown-menu.tsx`, `scroll-area.tsx`, `separator.tsx`, `alert-dialog.tsx`
- Also contains custom SVG icon components: `heart.tsx`, `fingerprint.tsx`, `sparkles.tsx`, `bell.tsx`, etc.

**`src/lib/`:**
- Purpose: Shared utilities, domain logic, and service integrations
- Key files:
  - `utils.ts`: `cn()` helper (clsx + tailwind-merge)
  - `redis.ts`: Upstash Redis client singleton
  - `push.ts`: Web Push notification sending
  - `notifications.ts`: Unified multi-channel notification service (push/email/SMS)
  - `sms.ts`: Twilio SMS sending
  - `ai/config.ts`: Claude model configuration
  - `ai/prompts.ts`: ALVIN system prompt
  - `ai/check-in-detection.ts`: Conversation analysis for automatic check-ins
  - `alerts/escalation.ts`: Alert level logic and user eligibility queries
  - `alerts/notifications.ts`: Family contact notification logic
  - `convex/sync.ts`: Convex sync utilities (currently stubbed)
  - `reminders/eligibility.ts`: Reminder scheduling logic

**`src/trpc/`:**
- Purpose: tRPC client setup for both client and server contexts
- Key files:
  - `react.tsx`: Client-side tRPC provider with React Query (`api` export)
  - `server.ts`: Server-side tRPC caller for RSC (`api`, `HydrateClient` exports)
  - `query-client.ts`: React Query client factory

**`src/emails/`:**
- Purpose: Email templates using React Email
- Contains: Template components for notification emails

**`convex/`:**
- Purpose: Convex backend schema and functions (real-time features)
- Key files:
  - `schema.ts`: Convex table definitions (activities, userStatus)
  - `activities.ts`: Activity mutation/query functions
  - `alerts.ts`: Alert-related Convex functions

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with provider hierarchy
- `src/app/(app)/layout.tsx`: Authenticated app layout
- `src/app/(chat)/layout.tsx`: Authenticated chat layout

**Configuration:**
- `src/env.js`: Environment variable schema and validation
- `src/server/api/trpc.ts`: tRPC initialization, context, procedures
- `src/server/auth/config.ts`: NextAuth configuration
- `src/server/db.ts`: Prisma client singleton
- `src/lib/ai/config.ts`: AI model configuration
- `prisma/schema.prisma`: Database schema

**Core Logic:**
- `src/server/api/root.ts`: tRPC router registry
- `src/server/api/routers/`: All business logic endpoints
- `src/lib/alerts/escalation.ts`: Alert escalation engine
- `src/lib/notifications.ts`: Multi-channel notification service
- `src/app/api/chat/route.ts`: AI chat streaming
- `src/app/api/crayon-chat/route.ts`: C1Chat streaming

**Testing:**
- `src/server/api/routers/post.test.ts`: tRPC router test example
- `src/app/_components/post.test.tsx`: Component test example
- `src/env.test.ts`: Environment validation tests

## Naming Conventions

**Files:**
- Page routes: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: PascalCase (`AlvinCrayonChat.tsx`, `AppShell.tsx`)
- Utilities/services: kebab-case (`check-in-detection.ts`, `rate-limit.ts`)
- tRPC routers: camelCase singular (`checkin.ts`, `contact.ts`, `conversation.ts`)
- Tests: co-located with `.test.ts` / `.test.tsx` suffix

**Directories:**
- Route groups: parenthesized (`(app)`, `(chat)`)
- Feature groups: kebab-case (`check-in`, `push-prompt-wrapper`)
- Component categories: kebab-case (`ui`, `shell`, `chat`)

## Where to Add New Code

**New Feature (full-stack):**
- tRPC router: Create `src/server/api/routers/{feature}.ts`, register in `src/server/api/root.ts`
- Page: Create `src/app/(app)/{feature}/page.tsx`
- Components: Create `src/components/{feature}/` directory

**New tRPC Router:**
1. Create `src/server/api/routers/{name}.ts`
2. Import and register in `src/server/api/root.ts`
3. Use `protectedProcedure` for authenticated endpoints, `publicProcedure` for public

**New API Route (REST/streaming):**
- Create `src/app/api/{name}/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`

**New Page:**
- Authenticated with app shell: `src/app/(app)/{route}/page.tsx`
- Authenticated with custom layout: `src/app/(chat)/{route}/page.tsx`
- Public page: `src/app/{route}/page.tsx`
- Add navigation link to `src/components/shell/BottomNav.tsx` and/or `src/components/layout/mobile-nav.tsx`

**New UI Component:**
- shadcn/ui primitive: `src/components/ui/{name}.tsx` (install via `npx shadcn@latest add {name}`)
- Feature component: `src/components/{feature}/{ComponentName}.tsx`
- Page-specific component: co-locate in `src/app/(app)/{route}/{component-name}.tsx`

**New Domain Logic:**
- Shared business rules: `src/lib/{domain}/` directory
- Utility functions: `src/lib/utils.ts` or new file in `src/lib/`
- AI-related: `src/lib/ai/`

**New Database Model:**
- Add model to `prisma/schema.prisma`
- Run `npm run db:push` (dev) or `npm run db:generate` + `npm run db:migrate` (prod)
- Create corresponding tRPC router

**New Email Template:**
- Create in `src/emails/`
- Use via Resend in `src/lib/notifications.ts`

**New Cron Job:**
- Create `src/app/api/cron/{name}/route.ts`
- Validate `CRON_SECRET` in handler
- Add schedule to `vercel.json`

## Special Directories

**`generated/prisma/`:**
- Purpose: Auto-generated Prisma client code
- Generated: Yes (via `prisma generate` / `postinstall`)
- Committed: No (output dir configured in schema)

**`convex/`:**
- Purpose: Convex backend definitions
- Generated: Convex generates `_generated/` subdir when `npx convex dev` runs
- Committed: Schema and function files committed; generated files are not

**`.planning/`:**
- Purpose: GSD planning system documents (milestones, phases, codebase analysis)
- Generated: By GSD commands
- Committed: Yes

**`public/`:**
- Purpose: Static assets served at root URL
- Contains: PWA manifest, icons, service worker, favicon
- Committed: Yes

---

*Structure analysis: 2026-01-28*
