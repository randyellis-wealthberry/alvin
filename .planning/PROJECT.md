# ALVIN - AI Life Verification & Intelligent Notification

## What This Is

An AI-powered "dead man's switch" that monitors user vitality through biometric check-ins and alerts designated family contacts through an escalating notification system when users become unresponsive. Built on an existing production-ready T3 Stack foundation.

## Core Value

Never false alarm — family contacts are only reached when truly needed, protecting users from embarrassing or unnecessary alerts while still ensuring real emergencies are communicated.

## Requirements

### Validated

<!-- Shipped and confirmed valuable (inherited from T3 Stack foundation). -->

- ✓ User authentication with Discord OAuth — existing
- ✓ Protected routes requiring authentication — existing
- ✓ Type-safe API layer with tRPC — existing
- ✓ Database persistence with Prisma ORM — existing
- ✓ Error handling with user feedback — existing
- ✓ Rate limiting on mutations — existing
- ✓ Full test coverage (32 tests) — existing
- ✓ Error boundaries for graceful failures — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] User profile with check-in schedule configuration
- [ ] Biometric check-in verification (device-based)
- [ ] Scheduled check-in reminders (push/email)
- [ ] Family contact management (add, edit, remove trusted contacts)
- [ ] Escalating alert system:
  - Level 1: Gentle reminder to user (24h after missed check-in)
  - Level 2: Second reminder to user (48h)
  - Level 3: Primary contact notified (72h)
  - Level 4: All contacts notified (96h)
- [ ] Check-in history and activity log
- [ ] Alert cancellation (user can stop escalation at any point)
- [ ] Contact notification preferences (email, SMS)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Document vault/storage — v2 feature, want to nail ALVIN first
- Video testament recording — v2 feature, complex media handling
- Marketplace/attorney integration — requires business partnerships
- Mobile native apps — web-first, PWA possible later
- Multiple user roles (admin, viewer) — single user focus for v1
- Payment/subscription — focus on functionality first

## Context

**Existing Foundation:**
The codebase is a production-ready T3 Stack (Next.js 15, tRPC 11, Prisma 6.6, NextAuth 5 beta) with:
- Full test coverage via Vitest
- Rate limiting middleware
- Error handling patterns
- Discord OAuth authentication

**Inspiration:**
WealthBerry (wealthberry-sandbox.webflow.io) — estate planning platform with AI Guardian feature called "ALVIN" that monitors user activity and alerts family.

**Key Insight:**
The escalating alert system is critical to avoiding false alarms. Users often forget check-ins without being in danger. The multi-day escalation gives users multiple chances to respond before family is contacted.

## Constraints

- **Stack**: Must use existing T3 Stack (Next.js 15, tRPC, Prisma, NextAuth) — builds on validated foundation
- **Auth Provider**: Discord OAuth for v1 — already configured and working
- **Database**: SQLite for development, PostgreSQL for production — standard T3 pattern
- **Notifications**: Email first, SMS later — email is simpler to implement

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ALVIN-only for v1 | Focus ensures quality; document vault and video can come later | — Pending |
| Escalating alerts (not immediate) | Reduces false alarms, which is the core value | — Pending |
| Web-first (no native mobile) | Faster to ship, PWA provides mobile experience | — Pending |
| Biometric + check-in model | Balances security (biometric) with simplicity (scheduled) | — Pending |

---
*Last updated: 2026-01-16 after initialization*
