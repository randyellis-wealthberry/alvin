# Roadmap: ALVIN

## Overview

ALVIN (Active Language and Vitality Intelligence Network) transforms a production-ready T3 Stack foundation into an AI-powered "dead man's switch" that monitors user vitality through conversational check-ins and alerts family contacts through a carefully escalating notification system. The journey moves from data modeling through core check-in mechanics, adds conversational AI capabilities, then to the escalation engine, and finally to a polished activity dashboard.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Database Schema** - Define data models for users, contacts, check-ins, alerts, and conversations
- [x] **Phase 2: User Profile Management** - Profile CRUD with check-in schedule configuration
- [x] **Phase 3: Contact Management** - Family contact CRUD operations
- [x] **Phase 4: Check-In System** - Biometric verification and manual check-in flow
- [x] **Phase 5: ALVIN Chat** - Conversational AI interface for wellness check-ins and engagement
- [x] **Phase 6: Reminder System** - Scheduled check-in reminders via email
- [x] **Phase 7: Alert Escalation Engine** - 4-level escalation state machine with timing logic
- [ ] **Phase 8: Contact Notifications** - Email alerts to family contacts at escalation levels 3-4
- [ ] **Phase 9: Activity Dashboard** - Check-in history, alert status, and activity log UI
- [x] **Phase 10: Thesys Integration** - Add Thesys UI components to ALVIN chat interface

## Phase Details

### Phase 1: Database Schema
**Goal**: Define Prisma schema for all ALVIN entities (UserProfile, Contact, CheckIn, Alert, Conversation)
**Depends on**: Nothing (first phase)
**Research**: Unlikely (Prisma patterns established in existing codebase)
**Plans**: TBD

Plans:
- [x] 01-01: Schema design and migration

### Phase 2: User Profile Management
**Goal**: Profile page where users configure their check-in schedule (frequency, time preferences)
**Depends on**: Phase 1
**Research**: Unlikely (tRPC/Prisma CRUD patterns established)
**Plans**: TBD

Plans:
- [x] 02-01: Profile tRPC router and UI

### Phase 3: Contact Management
**Goal**: Add, edit, remove family contacts with notification preferences (email, later SMS)
**Depends on**: Phase 1
**Research**: Unlikely (standard CRUD operations)
**Plans**: TBD

Plans:

- [x] 03-01: Contact management router and UI

### Phase 4: Check-In System
**Goal**: Users can perform check-ins with optional biometric verification (WebAuthn)
**Depends on**: Phase 2
**Research**: Likely (Web Authentication API patterns)
**Research topics**: WebAuthn/passkeys integration in Next.js, browser compatibility, fallback flows
**Plans**: TBD

Plans:
- [x] 04-01: Basic check-in flow
- [x] 04-02: Biometric verification with WebAuthn

### Phase 5: ALVIN Chat
**Goal**: Conversational AI interface for wellness check-ins, engagement, and context gathering
**Depends on**: Phase 4
**Research**: Likely (LLM integration, streaming responses, conversation persistence)
**Research topics**: Claude API / Anthropic SDK, AI SDK (Vercel), streaming chat UI patterns, conversation memory
**Plans**: TBD

Plans:
- [x] 05-01: Chat UI and message streaming
- [x] 05-02: Conversation persistence and context
- [x] 05-03: Conversational check-in flow

### Phase 6: Reminder System
**Goal**: Scheduled reminders prompt users to check in based on their configured schedule
**Depends on**: Phase 5
**Research**: Likely (background job scheduling in Next.js/Vercel)
**Research topics**: Cron jobs in Next.js (Vercel Cron, Inngest, or similar), email service selection
**Plans**: TBD

Plans:
- [x] 06-01: Cron job infrastructure
- [x] 06-02: Reminder email templates and delivery

### Phase 7: Alert Escalation Engine
**Goal**: State machine that progresses alerts through 4 levels based on missed check-ins
**Depends on**: Phase 6
**Research**: Likely (state machine patterns, timing logic)
**Research topics**: State machine libraries (XState vs custom), escalation timing implementation
**Plans**: TBD

Plans:
- [x] 07-01: Escalation state machine
- [x] 07-02: Alert cancellation flow

### Phase 8: Contact Notifications
**Goal**: Email family contacts at escalation levels 3 and 4
**Depends on**: Phase 7, Phase 3
**Research**: Likely (email service integration)
**Research topics**: Email provider (Resend, SendGrid), transactional email templates, delivery tracking
**Plans**: TBD

Plans:
- [ ] 08-01: Email service integration
- [ ] 08-02: Contact notification templates

### Phase 9: Activity Dashboard
**Goal**: UI showing check-in history, current alert status, conversation history, and activity log
**Depends on**: Phase 8
**Research**: Unlikely (React/Next.js UI patterns from existing codebase)
**Plans**: TBD

Plans:
- [ ] 09-01: Dashboard components and data fetching

### Phase 10: Thesys Integration

**Goal**: Integrate Thesys UI components into ALVIN chat for enhanced conversational interfaces
**Depends on**: Phase 5
**Research**: Likely (Thesys component library, integration patterns)
**Research topics**: Thesys UI components, integration with AI SDK streaming, React component patterns
**Plans**: 1

Plans:

- [x] 10-01: Thesys GenUI SDK integration (install, ThemeProvider, C1Component)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Schema | 1/1 | Complete | 2026-01-17 |
| 2. User Profile | 1/1 | Complete | 2026-01-17 |
| 3. Contact Management | 1/1 | Complete | 2026-01-17 |
| 4. Check-In System | 2/2 | Complete | 2026-01-16 |
| 5. ALVIN Chat | 3/3 | Complete | 2026-01-16 |
| 6. Reminder System | 2/2 | Complete | 2026-01-16 |
| 7. Alert Escalation | 2/2 | Complete | 2026-01-17 |
| 8. Contact Notifications | 0/2 | Not started | - |
| 9. Activity Dashboard | 0/1 | Not started | - |
| 10. Thesys Integration | 1/1 | Complete | 2026-01-16 |
