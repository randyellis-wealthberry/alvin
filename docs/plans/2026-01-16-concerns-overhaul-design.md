# Comprehensive Concerns Overhaul

**Date:** 2026-01-16
**Status:** Approved
**Scope:** Address all concerns from `.planning/codebase/CONCERNS.md`

## Overview

This design addresses all identified technical debt, missing features, and quality gaps in the T3 Stack codebase to make it production-ready with full test coverage.

## Phase 1: Quick Fixes

### 1.1 Environment Documentation

**New file:** `.env.example`

```bash
DATABASE_URL="file:./db.sqlite"
AUTH_SECRET="your-secret-key-here"  # Required in production
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

### 1.2 Gate Console Logging

**File:** `src/server/api/trpc.ts` (line 99)

Wrap timing log with development check:
```typescript
if (process.env.NODE_ENV === "development") {
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
}
```

### 1.3 Remove Dead Comments

**File:** `src/server/auth/config.ts` (lines 18-25)

Delete commented-out role field placeholders to reduce confusion.

## Phase 2: Test Infrastructure

### 2.1 Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

### 2.2 Vitest Configuration

**New file:** `vitest.config.ts`

```typescript
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
```

**New file:** `vitest.setup.ts`

```typescript
import "@testing-library/jest-dom/vitest";
```

### 2.3 Package Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Phase 3: Rate Limiting

### 3.1 Rate Limiter Module

**New file:** `src/server/api/rate-limit.ts`

```typescript
import { TRPCError } from "@trpc/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 100,
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): void {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now);
  }

  if (!entry || now > entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return;
  }

  if (entry.count >= config.maxRequests) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  entry.count++;
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

// For testing
export function resetRateLimitStore(): void {
  store.clear();
}
```

### 3.2 Rate Limited Procedure

**File:** `src/server/api/trpc.ts`

Add new procedure:
```typescript
import { checkRateLimit } from "./rate-limit";

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const identifier = ctx.headers.get("x-forwarded-for") ??
                     ctx.headers.get("x-real-ip") ??
                     "unknown";
  checkRateLimit(identifier);
  return next();
});

export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware);
```

### 3.3 Apply to Mutations

**File:** `src/server/api/routers/post.ts`

Change `create` mutation from `protectedProcedure` to use both rate limiting and auth:
```typescript
create: protectedProcedure
  .use(rateLimitMiddleware)  // Add rate limiting
  .input(z.object({ name: z.string().min(1) }))
  .mutation(...)
```

## Phase 4: Error Handling & UX

### 4.1 Mutation Error Handling

**File:** `src/app/_components/post.tsx`

```typescript
const [error, setError] = useState<string | null>(null);

const createPost = api.post.create.useMutation({
  onSuccess: async () => {
    setName("");
    setError(null);
    await utils.post.invalidate();
  },
  onError: (err) => {
    setError(err.message || "Failed to create post. Please try again.");
  },
});
```

Add error display in JSX:
```tsx
{error && (
  <p className="text-red-500 text-sm">{error}</p>
)}
```

### 4.2 Client-Side Validation

**File:** `src/app/_components/post.tsx`

```tsx
<input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  minLength={1}
  className="..."
/>
<button
  type="submit"
  disabled={createPost.isPending || name.trim().length === 0}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {createPost.isPending ? "Submitting..." : "Submit"}
</button>
```

### 4.3 Error Boundary

**New file:** `src/app/error.tsx`

```tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Error boundary caught:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-gray-600">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

## Phase 5: Test Coverage

### 5.1 Test File Structure

```
src/
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   └── post.test.ts
│   │   ├── trpc.test.ts
│   │   └── rate-limit.test.ts
│   └── auth/
│       └── config.test.ts
├── app/
│   └── _components/
│       └── post.test.tsx
└── env.test.ts
```

### 5.2 Test Summaries

**post.test.ts** — Post router tests
- `hello` query returns greeting with input text
- `create` mutation requires authentication
- `create` mutation creates post with valid input
- `getLatest` returns most recent post for user
- `getSecretMessage` requires authentication

**trpc.test.ts** — Procedure and context tests
- `publicProcedure` allows unauthenticated access
- `protectedProcedure` throws UNAUTHORIZED without session
- `protectedProcedure` allows access with valid session
- Context includes db, session, and headers

**rate-limit.test.ts** — Rate limiter tests
- Allows requests under limit
- Throws TOO_MANY_REQUESTS when limit exceeded
- Resets after window expires
- Handles multiple identifiers independently

**config.test.ts** — Auth config tests
- Session callback adds user ID to session
- Discord provider is configured

**post.test.tsx** — Component tests
- Renders form with input and button
- Disables button when input is empty
- Shows loading state during submission
- Displays error message on failure
- Clears form on success

**env.test.ts** — Environment validation tests
- Accepts valid environment variables
- Requires DATABASE_URL
- Requires AUTH_SECRET in production

### 5.3 Mocking Strategy

**Prisma mock:**
```typescript
vi.mock("~/server/db", () => ({
  db: {
    post: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));
```

**Auth mock:**
```typescript
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));
```

**tRPC test caller:**
```typescript
const caller = appRouter.createCaller({
  session: mockSession,
  db: mockDb,
  headers: new Headers(),
});
```

## Summary

| Phase | Items | New Files | Edited Files |
|-------|-------|-----------|--------------|
| 1. Quick fixes | 3 | 1 | 2 |
| 2. Test infra | 3 | 2 | 1 |
| 3. Rate limiting | 2 | 1 | 2 |
| 4. Error handling | 3 | 1 | 1 |
| 5. Test coverage | 6 | 6 | 0 |
| **Total** | **17** | **11** | **6** |

## Out of Scope

- **NextAuth stable upgrade** — Depends on v5 stable release
- **PostgreSQL migration** — Infrastructure decision for production
- **Redis rate limiting** — Overkill for current scale

---

*Design approved: 2026-01-16*
