# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- kebab-case for all source files: `rate-limit.ts`, `mobile-nav.tsx`, `query-client.ts`
- Component files use kebab-case (not PascalCase): `mobile-nav.tsx`, not `MobileNav.tsx`
- Router files named after the domain entity (singular): `contact.ts`, `checkin.ts`, `alert.ts`
- Test files co-located with source: `{name}.test.ts` / `{name}.test.tsx`

**Functions:**
- camelCase for all functions: `createTRPCContext`, `checkRateLimit`, `syncActivity`
- React components use PascalCase: `MobileNav`, `ContactFormModal`, `GlassCard`
- Event handlers prefixed with `handle`: `handleSubmit`
- Boolean state setters follow `set{State}` pattern: `setShowAddModal`, `setMounted`

**Variables:**
- camelCase for variables: `mockSession`, `activeAlert`, `currentStreak`
- UPPER_SNAKE_CASE for constants: `RELATIONSHIP_OPTIONS`, `PRIORITY_INFO`, `ACTIVE_LEVELS`
- Prefixed mock variables: `mockDb`, `mockAuth`, `mockMutate`

**Types:**
- PascalCase for types and interfaces: `Contact`, `RateLimitConfig`, `AppRouter`
- Use `type` keyword (not `interface`) for object shapes
- Inline type annotations preferred for component props over separate type declarations

**tRPC Routers:**
- Router variable: `{entity}Router` (e.g., `contactRouter`, `checkInRouter`)
- Procedure names: plain verbs/nouns: `list`, `create`, `update`, `delete`, `record`, `stats`

## Code Style

**Formatting:**
- Prettier with `prettier-plugin-tailwindcss`
- Config: `prettier.config.js`
- Default Prettier settings (no custom overrides beyond Tailwind plugin)
- Double quotes (Prettier default)
- Trailing commas
- 80 char print width (default)

**Linting:**
- ESLint 9 with flat config: `eslint.config.js`
- Extends: `next/core-web-vitals`, `typescript-eslint/recommended`, `recommendedTypeChecked`, `stylisticTypeChecked`
- Key rules:
  - `@typescript-eslint/consistent-type-imports`: warn, prefer `type` imports with inline style
  - `@typescript-eslint/no-unused-vars`: warn, ignore args starting with `_`
  - `@typescript-eslint/require-await`: off
  - `@typescript-eslint/consistent-type-definitions`: off (allows both `type` and `interface`)
  - `@typescript-eslint/array-type`: off
  - `@typescript-eslint/no-misused-promises`: error (except void return in attributes)
- Test files are excluded from ESLint entirely

**TypeScript Strictness:**
- `strict: true` in `tsconfig.json`
- `noUncheckedIndexedAccess: true` -- array/object index access returns `T | undefined`
- `checkJs: true` -- JS files are also type-checked
- `verbatimModuleSyntax: true` -- enforces explicit `type` imports
- `isolatedModules: true`
- Target: ES2022

## Import Organization

**Order:**
1. External packages (`react`, `next`, `@trpc/*`, `zod`, etc.)
2. Internal modules using path alias (`~/server/...`, `~/lib/...`, `~/trpc/...`)
3. Relative imports (siblings in same directory)

**Path Aliases:**
- `~/` maps to `./src/` (configured in both `tsconfig.json` and `vitest.config.ts`)
- Always use `~/` for cross-directory imports. Use relative imports only for same-directory files.

**Type Imports:**
- Use inline type imports: `import { type AppRouter } from "~/server/api/root"`
- Enforced by ESLint rule `consistent-type-imports` with `fixStyle: "inline-type-imports"`

## Error Handling

**tRPC Procedures:**
- Use `TRPCError` with appropriate codes: `throw new TRPCError({ code: "UNAUTHORIZED" })`
- Zod validation errors are automatically formatted and surfaced to clients via `errorFormatter` in `src/server/api/trpc.ts`
- Non-critical operations (like Convex sync) wrapped in try/catch with `console.error`

**Client Components:**
- Access mutation errors via `mutation.error?.message`
- Display inline error messages in colored containers

**General:**
- Use `throw new Error("message")` for non-tRPC server errors (e.g., ownership checks in `contact.ts`)
- No global error boundary detected

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- `console.log` for tRPC timing in dev: `[TRPC] ${path} took ${end - start}ms`
- `console.error` for non-critical failures: `"Convex sync failed (non-critical):"`
- Prisma query logging enabled in development via `log: ["query", "error", "warn"]` in `src/server/db.ts`

## Comments

**When to Comment:**
- Section dividers with line separators for major sections in large files:
  ```typescript
  // ---------------------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------------------
  ```
- Inline comments for business logic explanations: `// Allow missing today, but break on earlier gaps`
- JSDoc-style comments for tRPC infrastructure code (T3 boilerplate)

**JSDoc/TSDoc:**
- Used on tRPC infrastructure functions (`createTRPCContext`, `publicProcedure`, `protectedProcedure`)
- Not used on application-level functions or components

## Function Design

**Size:** No strict limit, but tRPC procedures tend to be self-contained (10-50 lines each)

**Parameters:**
- Destructured props for React components: `({ children, className, glow }: { ... })`
- Destructured `{ ctx, input }` for tRPC mutation/query handlers
- Zod schemas for input validation on tRPC procedures

**Return Values:**
- Prisma query results returned directly from tRPC procedures
- Empty arrays `[]` for "no results" (not `null`)
- Objects with named fields for stats: `{ totalCheckIns, currentStreak }`

## Module Design

**Exports:**
- Named exports preferred: `export const contactRouter`, `export function MobileNav`
- Default exports for Next.js page/layout components: `export default function ContactsPage()`
- Re-exports in `src/server/api/root.ts` for the app router

**Barrel Files:**
- Not used. Direct imports to specific files.

## Component Patterns

**Client Components:**
- Mark with `"use client"` directive at file top
- State managed with `useState` and tRPC React Query hooks
- Use `api.{router}.{procedure}.useQuery()` for reads
- Use `api.{router}.{procedure}.useMutation()` for writes
- Invalidate queries on mutation success: `await utils.{router}.invalidate()`

**Server Components:**
- Default (no directive needed)
- Used for layouts and pages that don't need interactivity

**UI Components:**
- shadcn/ui pattern in `src/components/ui/`
- Use `cva` (class-variance-authority) for variant-based styling
- Accept `className` prop and merge with `cn()` utility
- 37 UI component files

**Styling:**
- Tailwind CSS 4 with `@tailwindcss/postcss`
- `cn()` utility from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Dark mode only (hardcoded `"dark"` class on `<html>`)
- Glass-morphism design pattern: `bg-white/[0.03] backdrop-blur-xl`
- Custom animations: `animate-blob`, `animate-reveal`

## State Management

**Server State:**
- tRPC + React Query (via `@trpc/react-query`)
- Query client singleton pattern in browser, fresh instances on server

**Client State:**
- `useState` for local component state
- `zustand` available as dependency (installed but usage not confirmed in explored files)

**Form State:**
- Individual `useState` per field (not react-hook-form in all cases, despite it being a dependency)
- `react-hook-form` + `@hookform/resolvers` available for complex forms

## Environment Variables

**Validation:**
- `@t3-oss/env-nextjs` with Zod schemas in `src/env.js`
- Server vars validated at build time
- Client vars prefixed with `NEXT_PUBLIC_`
- `SKIP_ENV_VALIDATION` flag for Docker builds

---

*Convention analysis: 2026-01-28*
