# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** T3 Stack Full-Stack Monolith with RPC-Based Data Layer

**Key Characteristics:**
- Single codebase with client and server colocated
- Type-safe end-to-end communication via tRPC
- Server-Side Rendering with React Server Components
- Automatic type inference from server to client

## Layers

**Presentation Layer (Client):**
- Purpose: React components and UI rendering
- Contains: Pages, client components, React Query providers
- Location: `src/app/`, `src/app/_components/`
- Depends on: tRPC client, React Query
- Used by: Users via browser

**API Routing Layer (Next.js Routes):**
- Purpose: HTTP endpoints for tRPC and authentication
- Contains: Route handlers, request processing
- Location: `src/app/api/trpc/[trpc]/`, `src/app/api/auth/[...nextauth]/`
- Depends on: tRPC server, NextAuth
- Used by: tRPC client, auth flows

**Business Logic Layer (tRPC Routers):**
- Purpose: Core application logic and data operations
- Contains: Procedures, input validation, authorization
- Location: `src/server/api/routers/`, `src/server/api/trpc.ts`
- Depends on: Prisma, auth context
- Used by: API routes

**Service Layer:**
- Purpose: Cross-cutting concerns (auth, database, env)
- Contains: Auth config, database client, environment validation
- Location: `src/server/auth/`, `src/server/db.ts`, `src/env.js`
- Depends on: Prisma, NextAuth, environment
- Used by: Business logic layer

**Data Layer (Prisma + SQLite):**
- Purpose: Data persistence and ORM
- Contains: Schema definitions, migrations, client
- Location: `prisma/schema.prisma`
- Depends on: SQLite database
- Used by: Service and business logic layers

## Data Flow

**HTTP Request (Client Component Query):**

1. User interacts with client component (`src/app/_components/post.tsx`)
2. tRPC client calls procedure via `api.post.getLatest()`
3. HTTP request to `/api/trpc` with batched calls
4. `fetchRequestHandler` processes request (`src/app/api/trpc/[trpc]/route.ts`)
5. `createTRPCContext` creates context with session (`src/server/api/trpc.ts`)
6. Router procedure executes (`src/server/api/routers/post.ts`)
7. Prisma query to SQLite database (`src/server/db.ts`)
8. Response serialized via SuperJSON and returned
9. React Query caches and renders data

**Server Component Prefetch:**

1. Server Component renders (`src/app/page.tsx`)
2. Direct call via `createCaller` (no HTTP)
3. Query results dehydrated via `HydrateClient`
4. Client hydrates with cached data (no waterfall)

**State Management:**
- Server state: React Query with 30s stale time
- Client state: React useState for forms
- Session state: NextAuth with Prisma adapter

## Key Abstractions

**tRPC Procedures:**
- Purpose: Type-safe API endpoints
- Examples: `publicProcedure`, `protectedProcedure` in `src/server/api/trpc.ts`
- Pattern: Middleware chain with context injection

**tRPC Routers:**
- Purpose: Group related procedures by domain
- Examples: `postRouter` in `src/server/api/routers/post.ts`
- Pattern: Created via `createTRPCRouter`, merged in `src/server/api/root.ts`

**React Query Hooks:**
- Purpose: Data fetching with caching
- Examples: `useSuspenseQuery`, `useMutation` via tRPC wrapper
- Pattern: Auto-generated from router types (`src/trpc/react.tsx`)

## Entry Points

**App Entry:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Global providers, fonts, styles

**tRPC API:**
- Location: `src/app/api/trpc/[trpc]/route.ts`
- Triggers: All tRPC HTTP requests
- Responsibilities: Request handling, context creation, error formatting

**Auth API:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Auth flows (signin, signout, callbacks)
- Responsibilities: Delegates to NextAuth handlers

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Root URL access
- Responsibilities: SSR data fetching, hydration

## Error Handling

**Strategy:** tRPC errors bubble up to client, displayed by React Query

**Patterns:**
- Zod validation errors auto-formatted in tRPC context (`src/server/api/trpc.ts`)
- `TRPCError` thrown for authorization failures
- Development logging via `onError` callback
- Client displays errors via mutation/query state

## Cross-Cutting Concerns

**Logging:**
- tRPC timing middleware logs execution time (`src/server/api/trpc.ts`)
- Prisma logs queries in development (`src/server/db.ts`)
- Error logging in development mode only

**Validation:**
- Zod schemas at tRPC procedure inputs
- Environment variables validated at startup (`src/env.js`)
- Type-safe throughout via TypeScript inference

**Authentication:**
- NextAuth with Discord OAuth provider
- Session stored via Prisma adapter
- Protected procedures check `ctx.session.user`
- Session cached with `React.cache()` for RSC

---

*Architecture analysis: 2026-01-16*
*Update when major patterns change*
