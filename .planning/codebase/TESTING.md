# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Runner:**
- Not configured - no test framework in dependencies

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands configured
# npm test not defined in package.json
```

## Test File Organization

**Location:**
- No test files present

**Naming:**
- Not established (suggest `*.test.ts` pattern)

**Structure:**
- Not established

## Current State

**Test Coverage:**
- Zero test coverage
- No unit tests
- No integration tests
- No E2E tests

**What Needs Testing:**

1. **tRPC Procedures** (`src/server/api/routers/post.ts`)
   - `hello` query input/output
   - `create` mutation with auth
   - `getLatest` query with auth
   - `getSecretMessage` query with auth

2. **Authentication** (`src/server/auth/`)
   - `protectedProcedure` authorization logic
   - Session callback modifications
   - Discord OAuth flow

3. **Context Creation** (`src/server/api/trpc.ts`)
   - Context with session
   - Context without session

4. **Environment Validation** (`src/env.js`)
   - Required variables
   - Optional variables
   - Validation errors

## Recommended Setup

**Framework:**
```bash
# Recommended: Vitest (fast, ESM-native, similar API to Jest)
npm install -D vitest @testing-library/react
```

**Configuration:**
```typescript
// vitest.config.ts (to create)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

**Scripts:**
```json
// Add to package.json scripts
"test": "vitest",
"test:coverage": "vitest --coverage"
```

## Test Structure

**Recommended Pattern:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // reset state
    });

    it('should handle valid input', () => {
      // arrange
      // act
      // assert
    });

    it('should throw on invalid input', () => {
      expect(() => fn()).toThrow('error');
    });
  });
});
```

## Mocking

**What to Mock:**
- Database (Prisma client)
- External services (Discord OAuth)
- Environment variables
- NextAuth session

**Mocking Prisma:**
```typescript
import { vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

vi.mock('~/server/db', () => ({
  db: {
    post: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));
```

## Coverage

**Requirements:**
- Not established (recommend 80% for business logic)

**Priority Areas:**
1. tRPC procedures (high)
2. Auth middleware (high)
3. Environment validation (medium)
4. React components (medium)

## Test Types

**Unit Tests (Priority):**
- Scope: Individual procedures and functions
- Mocking: Mock Prisma, auth context
- Files: `src/server/api/routers/*.test.ts`

**Integration Tests (Future):**
- Scope: tRPC router with real database
- Setup: Test database instance
- Files: `tests/integration/`

**E2E Tests (Future):**
- Framework: Playwright recommended
- Scope: Full user flows
- Files: `e2e/`

## Common Patterns (Recommended)

**Async Testing:**
```typescript
it('should create post', async () => {
  const result = await caller.post.create({ name: 'Test' });
  expect(result.name).toBe('Test');
});
```

**Error Testing:**
```typescript
it('should throw unauthorized without session', async () => {
  await expect(caller.post.getLatest())
    .rejects.toThrow('UNAUTHORIZED');
});
```

**tRPC Testing:**
```typescript
// Create test caller with mocked context
const caller = appRouter.createCaller({
  session: null, // or mock session
  db: mockPrisma,
  headers: new Headers(),
});
```

---

*Testing analysis: 2026-01-16*
*Update when test framework is set up*
