# ALVIN - Active Language and Vitality Intelligence Network

## What This Is

An AI-powered "dead man's switch" that monitors user vitality through biometric check-ins and conversational AI, alerting designated family contacts through a 4-level escalating notification system when users become unresponsive. Built on a production-ready T3 Stack foundation.

## Core Value

Never false alarm — family contacts are only reached when truly needed, protecting users from embarrassing or unnecessary alerts while still ensuring real emergencies are communicated.

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

**Inherited from T3 Stack foundation:**
- ✓ User authentication with Discord OAuth — existing
- ✓ Protected routes requiring authentication — existing
- ✓ Type-safe API layer with tRPC — existing
- ✓ Database persistence with Prisma ORM — existing
- ✓ Error handling with user feedback — existing
- ✓ Rate limiting on mutations — existing
- ✓ Full test coverage (32 tests) — existing
- ✓ Error boundaries for graceful failures — existing

**Shipped in v1.0 MVP:**
- ✓ User profile with check-in schedule configuration — v1.0
- ✓ Biometric check-in verification (WebAuthn/passkeys) — v1.0
- ✓ Scheduled check-in reminders (email via Resend) — v1.0
- ✓ Family contact management (add, edit, remove trusted contacts) — v1.0
- ✓ ALVIN Chat with conversational check-ins — v1.0
- ✓ 4-level escalating alert system (L1-L4 with 24h thresholds) — v1.0
- ✓ Check-in history and activity dashboard — v1.0
- ✓ Alert cancellation (user can stop escalation) — v1.0
- ✓ Contact email notifications (L3/L4 escalation) — v1.0
- ✓ Thesys GenUI integration for ALVIN chat — v1.0

### Active

<!-- Next milestone scope -->

None — v1.0 MVP complete. Future enhancements for v2:
- [ ] SMS notifications (Twilio integration)
- [ ] PWA with push notifications
- [ ] Custom escalation timing configuration
- [ ] Multiple check-in schedule types

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Document vault/storage — v2+ feature, want to nail ALVIN first
- Video testament recording — v2+ feature, complex media handling
- Marketplace/attorney integration — requires business partnerships
- Mobile native apps — web-first, PWA viable for v2
- Multiple user roles (admin, viewer) — single user focus
- Payment/subscription — functionality validated before monetization

## Context

**Current State (v1.0 shipped 2026-01-17):**
- 6,254 lines of TypeScript across 64 files
- 10 phases, 16 plans executed in 2 days
- Full feature set: check-ins, chat, alerts, notifications, dashboard

**Tech Stack:**
- Next.js 15 (App Router), tRPC 11, Prisma 6.6, NextAuth 5 beta
- AI SDK (Vercel) with Claude for ALVIN chat
- Resend for email, Vercel Cron for scheduling
- SimpleWebAuthn for biometric authentication

**Key Insight (validated):**
The 4-level escalation system with 24h thresholds successfully prevents false alarms. Users have multiple opportunities (L1, L2 reminders) before family is contacted (L3, L4).

## Constraints

- **Stack**: T3 Stack (Next.js 15, tRPC, Prisma, NextAuth) — validated in v1.0
- **Auth Provider**: Discord OAuth — working, can add more providers in v2
- **Database**: SQLite (dev) / PostgreSQL (prod) — standard T3 pattern
- **Notifications**: Email via Resend — SMS deferred to v2

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ALVIN-only for v1 | Focus ensures quality; document vault and video can come later | ✓ Good — shipped complete in 2 days |
| Escalating alerts (not immediate) | Reduces false alarms, which is the core value | ✓ Good — 4-level system validates approach |
| Web-first (no native mobile) | Faster to ship, PWA provides mobile experience | ✓ Good — responsive web works well |
| Biometric + check-in model | Balances security (biometric) with simplicity (scheduled) | ✓ Good — WebAuthn provides strong auth |
| AI SDK (not raw Anthropic SDK) | Simpler streaming, better React integration | ✓ Good — onFinish callback pattern works |
| Phrase-based check-in detection | Simple v1 approach, can upgrade to LLM later | ✓ Good — sufficient for MVP |
| In-memory WebAuthn challenges | MVP approach, upgrade to Redis later | ⚠️ Revisit — not production-ready |
| Soft delete for contacts | Preserve audit trail | ✓ Good — deletedAt pattern clean |
| 24h threshold per level | Balance between urgency and false alarms | ✓ Good — configurable later if needed |

---
*Last updated: 2026-01-17 after v1.0 milestone*
