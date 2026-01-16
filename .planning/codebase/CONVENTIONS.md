# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**
- kebab-case for all files (`post.tsx`, `query-client.ts`)
- Lowercase for directories
- Exception: `README.md`, `CLAUDE.md` (uppercase documentation)

**Functions:**
- camelCase for all functions (`createTRPCContext`, `getQueryClient`)
- Async functions have no special prefix
- Event handlers use `onEventName` pattern

**Variables:**
- camelCase for variables and constants
- No UPPER_SNAKE_CASE used (even for constants)
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces and types (`AppRouter`, `RouterInputs`)
- No `I` prefix for interfaces
- Type inference preferred over explicit types where possible

**Components:**
- PascalCase for React components (`LatestPost`, `RootLayout`)
- Named exports preferred (`export function LatestPost()`)

## Code Style

**Formatting:**
- Prettier configured (`prettier.config.js`)
- Double quotes for strings (JSX standard)
- Semicolons required
- 2-space indentation
- Tailwind class sorting via `prettier-plugin-tailwindcss`

**Linting:**
- ESLint 9.x flat config (`eslint.config.js`)
- `eslint-config-next` for Next.js rules
- `typescript-eslint` for TypeScript rules
- Run: `npm run lint` or `npm run lint:fix`

## Import Organization

**Order:**
1. React and framework imports (`react`, `next`)
2. External packages (`@tanstack/react-query`, `@trpc/client`)
3. Internal modules via path alias (`~/server/auth`, `~/trpc/react`)
4. Relative imports (rare - prefer path alias)
5. Type-only imports (`import type { ... }`)

**Path Aliases:**
- `~/` maps to `./src/` (configured in `tsconfig.json`)
- Use consistently: `import { db } from "~/server/db"`

**Grouping:**
- No enforced blank lines between groups
- Type imports inline with value imports

## Error Handling

**Patterns:**
- tRPC errors thrown via `TRPCError`
- Validation via Zod schemas (auto-formatted)
- No try/catch in most procedure handlers (let tRPC handle)

**Error Types:**
- `TRPCError({ code: "UNAUTHORIZED" })` for auth failures
- Zod errors for validation failures (auto-flattened)

**Logging:**
- Development only: `console.log` for timing
- Prisma logs queries in development mode

## Logging

**Framework:**
- Console logging (no dedicated library)
- Prisma built-in logging

**Patterns:**
- Log execution timing in middleware
- Log errors in development mode only
- No client-side logging framework

## Comments

**When to Comment:**
- JSDoc style for exported functions with complex signatures
- Inline comments for non-obvious logic
- TSDoc `@example` tags in type definitions

**JSDoc/TSDoc:**
- Used for type inference helpers (`RouterInputs`, `RouterOutputs`)
- Minimal usage - TypeScript provides most documentation

**TODO Comments:**
- Not used in current codebase
- Prefer issues/tickets for tracking

## Function Design

**Size:**
- Functions kept small (most under 30 lines)
- Extract helpers for complex logic

**Parameters:**
- Destructuring preferred for objects
- tRPC uses `{ ctx, input }` pattern
- Options object for multiple parameters

**Return Values:**
- Explicit returns in procedures
- Return early for guard clauses
- Async functions return Promises

## Module Design

**Exports:**
- Named exports preferred throughout
- `export const` for values
- `export function` for functions
- `export default` only for Next.js pages/layouts

**Barrel Files:**
- `index.ts` used for auth module (`src/server/auth/index.ts`)
- Re-exports public API from internal modules

**Import Patterns:**
- Path alias `~/` used consistently
- Relative imports only within same directory
- `server-only` package for server-side protection

## React Patterns

**Components:**
- `"use client"` directive for client components
- Server Components by default in App Router
- Suspense boundaries for async data

**Hooks:**
- `useSuspenseQuery` for SSR-compatible queries
- `useMutation` with `onSuccess` callbacks
- `useState` for local form state

**Props:**
- Destructured in function parameters
- TypeScript inference from component usage

---

*Convention analysis: 2026-01-16*
*Update when patterns change*
