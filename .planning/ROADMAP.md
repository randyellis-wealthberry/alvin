# Roadmap: ALVIN

## Overview

ALVIN transforms a production-ready T3 Stack foundation into an AI-powered "dead man's switch" that monitors user vitality through scheduled biometric check-ins and alerts family contacts through a carefully escalating notification system. The journey moves from data modeling through core check-in mechanics, then to the escalation engine, and finally to a polished activity dashboard.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Database Schema** - Define data models for users, contacts, check-ins, and alerts
- [ ] **Phase 2: User Profile Management** - Profile CRUD with check-in schedule configuration
- [ ] **Phase 3: Contact Management** - Family contact CRUD operations
- [ ] **Phase 4: Check-In System** - Biometric verification and manual check-in flow
- [ ] **Phase 5: Reminder System** - Scheduled check-in reminders via email
- [ ] **Phase 6: Alert Escalation Engine** - 4-level escalation state machine with timing logic
- [ ] **Phase 7: Contact Notifications** - Email alerts to family contacts at escalation levels 3-4
- [ ] **Phase 8: Activity Dashboard** - Check-in history, alert status, and activity log UI

## Phase Details

### Phase 1: Database Schema
**Goal**: Define Prisma schema for all ALVIN entities (UserProfile, Contact, CheckIn, Alert)
**Depends on**: Nothing (first phase)
**Research**: Unlikely (Prisma patterns established in existing codebase)
**Plans**: TBD

Plans:
- [ ] 01-01: Schema design and migration

### Phase 2: User Profile Management
**Goal**: Profile page where users configure their check-in schedule (frequency, time preferences)
**Depends on**: Phase 1
**Research**: Unlikely (tRPC/Prisma CRUD patterns established)
**Plans**: TBD

Plans:
- [ ] 02-01: Profile tRPC router and UI

### Phase 3: Contact Management
**Goal**: Add, edit, remove family contacts with notification preferences (email, later SMS)
**Depends on**: Phase 1
**Research**: Unlikely (standard CRUD operations)
**Plans**: TBD

Plans:
- [ ] 03-01: Contact management router and UI

### Phase 4: Check-In System
**Goal**: Users can perform check-ins with optional biometric verification (WebAuthn)
**Depends on**: Phase 2
**Research**: Likely (Web Authentication API patterns)
**Research topics**: WebAuthn/passkeys integration in Next.js, browser compatibility, fallback flows
**Plans**: TBD

Plans:
- [ ] 04-01: Basic check-in flow
- [ ] 04-02: Biometric verification with WebAuthn

### Phase 5: Reminder System
**Goal**: Scheduled reminders prompt users to check in based on their configured schedule
**Depends on**: Phase 4
**Research**: Likely (background job scheduling in Next.js/Vercel)
**Research topics**: Cron jobs in Next.js (Vercel Cron, Inngest, or similar), email service selection
**Plans**: TBD

Plans:
- [ ] 05-01: Cron job infrastructure
- [ ] 05-02: Reminder email templates and delivery

### Phase 6: Alert Escalation Engine
**Goal**: State machine that progresses alerts through 4 levels based on missed check-ins
**Depends on**: Phase 5
**Research**: Likely (state machine patterns, timing logic)
**Research topics**: State machine libraries (XState vs custom), escalation timing implementation
**Plans**: TBD

Plans:
- [ ] 06-01: Escalation state machine
- [ ] 06-02: Alert cancellation flow

### Phase 7: Contact Notifications
**Goal**: Email family contacts at escalation levels 3 and 4
**Depends on**: Phase 6, Phase 3
**Research**: Likely (email service integration)
**Research topics**: Email provider (Resend, SendGrid), transactional email templates, delivery tracking
**Plans**: TBD

Plans:
- [ ] 07-01: Email service integration
- [ ] 07-02: Contact notification templates

### Phase 8: Activity Dashboard
**Goal**: UI showing check-in history, current alert status, and activity log
**Depends on**: Phase 7
**Research**: Unlikely (React/Next.js UI patterns from existing codebase)
**Plans**: TBD

Plans:
- [ ] 08-01: Dashboard components and data fetching

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Schema | 0/1 | Not started | - |
| 2. User Profile | 0/1 | Not started | - |
| 3. Contact Management | 0/1 | Not started | - |
| 4. Check-In System | 0/2 | Not started | - |
| 5. Reminder System | 0/2 | Not started | - |
| 6. Alert Escalation | 0/2 | Not started | - |
| 7. Contact Notifications | 0/2 | Not started | - |
| 8. Activity Dashboard | 0/1 | Not started | - |
