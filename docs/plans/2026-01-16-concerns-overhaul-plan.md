# Concerns Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address all technical debt, add error handling, implement rate limiting, and achieve full test coverage.

**Architecture:** Incremental improvements to existing T3 Stack codebase. Rate limiting via in-memory Map. Test coverage via Vitest with mocked Prisma and auth.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/jest-dom, jsdom

---

## Task 1: Create .env.example

**Files:**
- Create: `.env.example`

**Step 1: Create the file**

```bash
# .env.example
# Database
DATABASE_URL="file:./db.sqlite"

# NextAuth
AUTH_SECRET="your-secret-key-here"  # Required in production

# Discord OAuth
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example for environment setup"
```

---

## Task 2: Gate console.log in timing middleware

**Files:**
- Modify: `src/server/api/trpc.ts:99`

**Step 1: Update the timing middleware**

Change line 99 from:
```typescript
console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
```

To:
```typescript
if (t._config.isDev) {
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
}
```

**Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/server/api/trpc.ts
git commit -m "fix: gate timing console.log behind development check"
```

---

## Task 3: Remove commented role implementation

**Files:**
- Modify: `src/server/auth/config.ts:17-25`

**Step 1: Clean up the comments**

Remove lines 17-19 (the comments inside Session interface):
```typescript
// ...other properties
// role: UserRole;
```

Remove lines 22-25 (the commented User interface):
```typescript
// interface User {
//   // ...other properties
//   // role: UserRole;
// }
```

The Session interface should become:
```typescript
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

**Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/server/auth/config.ts
git commit -m "chore: remove placeholder role comments from auth config"
```

---

## Task 4: Set up Vitest infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

**Step 1: Install dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Step 2: Create vitest.config.ts**

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

**Step 3: Create vitest.setup.ts**

```typescript
import "@testing-library/jest-dom/vitest";
```

**Step 4: Add test scripts to package.json**

Add to the "scripts" section:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Step 5: Verify setup works**

Run: `npm test`
Expected: "No test files found" (no error, just no tests yet)

**Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "chore: set up Vitest test infrastructure"
```

---

## Task 5: Create rate limiting module with tests

**Files:**
- Create: `src/server/api/rate-limit.ts`
- Create: `src/server/api/rate-limit.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/server/api/rate-limit.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkRateLimit,
  resetRateLimitStore,
  type RateLimitConfig,
} from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    const config: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      maxRequests: 3,
    };

    it("allows requests under the limit", () => {
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
    });

    it("throws TOO_MANY_REQUESTS when limit exceeded", () => {
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);

      expect(() => checkRateLimit("user-1", config)).toThrow(
        "Rate limit exceeded"
      );
    });

    it("resets after window expires", () => {
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);

      // Advance time past the window
      vi.advanceTimersByTime(60001);

      // Should allow requests again
      expect(() => checkRateLimit("user-1", config)).not.toThrow();
    });

    it("tracks different identifiers independently", () => {
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);
      checkRateLimit("user-1", config);

      // user-2 should still be able to make requests
      expect(() => checkRateLimit("user-2", config)).not.toThrow();
    });

    it("uses default config when none provided", () => {
      // Should not throw with default config (100 requests per minute)
      for (let i = 0; i < 100; i++) {
        expect(() => checkRateLimit("user-1")).not.toThrow();
      }
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL - module not found

**Step 3: Implement rate-limit.ts**

```typescript
// src/server/api/rate-limit.ts
import { TRPCError } from "@trpc/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): void {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries periodically (1% chance)
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

