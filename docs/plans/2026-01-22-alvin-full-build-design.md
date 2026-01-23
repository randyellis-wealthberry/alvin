# ALVIN Full Build Design

**Date**: 2026-01-22
**Status**: Approved
**Scope**: Full feature implementation from UXPilot designs

---

## Overview

ALVIN is a wellness check-in application that helps users stay connected with people who care about them. Users check in regularly, and if they miss check-ins, trusted contacts are notified through an escalating alert system.

### Core Value Proposition
- **For users**: Peace of mind knowing someone will be notified if something happens
- **For contacts**: Simple, non-intrusive alerts only when needed

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 App Router, React, Tailwind CSS |
| Backend | tRPC routers with Prisma ORM |
| Auth | NextAuth.js with Credentials provider |
| Database | SQLite (existing schema) |
| Styling | ALVIN theme (purple gradient + glassmorphism) |

---

## Route Structure

```
src/app/
├── (auth)/                    # Public auth pages
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   └── onboarding/page.tsx    # 3-step post-signup flow
├── (app)/                     # Authenticated app (bottom nav)
│   ├── layout.tsx             # Bottom nav wrapper
│   ├── page.tsx               # Dashboard/Home
│   ├── check-in/page.tsx
│   ├── chat/
│   │   ├── page.tsx           # Chat list
│   │   └── [id]/page.tsx      # Conversation
│   ├── contacts/page.tsx
│   ├── alerts/page.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   ├── settings/page.tsx
│   │   └── passkeys/page.tsx
│   └── notifications/page.tsx
├── api/
│   ├── trpc/[trpc]/route.ts   # Existing
│   └── cron/escalation/route.ts # Alert escalation cron
└── layout.tsx                 # Global ALVIN theme
```

---

## Design System

### ALVIN Theme Colors

```typescript
colors: {
  alvin: {
    bg: {
      start: '#2e026d',    // Gradient start (purple)
      end: '#15162c',      // Gradient end (dark)
    },
    glass: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  }
}
```

### Global Styles

- **Body**: `bg-gradient-to-b from-[#2e026d] to-[#15162c] min-h-screen`
- **Font**: Inter (400, 500, 600, 700 weights)
- **Scrollbars**: Hidden for cleaner mobile feel

### Reusable Components

| Component | Classes |
|-----------|---------|
| `GlassCard` | `bg-white/10 backdrop-blur-sm rounded-2xl p-6` |
| `PillButton` | `rounded-full py-3 px-6 font-medium transition-all` |
| `GlassInput` | `bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-3` |
| `BottomNav` | Fixed bottom, 4 tabs: Home, Check-In, Chat, Profile |
| `PageHeader` | Centered title + subtitle |
| `StatCard` | Metric number + label in glass container |

### Layout Patterns

- **Max width**: `max-w-[480px]` centered
- **Page padding**: `px-4 pt-16 pb-24`
- **Section spacing**: `mb-12`
- **Card padding**: `p-6` or `p-4`

---

## Feature Specifications

### 1. Authentication & Onboarding

#### Sign In (`/signin`)
- Glass card centered on gradient background
- ALVIN logo (heart-pulse icon)
- Email + password inputs with visibility toggle
- "Forgot password?" link
- Primary "Sign In" pill button
- Google OAuth button
- Link to sign up

#### Sign Up (`/signup`)
- Same layout as sign in
- Fields: Full Name, Email, Password, Confirm Password
- Password match indicator
- Redirects to onboarding on success

#### Onboarding (`/onboarding`)

| Step | Content |
|------|---------|
| 1. Welcome | Success icon, ALVIN explanation, "Get Started" |
| 2. Schedule | Frequency selector (12h/24h/48h), timezone |
| 3. Contact | Add first emergency contact (optional) |
| Complete | Success animation, redirect to dashboard |

**Progress**: Three dots indicator at top

---

### 2. Dashboard (Home)

**URL**: `/(app)`

**Sections**:
1. **Header**: "Check In" title
2. **Action Buttons**: "I'm OK" (green circle), Biometric (blue circle)
3. **Quick Stats**: Check-ins today, time since last, streak
4. **Wellness Snapshot**: Mood, Physical, Mental, Energy with progress bars
5. **AI Insights**: Pattern detection, trends, achievements
6. **Weekly Overview**: 7-day bar chart + totals
7. **Mood Tracker**: 5 emoji selector + weekly strip
8. **Quick Actions**: 2x2 grid (Chat, Reminders, Contacts, Reports)
9. **Recent Check-ins**: List with timestamps and method badges
10. **Wellness Tips**: Hydration, movement, sleep cards
11. **Emergency Contact**: Crisis hotline card
12. **Motivational Quote**: Inspirational message

**Interactions**:
- "I'm OK" → `checkIn.perform` mutation → success animation
- Biometric → WebAuthn flow → check-in on success

---

### 3. Contacts Management

**URL**: `/(app)/contacts`

**Empty State**:
- Icon, message, "Add Your First Contact" button

**Contact List**:
- Contact cards with: name, relationship badge, priority badge, email, phone, edit/delete buttons

**Add/Edit Modal**:
- Name (required)
- Email (required)
- Phone (optional)
- Relationship dropdown
- Priority number (1 = highest)
- Email notification checkbox
- SMS checkbox (disabled, coming soon)

**Delete Confirmation**:
- Warning message
- Cancel / Delete buttons

**Info Sections**:
- Priority explanation (L1-L4)
- Notification channels
- Escalation timeline
- Privacy & security
- FAQ

---

### 4. Alerts & Escalation

