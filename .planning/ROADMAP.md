# Roadmap: ALVIN

## Overview

ALVIN (Active Language and Vitality Intelligence Network) transforms a production-ready T3 Stack foundation into an AI-powered "dead man's switch" that monitors user vitality through conversational check-ins and alerts family contacts through a carefully escalating notification system.

## Domain Expertise

None

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-10) — SHIPPED 2026-01-17
- ✅ [v2.0 Mobile & Messaging](milestones/v2.0-ROADMAP.md) (Phases 11-16) — SHIPPED 2026-01-22
- 🚧 **v3.0 Production Hardening** (Phases 17-24) — In Progress

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-10) — SHIPPED 2026-01-17</summary>

- [x] **Phase 1: Database Schema** - Define data models for users, contacts, check-ins, alerts, and conversations
- [x] **Phase 2: User Profile Management** - Profile CRUD with check-in schedule configuration
- [x] **Phase 3: Contact Management** - Family contact CRUD operations
- [x] **Phase 4: Check-In System** - Biometric verification and manual check-in flow
- [x] **Phase 5: ALVIN Chat** - Conversational AI interface for wellness check-ins and engagement
- [x] **Phase 6: Reminder System** - Scheduled check-in reminders via email
- [x] **Phase 7: Alert Escalation Engine** - 4-level escalation state machine with timing logic
- [x] **Phase 8: Contact Notifications** - Email alerts to family contacts at escalation levels 3-4
- [x] **Phase 9: Activity Dashboard** - Check-in history, alert status, and activity log UI
- [x] **Phase 10: Thesys Integration** - Add Thesys UI components to ALVIN chat interface

</details>

<details>
<summary>✅ v2.0 Mobile & Messaging (Phases 11-16) — SHIPPED 2026-01-22</summary>

- [x] **Phase 11: PWA Foundation** - Serwist service worker, manifest, home screen install
- [x] **Phase 12: Push Notifications** - Web Push with VAPID, subscription management, activity feed alerts
- [x] **Phase 13: Offline Caching** - View-only offline mode with cached activity history
- [x] **Phase 14: SMS Integration** - Twilio SMS for user reminders and L3/L4 family escalation
- [x] **Phase 15: Shadcn UI Refresh** - Polished component system (Button, Card, Dialog, Alert, etc.)
- [x] **Phase 16: Convex Real-time Dashboard** - Live activity log and status updates via subscriptions

</details>

## Progress

**v1.0 MVP — COMPLETE**

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database Schema | v1.0 | 1/1 | Complete | 2026-01-17 |
| 2. User Profile | v1.0 | 1/1 | Complete | 2026-01-17 |
| 3. Contact Management | v1.0 | 1/1 | Complete | 2026-01-17 |
| 4. Check-In System | v1.0 | 2/2 | Complete | 2026-01-16 |
| 5. ALVIN Chat | v1.0 | 3/3 | Complete | 2026-01-16 |
| 6. Reminder System | v1.0 | 2/2 | Complete | 2026-01-16 |
| 7. Alert Escalation | v1.0 | 2/2 | Complete | 2026-01-17 |
| 8. Contact Notifications | v1.0 | 2/2 | Complete | 2026-01-17 |
| 9. Activity Dashboard | v1.0 | 1/1 | Complete | 2026-01-17 |
| 10. Thesys Integration | v1.0 | 1/1 | Complete | 2026-01-16 |

**Total: 10 phases, 16 plans — 100% complete**

**v2.0 Mobile & Messaging — COMPLETE**

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. PWA Foundation | v2.0 | 2/2 | Complete | 2026-01-17 |
| 12. Push Notifications | v2.0 | 4/4 | Complete | 2026-01-19 |
| 13. Offline Caching | v2.0 | 1/1 | Complete | 2026-01-21 |
| 14. SMS Integration | v2.0 | 2/2 | Complete | 2026-01-21 |
| 15. Shadcn UI Refresh | v2.0 | 4/4 | Complete | 2026-01-22 |
| 16. Convex Real-time | v2.0 | 3/3 | Complete | 2026-01-22 |

**Total: 6 phases, 16 plans — 100% complete**

### 🚧 v3.0 Production Hardening (In Progress)

**Milestone Goal:** Harden ALVIN for production deployment with scalable infrastructure, security improvements, and operational observability.

#### Phase 17: Redis Session Store ✅

