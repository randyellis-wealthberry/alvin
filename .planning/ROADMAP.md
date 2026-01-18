# Roadmap: ALVIN

## Overview

ALVIN (Active Language and Vitality Intelligence Network) transforms a production-ready T3 Stack foundation into an AI-powered "dead man's switch" that monitors user vitality through conversational check-ins and alerts family contacts through a carefully escalating notification system.

## Domain Expertise

None

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-10) — SHIPPED 2026-01-17
- 🚧 **v2.0 Mobile & Messaging** — Phases 11-14 (in progress)

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

### 🚧 v2.0 Mobile & Messaging (In Progress)

**Milestone Goal:** Transform ALVIN into a native-like mobile experience with reliable multi-channel notifications

#### Phase 11: PWA Foundation

**Goal**: Progressive web app with manifest, service worker, and home screen install
**Depends on**: v1.0 complete
**Research**: Likely (Next.js 15 PWA patterns)
**Research topics**: next-pwa or serwist setup, web app manifest, service worker registration in App Router
**Plans**: TBD

Plans:
- [ ] 11-01: TBD (run /gsd:plan-phase 11 to break down)

#### Phase 12: Push Notifications

**Goal**: Native push alerts for full activity feed (reminders, escalations, family alerts)
**Depends on**: Phase 11 (service worker required)
**Research**: Likely (web-push library, Push API)
**Research topics**: VAPID key generation, PushSubscription storage, web-push Node.js library
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

#### Phase 13: Offline Caching

**Goal**: View-only offline mode with cached activity history
**Depends on**: Phase 11 (service worker)
**Research**: Unlikely (extends Phase 11 patterns)
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

#### Phase 14: SMS Integration

**Goal**: Twilio SMS for user check-in reminders and family escalation alerts (L3-4)
**Depends on**: Phase 11 (can run in parallel after PWA foundation)
**Research**: Likely (Twilio API integration)
**Research topics**: Twilio Node.js SDK, phone number validation, SMS templates
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

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

**v2.0 Mobile & Messaging — IN PROGRESS**

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. PWA Foundation | v2.0 | 0/? | Not started | - |
| 12. Push Notifications | v2.0 | 0/? | Not started | - |
| 13. Offline Caching | v2.0 | 0/? | Not started | - |
| 14. SMS Integration | v2.0 | 0/? | Not started | - |