**URL**: `/(app)/alerts`

#### Escalation Levels

| Level | Trigger | Action |
|-------|---------|--------|
| L1 | Missed check-in | Push notification to user |
| L2 | No response | Multiple reminders |
| L3 | Continued silence | Priority 1 contact emailed |
| L4 | No resolution | All contacts notified |

#### Alert States
- **Active**: Red banner with level, elapsed time, "I'm OK" / "Cancel" buttons
- **Resolved**: User checked in
- **Cancelled**: User manually cancelled with reason

#### Cron Job (`/api/cron/escalation`)
- Runs every 5-15 minutes
- Checks overdue users
- Creates/escalates alerts
- Sends contact notification emails

---

### 5. Chat & AI

**URLs**:
- `/(app)/chat` - Conversation list
- `/(app)/chat/[id]` - Individual conversation

#### Chat List
- "New Chat" button
- Conversation cards with preview, timestamp, check-in badge

#### Conversation View
- Message bubbles (user right/purple, AI left/glass)
- Input field with send button
- Typing indicator

#### AI Behavior
- Wellness-focused responses
- Detects "I'm okay" intent → triggers check-in
- Links conversation to CheckIn record
- Method: `"CONVERSATION"`

---

### 6. Profile & Settings

**URLs**:
- `/(app)/profile` - Main profile
- `/(app)/profile/settings` - Detailed settings
- `/(app)/profile/passkeys` - Passkey management

#### Profile Page
- Avatar/initials, name, email
- Stats: total check-ins, streak, member since
- Links: Edit Profile, Settings, Passkeys, Help
- Sign Out, Delete Account

#### Settings
- Check-in frequency (12h/24h/48h)
- Preferred time picker
- Timezone
- Push notifications toggle
- Email reminders toggle
- Phone number

#### Passkeys
- Explanation card
- List of registered passkeys
- "Add Passkey" → WebAuthn registration
- Delete passkey option

---

## tRPC Routers

### `auth`
- `register` - Create user + profile
- `login` - Authenticate (handled by NextAuth)

### `profile`
- `get` - Get current user profile
- `update` - Update settings
- `delete` - Delete account

### `checkIn`
- `perform` - Record check-in (manual/biometric/conversation)
- `getHistory` - List past check-ins
- `getStats` - Streaks, totals, averages

### `contacts`
- `list` - Get all contacts
- `create` - Add contact
- `update` - Edit contact
- `delete` - Soft delete contact

### `alerts`
- `getActive` - Current alert if any
- `getHistory` - Past alerts
- `cancel` - Cancel with reason
- `resolve` - Mark resolved (internal)
- `escalate` - Move to next level (internal)

### `chat`
- `listConversations` - Get all conversations
- `getConversation` - Get messages
- `createConversation` - Start new chat
- `sendMessage` - Send message, get AI response

### `passkeys`
- `list` - Get registered passkeys
- `getRegistrationOptions` - Start WebAuthn registration
- `verifyRegistration` - Complete registration
- `getAuthenticationOptions` - Start WebAuthn auth
- `verifyAuthentication` - Complete auth, trigger check-in
- `delete` - Remove passkey

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Global ALVIN theme (Tailwind config, globals.css)
- [ ] Reusable components (GlassCard, PillButton, GlassInput, BottomNav)
- [ ] Layout wrappers for (auth) and (app) route groups

### Phase 2: Authentication & Onboarding
- [ ] Replace signin/signup pages with ALVIN design
- [ ] Build 3-step onboarding flow
- [ ] Wire up auth tRPC router with profile creation

### Phase 3: Core App Pages
- [ ] Dashboard with check-in buttons and stats
- [ ] Check-in tRPC router (perform, history, stats)
- [ ] Bottom navigation across all app pages

### Phase 4: Contacts
- [ ] Contacts list page with CRUD
- [ ] Add/Edit modal, Delete confirmation
- [ ] Contacts tRPC router

### Phase 5: Alerts & Escalation
- [ ] Alerts page (active + history)
- [ ] Alert tRPC router
- [ ] Cron job for escalation logic
- [ ] Email notifications to contacts

### Phase 6: Chat
- [ ] Chat list and conversation pages
- [ ] Chat tRPC router
- [ ] AI response integration (simple MVP)
- [ ] Check-in via conversation

### Phase 7: Profile & Passkeys
- [ ] Profile page with settings
- [ ] Passkey management with WebAuthn
- [ ] Account deletion flow

### Phase 8: Polish
- [ ] Loading states and skeletons
- [ ] Error handling and toasts
- [ ] Animations and transitions
- [ ] PWA enhancements

---

## Database Schema

Already defined in `prisma/schema.prisma`:
- `User` - NextAuth user
- `UserProfile` - ALVIN-specific settings
- `CheckIn` - Check-in records
- `Contact` - Emergency contacts
- `Alert` - Escalation alerts
- `Conversation` - Chat sessions
- `Message` - Chat messages
- `Passkey` - WebAuthn credentials
- `PushSubscription` - Web push subscriptions

---

## Design Source Files

Located in `wealthberry-designs/`:
- `uxpilot-export-1769136495670/` - Main app screens (33 files)
- `uxpilot-export-1769136538042/` - Alert/notification screens (14 files)

Key reference files:
- `1-Sign In.html` - Auth flow
- `8-Wellness Dashboard.html` - Main dashboard
- `28-Contacts Management.html` - Contacts page
- `6-Alert History.html` - Alerts page
- `12-Chat Conversation.html` - Chat UI
- `20-Profile Settings.html` - Profile page
