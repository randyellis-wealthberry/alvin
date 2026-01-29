# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript ^5.8.2 - All application code (strict mode, ES2022 target)

**Secondary:**
- JavaScript - Config files (`next.config.mjs`, `eslint.config.js`, `src/env.js`)

## Runtime

**Environment:**
- Node.js (no `.nvmrc` present; inferred from `@types/node` ^20.14.10)
- ES Modules (`"type": "module"` in `package.json`)

**Package Manager:**
- npm 9.2.0 (declared in `packageManager` field)
- Lockfile: `package-lock.json` present
- `.npmrc` with `legacy-peer-deps=true` for build compatibility

## Frameworks

**Core:**
- Next.js ^15.2.3 - App Router (no Pages Router)
- React ^19.0.0 - UI library
- React DOM ^19.0.0 - DOM renderer

**API Layer:**
- tRPC ^11.0.0 - Type-safe API (`@trpc/client`, `@trpc/server`, `@trpc/react-query`)
- TanStack React Query ^5.69.0 - Server state management (via tRPC integration)

**Testing:**
- Vitest ^4.0.17 - Test runner (config: `vitest.config.ts`)
- Testing Library React ^16.3.1 - Component testing
- Testing Library Jest DOM ^6.9.1 - DOM matchers
- jsdom ^24.1.3 - Browser environment simulation

**Build/Dev:**
- Turbopack - Dev server (`next dev --turbo`)
- PostCSS ^8.5.3 - CSS processing
- Tailwind CSS ^4.0.15 - Utility-first CSS (v4 with `@tailwindcss/postcss`)
- Prettier ^3.5.3 - Code formatting (with `prettier-plugin-tailwindcss`)
- ESLint ^9.23.0 - Linting (flat config with `typescript-eslint` ^8.27.0, `next/core-web-vitals`)

## Key Dependencies

**Critical:**
- Prisma ^6.6.0 (`prisma` CLI + `@prisma/client`) - ORM for PostgreSQL
- NextAuth ^5.0.0-beta.30 (`next-auth`) - Authentication (credentials provider, JWT sessions)
- `@auth/prisma-adapter` ^2.7.2 - NextAuth Prisma adapter
- Zod ^3.24.2 - Schema validation (env vars, tRPC inputs)
- `@t3-oss/env-nextjs` ^0.12.0 - Type-safe environment variable validation (`src/env.js`)

**AI/ML:**
- Vercel AI SDK (`ai`) ^6.0.39 - Streaming AI responses, `streamText`, `convertToModelMessages`
- `@ai-sdk/anthropic` ^3.0.15 - Anthropic provider (Claude Opus 4 model)
- `@ai-sdk/react` ^3.0.41 - React hooks for AI streaming
- `@crayonai/react-core` ^0.7.7 - Crayon AI chat core
- `@crayonai/react-ui` ^0.9.15 - Crayon AI chat UI components
- `@crayonai/stream` ^0.6.4 - Crayon AI streaming utilities
- `@thesysai/genui-sdk` ^0.7.11 - GenUI SDK for C1Chat-compatible responses

**Notifications:**
- `web-push` ^3.6.7 - Server-side Web Push (VAPID)
- Resend ^6.7.0 - Transactional email
- `@react-email/components` ^1.0.4 - React email templates
- Twilio ^5.11.2 - SMS notifications

**Authentication/Security:**
- `bcryptjs` ^3.0.3 - Password hashing
- `@simplewebauthn/browser` ^9.0.1 - WebAuthn client-side (passkeys)
- `@simplewebauthn/server` ^9.0.3 - WebAuthn server-side (passkeys)

**State Management:**
- Zustand ^5.0.10 - Client-side state
- SuperJSON ^2.2.1 - Serialization for tRPC