export function resetRateLimitStore(): void {
  store.clear();
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All 5 tests PASS

**Step 5: Commit**

```bash
git add src/server/api/rate-limit.ts src/server/api/rate-limit.test.ts
git commit -m "feat: add in-memory rate limiting module with tests"
```

---

## Task 6: Integrate rate limiting into tRPC

**Files:**
- Modify: `src/server/api/trpc.ts`

**Step 1: Add rate limit middleware**

After line 102 (after timingMiddleware), add:

```typescript
import { checkRateLimit } from "./rate-limit";

/**
 * Rate limiting middleware
 *
 * Limits requests per IP address. Uses in-memory storage (resets on restart).
 * For production at scale, consider Redis-based rate limiting.
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const identifier =
    ctx.headers.get("x-forwarded-for") ??
    ctx.headers.get("x-real-ip") ??
    "unknown";
  checkRateLimit(identifier);
  return next();
});

/**
 * Rate-limited public procedure
 *
 * Use for public endpoints that should have rate limiting (e.g., mutations).
 */
export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware);
```

**Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/server/api/trpc.ts
git commit -m "feat: add rate limiting middleware to tRPC"
```

---

## Task 7: Apply rate limiting to post creation

**Files:**
- Modify: `src/server/api/routers/post.ts`

**Step 1: Import rateLimitMiddleware and apply to create mutation**

Update imports:
```typescript
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  rateLimitedProcedure,
} from "~/server/api/trpc";
```

Note: We need to export `rateLimitMiddleware` from trpc.ts. Update trpc.ts line to:
```typescript
export const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
```

Then in post.ts, change the create mutation to use both middlewares:
```typescript
create: protectedProcedure
  .use(rateLimitMiddleware)
  .input(z.object({ name: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.post.create({
      data: {
        name: input.name,
        createdBy: { connect: { id: ctx.session.user.id } },
      },
    });
  }),
```

Update trpc.ts imports in post.ts:
```typescript
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  rateLimitMiddleware,
} from "~/server/api/trpc";
```

**Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/server/api/trpc.ts src/server/api/routers/post.ts
git commit -m "feat: apply rate limiting to post creation mutation"
```

---

## Task 8: Add error handling to post component

**Files:**
- Modify: `src/app/_components/post.tsx`

**Step 1: Update the component with error handling**

Replace the entire file content:

```tsx
"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to create post. Please try again.");
    },
  });

  const isInputEmpty = name.trim().length === 0;

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isInputEmpty) return;
          setError(null);
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={createPost.isPending || isInputEmpty}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
```

**Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/_components/post.tsx
git commit -m "feat: add error handling and client-side validation to post form"
```

---

## Task 9: Create error boundary

**Files:**
- Create: `src/app/error.tsx`

**Step 1: Create the error boundary component**

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-gray-300">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/20"
      >
        Try again
      </button>
    </div>
  );
}
```

**Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/error.tsx
git commit -m "feat: add error boundary for graceful error handling"
```

---

## Task 10: Write post router tests

**Files:**
- Create: `src/server/api/routers/post.test.ts`

**Step 1: Create the test file**

```typescript
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { appRouter } from "~/server/api/root";
import { type createTRPCContext } from "~/server/api/trpc";

// Mock Prisma
vi.mock("~/server/db", () => ({
  db: {
    post: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

// Mock rate limit to avoid interference
vi.mock("~/server/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  resetRateLimitStore: vi.fn(),
}));

import { db } from "~/server/db";

const mockDb = vi.mocked(db);

describe("post router", () => {
  const mockSession = {
    user: { id: "user-123", name: "Test User", email: "test@example.com" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const createCaller = (session: typeof mockSession | null) => {
    const ctx = {
      db: mockDb,
      session,
      headers: new Headers(),
    } as unknown as Awaited<ReturnType<typeof createTRPCContext>>;
    return appRouter.createCaller(ctx);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hello", () => {
    it("returns greeting with input text", async () => {
      const caller = createCaller(null);
      const result = await caller.post.hello({ text: "World" });
      expect(result.greeting).toBe("Hello World");
    });
  });

  describe("create", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);
      await expect(caller.post.create({ name: "Test Post" })).rejects.toThrow(
        TRPCError
      );
    });

    it("creates post with valid input", async () => {
      const caller = createCaller(mockSession);
      const mockPost = {
        id: 1,
        name: "Test Post",
        createdById: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.post.create.mockResolvedValue(mockPost);

      const result = await caller.post.create({ name: "Test Post" });

      expect(result).toEqual(mockPost);
      expect(mockDb.post.create).toHaveBeenCalledWith({
        data: {
          name: "Test Post",
          createdBy: { connect: { id: "user-123" } },
        },
      });
    });
  });

  describe("getLatest", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);
      await expect(caller.post.getLatest()).rejects.toThrow(TRPCError);
    });

    it("returns the most recent post for user", async () => {
      const caller = createCaller(mockSession);
      const mockPost = {
        id: 1,
        name: "Latest Post",
        createdById: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.post.findFirst.mockResolvedValue(mockPost);

      const result = await caller.post.getLatest();

      expect(result).toEqual(mockPost);
      expect(mockDb.post.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        where: { createdBy: { id: "user-123" } },
      });
    });

    it("returns null when no posts exist", async () => {
      const caller = createCaller(mockSession);
      mockDb.post.findFirst.mockResolvedValue(null);

      const result = await caller.post.getLatest();

      expect(result).toBeNull();
    });
  });

  describe("getSecretMessage", () => {
    it("requires authentication", async () => {
      const caller = createCaller(null);
      await expect(caller.post.getSecretMessage()).rejects.toThrow(TRPCError);
    });

    it("returns secret message when authenticated", async () => {
      const caller = createCaller(mockSession);
      const result = await caller.post.getSecretMessage();
      expect(result).toBe("you can now see this secret message!");
    });
  });
});
```

**Step 2: Run tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/server/api/routers/post.test.ts
git commit -m "test: add post router unit tests"
```

