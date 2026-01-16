# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
Demo/
├── .planning/              # GSD planning documents (this project)
│   └── codebase/          # Codebase analysis documents
├── prisma/                 # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
├── public/                 # Static assets (favicons)
├── src/                    # Application source code
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth handlers
│   │   │   └── trpc/      # tRPC endpoint
│   │   └── _components/   # Page-specific components
│   ├── server/            # Server-side code
│   │   ├── api/           # tRPC routers and setup
│   │   │   └── routers/   # Individual routers
│   │   └── auth/          # NextAuth configuration
│   ├── styles/            # Global CSS
│   └── trpc/              # tRPC client setup
├── CLAUDE.md              # Claude Code instructions
├── README.md              # Project readme
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## Directory Purposes

**src/app/**
- Purpose: Next.js 15 App Router pages and API routes
- Contains: Pages, layouts, API handlers, client components
- Key files: `page.tsx`, `layout.tsx`
- Subdirectories: `api/` (routes), `_components/` (private components)

**src/app/api/trpc/[trpc]/**
- Purpose: tRPC HTTP endpoint
- Contains: Route handler for all tRPC requests
- Key files: `route.ts`

**src/app/api/auth/[...nextauth]/**
- Purpose: NextAuth.js authentication endpoints
- Contains: Catch-all route for auth handlers
- Key files: `route.ts`

**src/app/_components/**
- Purpose: React components used only by pages
- Contains: Client components with hooks
- Key files: `post.tsx`

**src/server/api/**
- Purpose: tRPC server configuration and routers
- Contains: Context creation, procedures, router definitions
- Key files: `trpc.ts`, `root.ts`
- Subdirectories: `routers/`

**src/server/api/routers/**
- Purpose: tRPC router definitions by domain
- Contains: One file per router (e.g., post.ts)
- Key files: `post.ts`

**src/server/auth/**
- Purpose: NextAuth.js configuration
- Contains: Auth config, session handling, provider setup
- Key files: `config.ts`, `index.ts`

**src/trpc/**
- Purpose: tRPC client setup for React
- Contains: Provider, server-side caller, query client
- Key files: `react.tsx`, `server.ts`, `query-client.ts`

**src/styles/**
- Purpose: Global CSS styles
- Contains: Tailwind imports, CSS custom properties
- Key files: `globals.css`

**prisma/**
- Purpose: Database schema and migrations
- Contains: Schema definition, migration history
- Key files: `schema.prisma`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout, providers
- `src/app/page.tsx` - Home page (server component)
- `src/app/api/trpc/[trpc]/route.ts` - tRPC API endpoint
- `src/app/api/auth/[...nextauth]/route.ts` - Auth endpoints

**Configuration:**
- `tsconfig.json` - TypeScript config (path alias: `~/*`)
- `next.config.js` - Next.js config
- `postcss.config.js` - PostCSS/Tailwind
- `eslint.config.js` - ESLint rules
- `prettier.config.js` - Prettier formatting
- `src/env.js` - Environment validation

**Core Logic:**
- `src/server/api/trpc.ts` - tRPC context, procedures, middleware
- `src/server/api/root.ts` - Root router combining all routers
- `src/server/api/routers/post.ts` - Post CRUD operations
- `src/server/db.ts` - Prisma client singleton

**Authentication:**
- `src/server/auth/config.ts` - NextAuth config with Discord
- `src/server/auth/index.ts` - Auth exports with caching

**Testing:**
- Not configured (no test directories)

**Documentation:**
- `README.md` - Project overview
- `CLAUDE.md` - Development instructions

## Naming Conventions

**Files:**
- kebab-case for all TypeScript files (`post.tsx`, `query-client.ts`)
- PascalCase only for generated/special files
- `.tsx` for files with JSX
- `.ts` for pure TypeScript

**Directories:**
- lowercase for all directories
- Leading underscore for Next.js private folders (`_components`)
- Square brackets for dynamic routes (`[trpc]`, `[...nextauth]`)

**Special Patterns:**
- `route.ts` for Next.js API routes
- `page.tsx` for page components
- `layout.tsx` for layouts
- `index.ts` for barrel exports

## Where to Add New Code

**New Feature:**
- Primary code: `src/server/api/routers/` (new router)
- Components: `src/app/_components/` (if page-specific)
- Register router: `src/server/api/root.ts`

**New Page:**
- Implementation: `src/app/{route}/page.tsx`
- Layout: `src/app/{route}/layout.tsx` (if needed)
- Components: `src/app/_components/` or co-located

**New tRPC Router:**
- Definition: `src/server/api/routers/{name}.ts`
- Registration: Add to `src/server/api/root.ts`

**New API Route:**
- Handler: `src/app/api/{path}/route.ts`

**Utilities:**
- Shared helpers: Create `src/lib/` directory
- Type definitions: Co-locate or create `src/types/`

## Special Directories

**prisma/**
- Purpose: Prisma ORM schema and migrations
- Source: Manual schema edits, `prisma migrate`
- Committed: Yes (schema.prisma in git)

**node_modules/**
- Purpose: npm dependencies
- Source: `npm install`
- Committed: No (in .gitignore)

**.next/**
- Purpose: Next.js build output
- Source: `npm run build`
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-01-16*
*Update when directory structure changes*