**UI Components:**
- Radix UI - Headless primitives (`@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-slot`, `radix-ui` ^1.4.3)
- shadcn ^3.7.0 - Component library (built on Radix UI)
- Lucide React ^0.469.0 - Icon library
- Motion ^12.29.0 - Animation library (Framer Motion successor)
- `class-variance-authority` ^0.7.1 - Component variant styling
- `clsx` ^2.1.1 - Conditional class names
- `tailwind-merge` ^3.4.0 - Tailwind class merging
- `tw-animate-css` ^1.4.0 - Tailwind animation utilities
- `react-markdown` ^10.1.0 - Markdown rendering (for AI chat responses)
- `react-hook-form` ^7.71.1 - Form state management
- `@hookform/resolvers` ^5.2.2 - Zod integration for react-hook-form

**PWA:**
- `@serwist/next` ^9.5.0 - Service worker integration for Next.js
- Serwist ^9.5.0 - Service worker tooling (precaching, runtime caching)

**Infrastructure:**
- `@upstash/redis` ^1.36.1 - Redis client (REST-based, serverless-friendly)
- Convex ^1.31.5 - Real-time backend (optional, currently stubbed out)
- `server-only` ^0.0.1 - Prevents server code from being imported in client

## Database

**Provider:** PostgreSQL
- Schema: `prisma/schema.prisma`
- Generated client output: `generated/prisma/`
- Connection: `DATABASE_URL` env var (supports Vercel Postgres connection pooling)
- Direct connection: `DATABASE_URL_UNPOOLED` (for migrations, bypasses pooling)

**ORM:** Prisma ^6.6.0
- Client: `@prisma/client` ^6.6.0
- DB instance: `src/server/db.ts`
- Adapter: `@auth/prisma-adapter` for NextAuth

**Models:**
- Core NextAuth: `User`, `Account`, `Session`, `VerificationToken`
- ALVIN domain: `UserProfile`, `Passkey`, `Conversation`, `Message`, `CheckIn`, `Contact`, `Alert`, `PushSubscription`

**Caching:** Upstash Redis (REST API, used for WebAuthn challenge storage)

## Configuration

**Environment:**
- Validated via `@t3-oss/env-nextjs` in `src/env.js`
- Template: `.env.example`
- Local dev: `.env.local` (gitignored)
- `SKIP_ENV_VALIDATION` flag for Docker builds

**Required env vars (server):**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (required in production)
- `ANTHROPIC_API_KEY` - Claude API key
- `UPSTASH_REDIS_REST_URL` - Redis REST endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token
- `CRON_SECRET` - Secures cron endpoints
- `VAPID_PRIVATE_KEY` - Web Push VAPID private key
- `VAPID_CONTACT_EMAIL` - VAPID subject email

**Required env vars (client):**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Web Push VAPID public key

**Optional env vars:**
- `DATABASE_URL_UNPOOLED` - Direct DB connection for migrations
- `RESEND_API_KEY` - Email delivery
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - SMS
- `NEXT_PUBLIC_CONVEX_URL` - Convex real-time (currently disabled)

**Build:**
- `next.config.mjs` - Next.js config with Serwist PWA wrapper
- `tsconfig.json` - TypeScript strict mode, path alias `~/*` → `./src/*`
- `eslint.config.js` - Flat config with `typescript-eslint` recommended + type-checked
- `postcss.config.js` (implied) - Tailwind CSS v4 via `@tailwindcss/postcss`
- `vitest.config.ts` - Vitest with jsdom, path aliases, setup file

**Path Aliases:**
- `~/*` → `./src/*` (configured in `tsconfig.json`, mirrored in `vitest.config.ts`)

## Platform Requirements

**Development:**
- Node.js 20+
- npm 9+
- PostgreSQL (local or remote)
- Upstash Redis account

**Production:**
- Vercel (deployment target)
- Vercel Postgres or external PostgreSQL
- Upstash Redis
- Anthropic API key
- VAPID keys for push notifications

**Scaffolding:**
- Created with create-t3-app v7.40.0 (`ct3aMetadata` in `package.json`)

---

*Stack analysis: 2026-01-28*
