# Landing Page (/)

> Home screen with navigation to all features

## UX Pilot Prompt

```
Design a mobile-first wellness app landing page with dark gradient background.

LAYOUT:
- Full viewport height (min-h-screen)
- Centered content container (max-width: 1024px)
- Gradient background: linear from #2e026d (deep purple) to #15162c (dark navy)
- 64px top/bottom padding, 16px horizontal padding

=== UNAUTHENTICATED STATE ===

HERO SECTION (centered):
- App name "ALVIN" in 5rem bold white text, tight letter-spacing
- Subtitle "Your Wellness Companion" in 1.5rem purple accent (#a855f7)
- 48px gap below title

FEATURE CARDS (2-column grid, 16px gap):
Card 1: "Daily Check-Ins"
  - Semi-transparent white (10% opacity)
  - 16px padding, 12px radius
  - Checkmark icon (24px, green)
  - Description: "Stay connected with simple wellness confirmations"

Card 2: "Trusted Contacts"
  - Same card styling
  - Users icon (24px, blue)
  - Description: "Your loved ones are notified if you need help"

SIGN-IN CTA (below cards, 32px spacing):
- Large button: "Continue with Discord"
- Discord purple background (#5865F2)
- White Discord logo icon + white text
- Full width on mobile, max 320px on desktop
- Pill shape (rounded-full)
- 16px vertical, 24px horizontal padding
- Subtle hover: brightness increase

ONBOARDING BENEFITS (below button, 24px spacing):
- Three small text items, centered:
  - "Free to use"
  - "No credit card required"
  - "Set up in 2 minutes"
- 0.875rem, 50% white opacity

=== AUTHENTICATED STATE ===

HEADER:
- "Welcome back, [User Name]" in 1.5rem semibold
- 32px gap below

NAVIGATION CARDS (2x2 grid, 16px gap):
1. CHECK-IN card:
   - Green left border or accent
   - Checkmark icon (24px)
   - "Check In" title
   - "Record your wellness status"

2. CHAT card:
   - Blue accent
   - Message bubble icon
   - "Chat with ALVIN"
   - "Talk about how you're doing"

3. CONTACTS card:
   - Purple accent
   - Users icon
   - "Contacts"
   - "Manage trusted people"

4. ALERTS card:
   - Orange accent
   - Bell icon
   - "Alerts"
   - "View check-in history"
   - Optional: Badge with active alert count

Each card:
- Semi-transparent white (10%)
- 16px padding, 12px radius
- Hover: 20% opacity
- Tap: navigates to respective screen

SIGN OUT (below cards):
- Text link: "Sign out"
- 70% white, hover: 100% white

INTERACTIONS:
- Card tap: navigate with subtle scale animation
- Button hover: brightness increase
- Smooth transitions (200ms ease)
```

---

## Component Details

### Hero Title
| Property | Value |
|----------|-------|
| Text | "ALVIN" |
| Size | 5rem (80px) |
| Weight | 800 (extrabold) |
| Color | white |
| Tracking | tight |

### Feature Card (Unauthenticated)
| Property | Value |
|----------|-------|
| Background | bg-white/10 |
| Padding | 16px |
| Border Radius | 12px |
| Icon Size | 24px |
| Title | 1.125rem semibold |
| Description | 0.875rem, 70% white |

### Navigation Card (Authenticated)
| Property | Value |
|----------|-------|
| Background | bg-white/10 |
| Hover | bg-white/20 |
| Padding | 16px |
| Border Radius | 12px |
| Accent Border | 3px left border, color by type |
| Icon Size | 24px |
| Title | 1rem semibold |
| Description | 0.875rem, 70% white |

---

## States

### Unauthenticated
- Shows hero, feature cards, sign-in CTA
- No user-specific content

### Authenticated
- Shows welcome message with user name
- Navigation cards to all features
- Sign out link

### Loading
- Brief skeleton for user name
- Cards render immediately (static content)

### Error (Auth Failed)
- Toast notification: "Sign in failed. Please try again."
- Returns to unauthenticated state

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, full-width cards |
| Tablet (>=640px) | 2-column card grid |
| Desktop (>=1024px) | Centered container, max 1024px |

---

## Data Requirements

| Field | Source | Usage |
|-------|--------|-------|
| User Name | session.user.name | Welcome message |
| User Avatar | session.user.image | Optional avatar (not currently used) |
| Active Alerts | alert.list.activeCount | Badge on Alerts card |

---

## Accessibility

- All cards are keyboard navigable
- Focus states: visible ring outline
- Screen reader: Cards announce as links with description
- Touch targets: minimum 44px height
