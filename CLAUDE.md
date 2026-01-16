# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run check        # Lint + typecheck
npm run typecheck    # Type check only
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format:check # Check Prettier formatting
npm run format:write # Apply Prettier formatting

# Database
npm run db:push      # Push schema changes to database (development)
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations (production)
npm run db:studio    # Open Prisma Studio GUI
```

## Architecture

This is a T3 Stack application using Next.js 15 App Router.

### Data Flow
```
Client Component → tRPC React Query → tRPC Server → Prisma → SQLite
                                           ↓
                                    NextAuth Session
```

### Key Directories
- `src/server/api/routers/` - tRPC routers (add new API endpoints here)
- `src/server/api/trpc.ts` - tRPC initialization, context, and procedures
- `src/server/auth/` - NextAuth.js configuration
- `src/trpc/` - Client-side tRPC setup (React Query integration)
- `prisma/schema.prisma` - Database schema

### tRPC Procedures
- `publicProcedure` - Accessible to all users
- `protectedProcedure` - Requires authentication, ctx.session.user guaranteed non-null

### Adding a New Router
1. Create file in `src/server/api/routers/`
2. Export router using `createTRPCRouter`
3. Register in `src/server/api/root.ts`

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - SQLite connection string
- `AUTH_SECRET` - NextAuth secret (required in production)
- `AUTH_DISCORD_ID` - Discord OAuth client ID
- `AUTH_DISCORD_SECRET` - Discord OAuth client secret
