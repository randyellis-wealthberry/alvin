# Technology Stack

**Analysis Date:** 2026-01-16

## Languages

**Primary:**
- TypeScript 5.8.2 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Build scripts, config files (`next.config.js`, `postcss.config.js`)

## Runtime

**Environment:**
- Node.js (via Next.js 15 runtime)
- No browser-only runtime requirements

**Package Manager:**
- npm 9.2.0 (`package.json` packageManager field)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.2.3 - Full-stack React framework with App Router (`package.json`)
- React 19.0.0 - UI library (`package.json`)
- tRPC 11.0.0 - Type-safe API layer (`@trpc/client`, `@trpc/react-query`, `@trpc/server`)

**Testing:**
- Not configured (no test framework in dependencies)

**Build/Dev:**
- Turbopack - Fast dev server (via `npm run dev --turbo`)
- TypeScript 5.8.2 - Type checking and compilation
- PostCSS 8.5.3 - CSS processing (`postcss.config.js`)

## Key Dependencies

**Critical:**
- `@tanstack/react-query` 5.69.0 - Client-side data fetching and caching
- `next-auth` 5.0.0-beta.25 - Authentication with Discord OAuth
- `@prisma/client` 6.6.0 - Database ORM client
- `zod` 3.24.2 - Runtime schema validation
- `superjson` 2.2.1 - Enhanced JSON serialization for tRPC

**Infrastructure:**
- `@auth/prisma-adapter` 2.7.2 - NextAuth Prisma integration
- `@t3-oss/env-nextjs` 0.12.0 - Environment variable validation
- `server-only` 0.0.1 - Server-side code protection

## Configuration

**Environment:**
- `.env` files (gitignored)
- Required server vars: `DATABASE_URL`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- Required in production: `AUTH_SECRET`
- Validation via `src/env.js` with Zod schemas

**Build:**
- `tsconfig.json` - TypeScript config with `~/*` path alias to `./src/*`
- `next.config.js` - Next.js config (imports env validation)
- `postcss.config.js` - PostCSS with Tailwind plugin
- `eslint.config.js` - ESLint 9.x flat config
- `prettier.config.js` - Prettier with Tailwind plugin

## Platform Requirements

**Development:**
- Any platform with Node.js
- No external dependencies (SQLite database)

**Production:**
- Optimized for Vercel deployment (auto-detects `VERCEL_URL`)
- Can deploy to any Node.js hosting platform
- SQLite or switch to PostgreSQL/MySQL for production

---

*Stack analysis: 2026-01-16*
*Update after major dependency changes*