---

## Task 11: Write tRPC context and procedure tests

**Files:**
- Create: `src/server/api/trpc.test.ts`

**Step 1: Create the test file**

```typescript
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth before importing trpc
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: {},
}));

import { auth } from "~/server/auth";
import { createTRPCContext } from "./trpc";

const mockAuth = vi.mocked(auth);

describe("tRPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTRPCContext", () => {
    it("creates context with session when authenticated", async () => {
      const mockSession = {
        user: { id: "user-123", name: "Test", email: "test@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const headers = new Headers();
      headers.set("x-test", "value");

      const ctx = await createTRPCContext({ headers });

      expect(ctx.session).toEqual(mockSession);
      expect(ctx.headers).toBe(headers);
      expect(ctx.db).toBeDefined();
    });

    it("creates context without session when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const headers = new Headers();
      const ctx = await createTRPCContext({ headers });

      expect(ctx.session).toBeNull();
      expect(ctx.headers).toBe(headers);
    });
  });
});
```

**Step 2: Run tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/server/api/trpc.test.ts
git commit -m "test: add tRPC context creation tests"
```

---

## Task 12: Write auth config tests

**Files:**
- Create: `src/server/auth/config.test.ts`

**Step 1: Create the test file**

```typescript
import { describe, expect, it } from "vitest";

import { authConfig } from "./config";

describe("auth config", () => {
  describe("providers", () => {
    it("includes Discord provider", () => {
      expect(authConfig.providers).toHaveLength(1);
      expect(authConfig.providers[0]).toBeDefined();
    });
  });

  describe("callbacks", () => {
    describe("session", () => {
      it("adds user id to session", () => {
        const mockSession = {
          user: { name: "Test", email: "test@example.com" },
          expires: new Date().toISOString(),
        };
        const mockUser = { id: "user-123", name: "Test", email: "test@example.com" };

        const result = authConfig.callbacks.session({
          session: mockSession as any,
          user: mockUser as any,
          trigger: "update",
          newSession: undefined,
        });

        expect(result.user.id).toBe("user-123");
      });

      it("preserves existing session properties", () => {
        const mockSession = {
          user: { name: "Test", email: "test@example.com", image: "https://example.com/img.jpg" },
          expires: "2026-01-17T00:00:00.000Z",
        };
        const mockUser = { id: "user-123", name: "Test", email: "test@example.com" };

        const result = authConfig.callbacks.session({
          session: mockSession as any,
          user: mockUser as any,
          trigger: "update",
          newSession: undefined,
        });

        expect(result.expires).toBe("2026-01-17T00:00:00.000Z");
        expect(result.user.name).toBe("Test");
        expect(result.user.email).toBe("test@example.com");
      });
    });
  });

  describe("adapter", () => {
    it("uses Prisma adapter", () => {
      expect(authConfig.adapter).toBeDefined();
    });
  });
});
```

**Step 2: Run tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/server/auth/config.test.ts
git commit -m "test: add auth config tests"
```

---

## Task 13: Write post component tests

**Files:**
- Create: `src/app/_components/post.test.tsx`

**Step 1: Create the test file**

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the tRPC hooks
const mockMutate = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("~/trpc/react", () => ({
  api: {
    post: {
      getLatest: {
        useSuspenseQuery: vi.fn(() => [null]),
      },
      create: {
        useMutation: vi.fn((options) => ({
          mutate: (input: { name: string }) => {
            mockMutate(input);
            // Simulate success by default
            if (options?.onSuccess) {
              options.onSuccess();
            }
          },
          isPending: false,
        })),
      },
    },
    useUtils: vi.fn(() => ({
      post: {
        invalidate: mockInvalidate,
      },
    })),
  },
}));

import { LatestPost } from "./post";

