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

**Shipped in v2.0 Mobile & Messaging:**
- ✓ PWA with home screen install (Serwist service worker) — v2.0
- ✓ Push notifications for full activity feed — v2.0
- ✓ View-only offline mode with cached activity — v2.0
- ✓ SMS notifications via Twilio (user + L3/L4 family) — v2.0
- ✓ Shadcn UI component system — v2.0
- ✓ Convex real-time dashboard updates — v2.0

### Active

<!-- Next milestone scope -->

None — v2.0 complete. Future enhancements for v3:
- [ ] Custom escalation timing configuration
- [ ] Multiple check-in schedule types
- [ ] Redis for WebAuthn challenge storage (production scalability)
- [ ] Additional OAuth providers (Google, Apple)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Document vault/storage — v2+ feature, want to nail ALVIN first
- Video testament recording — v2+ feature, complex media handling
- Marketplace/attorney integration — requires business partnerships
- Mobile native apps — web-first, PWA viable for v2
- Multiple user roles (admin, viewer) — single user focus
- Payment/subscription — functionality validated before monetization

## Context

**Current State (v2.0 shipped 2026-01-22):**
- 8,485 lines of TypeScript across 89 files
- 16 phases, 32 plans executed over 7 days total
- Full feature set: check-ins, chat, alerts, PWA, push, SMS, real-time dashboard

**Tech Stack:**
- Next.js 15 (App Router), tRPC 11, Prisma 6.6, NextAuth 5 beta
- AI SDK (Vercel) with Claude for ALVIN chat
- Resend for email, Twilio for SMS, Vercel Cron for scheduling
- SimpleWebAuthn for biometric authentication
- Serwist for PWA service worker, web-push for notifications
- Convex for real-time dashboard subscriptions
- Shadcn UI component system

**Key Insights (validated):**
- The 4-level escalation system with 24h thresholds successfully prevents false alarms
- Push-first, email-fallback, SMS-last notification chain provides reliable delivery
- Write-through sync pattern (Prisma → Convex) gives real-time UX without complexity

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
| Serwist for service worker | Modern, Next.js 15 compatible, replaces deprecated next-pwa | ✓ Good — clean API, works with App Router |
| Push-first notification chain | Push → email → SMS fallback ensures delivery | ✓ Good — reliable multi-channel delivery |
| View-only offline mode | Simpler than full offline support, covers main use case | ✓ Good — users can view history offline |
| Twilio for SMS | Reliable, well-documented, reasonable pricing | ✓ Good — easy integration |
| Write-through sync for Convex | Prisma as source of truth, Convex for real-time reads | ✓ Good — simple pattern, graceful degradation |
| Shadcn UI components | Polished defaults, customizable, accessibility built-in | ✓ Good — consistent look with minimal effort |

---
*Last updated: 2026-01-22 after v2.0 milestone*
