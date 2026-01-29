# Testing Patterns

**Analysis Date:** 2026-01-28

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in (`expect`)
- `@testing-library/jest-dom` for DOM matchers (extended via `vitest.setup.ts`)

**Component Testing:**
- `@testing-library/react` 16.x
- `@vitejs/plugin-react` for JSX support
- `jsdom` environment

**Run Commands:**
```bash
npm run test              # Run all tests (vitest run)
npm run test:watch        # Watch mode (vitest)
npm run test:coverage     # Coverage (vitest run --coverage)
```

## Test File Organization

**Location:**
- Co-located with source files (tests live next to the code they test)

**Naming:**
- `{module}.test.ts` for server-side logic
- `{component}.test.tsx` for React components

**Existing Test Files:**
```
src/
├── env.test.ts                          # Environment variable validation
├── app/_components/post.test.tsx        # React component test
└── server/
    └── api/
        ├── trpc.test.ts                 # tRPC context creation
        ├── rate-limit.test.ts           # Rate limiting logic
        ├── routers/post.test.ts         # tRPC router tests
        └── auth/config.test.ts          # Auth session callback
```

**Important:** Test files are excluded from both TypeScript compilation (`tsconfig.json` excludes `**/*.test.ts` and `**/*.test.tsx`) and ESLint (`eslint.config.js` ignores them). This means tests have relaxed type checking.

## Vitest Configuration

**Config:** `vitest.config.ts`

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

**Setup File:** `vitest.setup.ts`

```typescript
import "@testing-library/jest-dom/vitest";
```

**Key Points:**
- `globals: true` -- `describe`, `it`, `expect` available without imports (but tests still import them explicitly from `vitest`)
- Path alias `~` maps to `./src` to match `tsconfig.json`
- jsdom environment for all tests (including server-side tests)

## Test Structure

**Suite Organization:**
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

// 1. Mock modules BEFORE importing tested code
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: { post: { create: vi.fn(), findFirst: vi.fn() } },
}));

// 2. Import tested code AFTER mocks
import { appRouter } from "~/server/api/root";

describe("feature name", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sub-feature", () => {
    it("describes expected behavior", async () => {
      // Arrange, Act, Assert
    });
  });
});
```

**Patterns:**
- Always call `vi.clearAllMocks()` in `beforeEach`
- Use `vi.useFakeTimers()` / `vi.useRealTimers()` for time-dependent tests (see `rate-limit.test.ts`)
- Use `eslint-disable` comments at top of test files to suppress strict TS rules

## Mocking

**Framework:** Vitest `vi.mock()` and `vi.fn()`

**tRPC Router Testing Pattern:**
```typescript
// Mock dependencies
vi.mock("~/server/auth", () => ({ auth: vi.fn() }));
vi.mock("~/server/db", () => ({
  db: { post: { create: vi.fn(), findFirst: vi.fn() } },
}));

// Create a caller with mock context
const createCaller = (session: typeof mockSession | null) => {
  const ctx = {
    db: mockDb,
    session,
    headers: new Headers(),
  } as unknown as Awaited<ReturnType<typeof createTRPCContext>>;
  return appRouter.createCaller(ctx);
};

// Use the caller
const caller = createCaller(mockSession);
const result = await caller.post.hello({ text: "World" });
```

**React Component Testing Pattern:**
```typescript
// Mock tRPC hooks
const mockMutate = vi.fn();
vi.mock("~/trpc/react", () => ({
  api: {
    post: {
      getLatest: {
        useSuspenseQuery: vi.fn(() => [null]),
      },
      create: {
        useMutation: vi.fn((options) => ({
          mutate: (input) => {
            mockMutate(input);
            if (options?.onSuccess) options.onSuccess();
          },
          isPending: false,
        })),
      },
    },
    useUtils: vi.fn(() => ({
      post: { invalidate: vi.fn() },
    })),
  },
}));
```

**What to Mock:**
- `~/server/auth` (NextAuth session)
- `~/server/db` (Prisma client)
- `~/trpc/react` (tRPC React hooks for component tests)
- `~/server/api/rate-limit` (rate limiting in router tests)

**What NOT to Mock:**
- The router logic itself (test through `appRouter.createCaller`)
- Zod validation schemas (test directly)
- Pure utility functions

## Fixtures and Factories

**Test Data:**
```typescript
// Session mock (reused across tests)
const mockSession = {
  user: { id: "user-123", name: "Test User", email: "test@example.com" },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// Rate limit config
const config: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 3,
};
```

**Location:**
- Inline within test files. No shared fixture files exist.

## Coverage

**Requirements:** None enforced
**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests:**
- tRPC router procedures tested via `appRouter.createCaller()` with mocked DB and session
- Pure logic functions (rate limiting, env validation) tested directly
- React components tested with `@testing-library/react` and mocked tRPC hooks

**Integration Tests:**
- Not present. All tests mock external dependencies.

**E2E Tests:**
- Not present. No Playwright, Cypress, or similar framework.

## Common Patterns

**Async Testing:**
```typescript
it("requires authentication", async () => {
  const caller = createCaller(null);
  await expect(caller.post.create({ name: "Test" })).rejects.toThrow(TRPCError);
});
```

**Error Testing:**
```typescript
it("throws TOO_MANY_REQUESTS when limit exceeded", () => {
  checkRateLimit("user-1", config);
  checkRateLimit("user-1", config);
  checkRateLimit("user-1", config);
  expect(() => checkRateLimit("user-1", config)).toThrow("Rate limit exceeded");
});
```

**Timer Testing:**
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

it("resets after window expires", () => {
  // ... exhaust limit
  vi.advanceTimersByTime(60001);
  expect(() => checkRateLimit("user-1", config)).not.toThrow();
});
```

**Component Rendering:**
```typescript
it("renders form with input and button", () => {
  render(<LatestPost />);
  expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});
```

**Async Component Interaction:**
```typescript
it("calls mutate on form submission", async () => {
  render(<LatestPost />);
  fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "Test" } });
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await waitFor(() => {
    expect(mockMutate).toHaveBeenCalledWith({ name: "Test" });
  });
});
```

## Gaps and Notes

- Only 6 test files exist covering a small fraction of the codebase
- No tests for: `alert`, `auth`, `checkin`, `contact`, `conversation`, `dashboard`, `passkey`, `profile`, `push` routers
- No tests for any page components in the `(app)` route group
- No tests for lib utilities (`~/lib/alerts/`, `~/lib/ai/`, `~/lib/reminders/`, `~/lib/convex/`)
- No integration or E2E tests
- No CI pipeline detected (no `.github/workflows/` directory)

---

*Testing analysis: 2026-01-28*
