# Roadmap: ALVIN

## Overview

ALVIN (Active Language and Vitality Intelligence Network) transforms a production-ready T3 Stack foundation into an AI-powered "dead man's switch" that monitors user vitality through conversational check-ins and alerts family contacts through a carefully escalating notification system.

## Domain Expertise

None

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-10) — SHIPPED 2026-01-17
- 🚧 **v2.0 Mobile & Messaging** — Phases 11-16 (in progress)

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

**Milestone Goal:** Transform ALVIN into a native-like mobile experience with reliable multi-channel notifications, polished UI, and real-time updates

#### Phase 11: PWA Foundation ✓

**Goal**: Progressive web app with manifest, service worker, and home screen install
**Depends on**: v1.0 complete
**Status**: Complete (2026-01-17)

Plans:
- [x] 11-01: Core PWA infrastructure (Serwist + manifest)
- [x] 11-02: PWA assets and install experience

#### Phase 12: Push Notifications

**Goal**: Native push alerts for full activity feed (reminders, escalations, family alerts)
**Depends on**: Phase 11 (service worker required)
**Status**: In progress (2/4 plans complete)

Plans:
- [x] 12-01: Push notification infrastructure (web-push, VAPID, PushSubscription model)
- [x] 12-02: Push subscription API endpoints (tRPC router, service worker handlers)
- [ ] 12-03: Client permission UI
- [ ] 12-04: Integration with reminders and escalations

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
**Research**: Complete (Twilio SDK patterns verified)
**Status**: Planned (2026-01-21)

Plans:
- [x] 14-01: Twilio infrastructure (schema, service, env, unified notifications)
- [x] 14-02: Family SMS + cron integration (L3/L4 alerts, reminder fallback)

#### Phase 15: Shadcn UI Refresh

**Goal**: Replace current styling with Shadcn components for a polished, consistent look
**Depends on**: None (can run in parallel)
**Research**: Minimal (design-os reference available)
**Reference**: design-os/src/components/ui/ contains base Shadcn components

Plans:
- [x] 15-01: Shadcn CSS + core components (Button, Input, Label, Card)
- [ ] 15-02: Form components (Dialog, Select, Textarea, Checkbox)
- [ ] 15-03: Feedback components (Alert, Badge, Skeleton, Tooltip)
- [ ] 15-04: Migrate existing UI to Shadcn components

#### Phase 16: Convex Real-time Dashboard

**Goal**: Live updates for activity log, alerts, and status without page refresh
**Depends on**: Phase 15 recommended (UI should be stable first)
**Research**: Likely (Convex React integration, subscriptions)
**Research topics**: Convex queries vs mutations, real-time subscriptions, migration strategy

Plans:
- [x] 16-01: Convex schema & sync utility (schema, queries, mutations, sync)
- [x] 16-02: Real-time dashboard integration (activity log subscription, write-through sync)
- [ ] 16-03: Status component integration (user status subscription)

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
| 11. PWA Foundation | v2.0 | 2/2 | Complete | 2026-01-17 |
| 12. Push Notifications | v2.0 | 4/4 | Complete | 2026-01-19 |
| 13. Offline Caching | v2.0 | 1/1 | Complete | 2026-01-21 |
| 14. SMS Integration | v2.0 | 2/2 | Complete | 2026-01-21 |
| 15. Shadcn UI Refresh | v2.0 | 4/4 | Complete | 2026-01-22 |
| 16. Convex Real-time | v2.0 | 2/3 | In progress | - |
