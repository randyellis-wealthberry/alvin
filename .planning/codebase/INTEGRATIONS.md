# External Integrations

**Analysis Date:** 2026-01-16

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected

**External APIs:**
- Not detected

## Data Storage

**Databases:**
- SQLite - Local development database
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma ORM 6.6 (`@prisma/client`)
  - Schema: `prisma/schema.prisma`
  - Migrations: `prisma migrate dev` / `prisma migrate deploy`

**File Storage:**
- Not configured

**Caching:**
- React Query client-side caching (30s stale time)
- No server-side caching (no Redis)

## Authentication & Identity

**Auth Provider:**
- NextAuth.js 5.0.0-beta.25 - Email/OAuth authentication
  - Implementation: `src/server/auth/config.ts`
  - Token storage: Prisma adapter (database sessions)
  - Session management: JWT handled by NextAuth

**OAuth Integrations:**
- Discord OAuth - Social sign-in
  - Credentials: `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
  - Scopes: Default Discord OAuth scopes
  - Provider: `next-auth/providers/discord`

## Monitoring & Observability

**Error Tracking:**
- Not configured (no Sentry, etc.)

**Analytics:**
- Not configured

**Logs:**
- Console logging only
- Prisma query logging in development
- No log aggregation service

## CI/CD & Deployment

**Hosting:**
- Optimized for Vercel (auto-detects `VERCEL_URL`)
- Can deploy to any Node.js platform

**CI Pipeline:**
- Not configured (no GitHub Actions, etc.)

## Environment Configuration

**Development:**
- Required env vars:
  - `DATABASE_URL` - SQLite connection string
  - `AUTH_DISCORD_ID` - Discord OAuth client ID
  - `AUTH_DISCORD_SECRET` - Discord OAuth client secret
- Optional: `AUTH_SECRET` (auto-generated in dev)
- Secrets location: `.env` file (gitignored)

**Staging:**
- Not configured

**Production:**
- Required: `AUTH_SECRET` (must be set explicitly)
- Secrets management: Platform environment variables
- Database: Should switch from SQLite to PostgreSQL/MySQL

## Webhooks & Callbacks

**Incoming:**
- NextAuth OAuth callbacks at `/api/auth/callback/discord`
  - Handled automatically by NextAuth

**Outgoing:**
- None configured

## Required Environment Variables

```bash
# Database
DATABASE_URL="file:./db.sqlite"

# NextAuth
AUTH_SECRET="your-secret-key"  # Required in production

# Discord OAuth
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

## Environment Validation

Validated at startup via `@t3-oss/env-nextjs` in `src/env.js`:

| Variable | Server/Client | Required | Notes |
|----------|---------------|----------|-------|
| `DATABASE_URL` | Server | Yes | Must be valid URL |
| `AUTH_SECRET` | Server | Prod only | Optional in dev |
| `AUTH_DISCORD_ID` | Server | Yes | Discord OAuth |
| `AUTH_DISCORD_SECRET` | Server | Yes | Discord OAuth |
| `NODE_ENV` | Server | No | Defaults to "development" |

## Not Configured (Opportunities)

- Payment processors (Stripe, PayPal)
- Email services (SendGrid, Resend)
- Cloud storage (AWS S3, Supabase Storage)
- Analytics (PostHog, Mixpanel)
- Error tracking (Sentry)
- Monitoring (Datadog, New Relic)
- Additional OAuth providers (GitHub, Google)

---

*Integration audit: 2026-01-16*
*Update when adding/removing external services*