**Goal**: Move WebAuthn challenges and sessions from in-memory to Redis for horizontal scaling
**Depends on**: Previous milestone complete
**Research**: Complete (Upstash Redis patterns via Context7)
**Plans**: 1/1

Plans:
- [x] 17-01: Set up Upstash Redis client and migrate WebAuthn challenge store

#### Phase 18: OAuth Providers ✅

**Goal**: Add Google OAuth alongside existing Discord provider
**Depends on**: Phase 17
**Plans**: 1/1

Plans:
- [x] 18-01: Google OAuth provider with account linking

#### Phase 19: Rate Limiting ✅

**Goal**: Production-grade rate limiting with Redis backend to prevent abuse
**Depends on**: Phase 17 (requires Redis)
**Plans**: 1/1

Plans:
- [x] 19-01: Redis-backed sliding window rate limiting (API/auth/chat tiers)

#### Phase 20: Error Monitoring — SKIPPED

**Goal**: Sentry integration for error tracking, performance monitoring, and alerting
**Status**: Skipped per user preference

#### Phase 21: Security Audit ✅

**Goal**: CSP headers, input sanitization review, dependency audit, security best practices
**Plans**: 1/1

Plans:
- [x] 21-01: Security headers and dependency audit

#### Phase 22: Health Checks ✅

**Goal**: API health endpoints for DB connectivity, external services, and deployment verification
**Depends on**: Phase 20
**Research**: Unlikely (internal patterns)
**Plans**: 1/1

Plans:
- [x] 22-01: Health check endpoint with DB and Redis checks

#### Phase 22.1: Signup & Onboarding UI Overhaul

**Goal**: Redesign sign-in, sign-up, and build a multi-step onboarding flow with preferences, emergency contact setup, and completion summary
**Depends on**: Phase 18 (OAuth), Phase 22
**Research**: Unlikely (UI implementation from mockups)
**Plans**: TBD

Plans:
- [ ] 22.1-01: Redesign sign-in and sign-up pages (glass-morphism, password strength, Google OAuth)
- [ ] 22.1-02: Onboarding Step 1 — Welcome screen with feature overview
- [ ] 22.1-03: Onboarding Step 2 — Preferences (check-in frequency, reminders, timezone)
- [ ] 22.1-04: Onboarding Step 3 — Emergency contact setup
- [ ] 22.1-05: Onboarding completion screen with summary and CTA

#### Phase 23: Logging & Observability

**Goal**: Structured logging with Pino, request tracing, and log aggregation setup
**Depends on**: Phase 20
**Research**: Likely (Pino, tracing patterns)
**Research topics**: Pino Next.js integration, correlation IDs, structured log format
**Plans**: TBD

Plans:
- [ ] 23-01: TBD

#### Phase 24: Load Testing

**Goal**: k6 load test scripts, performance baselines, and bottleneck identification
**Depends on**: Phase 22, 23
**Research**: Likely (k6 setup)
**Research topics**: k6 installation, test scenarios, metrics interpretation
**Plans**: TBD

Plans:
- [ ] 24-01: TBD

#### Phase 25: C1Chat Rich Response Integration

**Goal**: Switch from plain markdown to rich C1 responses — think items, wellness check-in cards, structured content via writeContent/writeThinkItem
**Depends on**: Phase 17
**Research**: Unlikely (SDK already installed, APIs explored)
**Plans**: TBD

Plans:
- [ ] 25-01: TBD

---

**v3.0 Production Hardening — IN PROGRESS**

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 17. Redis Session Store | v3.0 | 1/1 | Complete | 2026-01-28 |
| 18. OAuth Providers | v3.0 | 1/1 | Complete | 2026-01-29 |
| 19. Rate Limiting | v3.0 | 1/1 | Complete | 2026-01-29 |
| 20. Error Monitoring | v3.0 | — | Skipped | — |
| 21. Security Audit | v3.0 | 1/1 | Complete | 2026-01-29 |
| 22. Health Checks | v3.0 | 1/1 | Complete | 2026-01-29 |
| 22.1 Signup & Onboarding UI | v3.0 | 0/5 | Not started | - |
| 23. Logging & Observability | v3.0 | 0/? | Not started | - |
| 24. Load Testing | v3.0 | 0/? | Not started | - |
| 25. C1Chat Rich Responses | v3.0 | 0/? | Not started | - |

**Total: 10 phases (1 skipped), 5/5 complete, 5 remaining**