describe("LatestPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with input and button", () => {
    render(<LatestPost />);

    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("shows 'You have no posts yet' when no posts exist", () => {
    render(<LatestPost />);

    expect(screen.getByText("You have no posts yet.")).toBeInTheDocument();
  });

  it("disables submit button when input is empty", () => {
    render(<LatestPost />);

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeDisabled();
  });

  it("enables submit button when input has text", () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "My Post" } });

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).not.toBeDisabled();
  });

  it("calls mutate on form submission", async () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "Test Post" } });

    const button = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ name: "Test Post" });
    });
  });

  it("clears input on successful submission", async () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test Post" } });

    const button = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("does not submit when input is only whitespace", () => {
    render(<LatestPost />);

    const input = screen.getByPlaceholderText("Title");
    fireEvent.change(input, { target: { value: "   " } });

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeDisabled();
  });
});
```

**Step 2: Run tests**

Run: `npm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/app/_components/post.test.tsx
git commit -m "test: add post component tests"
```

---

## Task 14: Write environment validation tests

**Files:**
- Create: `src/env.test.ts`

**Step 1: Create the test file**

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("requires DATABASE_URL", async () => {
    process.env.DATABASE_URL = undefined;
    process.env.AUTH_DISCORD_ID = "test-id";
    process.env.AUTH_DISCORD_SECRET = "test-secret";
    process.env.SKIP_ENV_VALIDATION = undefined;

    await expect(async () => {
      await import("./env");
    }).rejects.toThrow();
  });

  it("requires AUTH_DISCORD_ID", async () => {
    process.env.DATABASE_URL = "file:./test.db";
    process.env.AUTH_DISCORD_ID = undefined;
    process.env.AUTH_DISCORD_SECRET = "test-secret";
    process.env.SKIP_ENV_VALIDATION = undefined;

    await expect(async () => {
      await import("./env");
    }).rejects.toThrow();
  });

  it("requires AUTH_DISCORD_SECRET", async () => {
    process.env.DATABASE_URL = "file:./test.db";
    process.env.AUTH_DISCORD_ID = "test-id";
    process.env.AUTH_DISCORD_SECRET = undefined;
    process.env.SKIP_ENV_VALIDATION = undefined;

    await expect(async () => {
      await import("./env");
    }).rejects.toThrow();
  });

  it("allows AUTH_SECRET to be optional in development", async () => {
    process.env.DATABASE_URL = "file:./test.db";
    process.env.AUTH_DISCORD_ID = "test-id";
    process.env.AUTH_DISCORD_SECRET = "test-secret";
    process.env.AUTH_SECRET = undefined;
    process.env.NODE_ENV = "development";
    process.env.SKIP_ENV_VALIDATION = undefined;

    // Should not throw
    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("file:./test.db");
  });

  it("skips validation when SKIP_ENV_VALIDATION is set", async () => {
    process.env.DATABASE_URL = undefined;
    process.env.AUTH_DISCORD_ID = undefined;
    process.env.AUTH_DISCORD_SECRET = undefined;
    process.env.SKIP_ENV_VALIDATION = "true";

    // Should not throw
    const result = await import("./env");
    expect(result.env).toBeDefined();
  });
});
```

**Step 2: Run tests**

Run: `npm test`
Expected: All tests PASS (some may be skipped due to module caching - this is expected)

**Step 3: Commit**

```bash
git add src/env.test.ts
git commit -m "test: add environment validation tests"
```

---

## Task 15: Final verification and cleanup

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests PASS

**Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors (or only warnings)

**Step 4: Format code**

```bash
npm run format:write
```

**Step 5: Commit any formatting changes**

```bash
git add -A
git commit -m "style: apply formatting" --allow-empty
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create .env.example | 1 new |
| 2 | Gate console.log | 1 edit |
| 3 | Remove dead comments | 1 edit |
| 4 | Set up Vitest | 3 new, 1 edit |
| 5 | Rate limit module + tests | 2 new |
| 6 | Integrate rate limiting | 1 edit |
| 7 | Apply to post creation | 2 edit |
| 8 | Error handling in component | 1 edit |
| 9 | Error boundary | 1 new |
| 10 | Post router tests | 1 new |
| 11 | tRPC context tests | 1 new |
| 12 | Auth config tests | 1 new |
| 13 | Post component tests | 1 new |
| 14 | Env validation tests | 1 new |
| 15 | Final verification | - |

**Total: 11 new files, 7 edited files, 15 commits**
