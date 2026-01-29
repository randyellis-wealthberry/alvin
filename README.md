# ALVIN

**Active Language and Vitality Intelligence Network**

A wellness check-in companion that helps individuals maintain regular wellness check-ins and automatically notifies emergency contacts when needed. ALVIN combines AI-powered conversations, biometric authentication, and multi-channel escalation alerts.

## Features

- **One-tap check-ins** with biometric/passkey (WebAuthn) authentication
- **AI conversations** powered by Anthropic Claude for natural wellness assessments
- **4-level escalation system** that notifies emergency contacts via email, SMS, and push notifications when check-ins are missed
- **Dashboard** with wellness snapshots, mood tracking, streaks, and AI-generated insights
- **Emergency contacts** with priority-based notification ordering
- **Automated reminders** via Vercel Cron Jobs (hourly)
- **PWA support** for installable mobile experience with offline capability

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript, React 19 |
| API | tRPC 11 |
| Database | PostgreSQL via Prisma 6 |
| Auth | NextAuth.js 5, WebAuthn (passkeys) |
| AI | Anthropic Claude (Vercel AI SDK) |
| Chat UI | CrayonAI C1Chat + TheSys GenUI SDK |
| Cache | Upstash Redis |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Notifications | Resend (email), Twilio (SMS), Web Push (VAPID) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Accounts: [Anthropic](https://console.anthropic.com), [Upstash](https://console.upstash.com)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

See [.env.example](.env.example) for all required environment variables.

### Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run check        # Lint + typecheck
npm run db:studio    # Prisma Studio GUI
```

## Architecture

```
Client (React) → tRPC (React Query) → tRPC Server → Prisma → PostgreSQL
                                            ↓
                                     NextAuth Session
                                            ↓
                                  Claude AI / Redis / Cron Jobs
```

### Key Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard with check-in button and wellness stats |
| `/chat` | Full-page AI conversation with ALVIN |
| `/check-in` | Check-in history and management |
| `/contacts` | Emergency contact management |
| `/alerts` | Escalation alert history |
| `/settings` | Notification and check-in preferences |
| `/profile/passkeys` | Biometric credential management |

### Escalation Flow

1. User misses scheduled check-in
2. **Level 1** — Push notification + email reminder to user
3. **Level 2** — SMS reminder to user
4. **Level 3** — Email notification to emergency contacts
5. **Level 4** — SMS notification to emergency contacts

Any check-in at any point resolves all active alerts.

## Deployment

Deployed on [Vercel](https://vercel.com) with automatic deployments on push to `main`. Cron jobs run hourly for reminders and escalation processing.

## License

Private — All rights reserved.
