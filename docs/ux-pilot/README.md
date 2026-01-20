# ALVIN UX Pilot Documentation

> Comprehensive UX specifications for generating ALVIN's frontend with [UX Pilot AI](https://uxpilot.ai/)

## Overview

**ALVIN** is a wellness check-in companion app that helps users maintain regular wellness check-ins and alerts trusted contacts when check-ins are missed.

This documentation provides prompt-ready specifications for each screen that can be directly used with UX Pilot AI to generate high-fidelity UI designs.

---

## Quick Start

### 1. Open UX Pilot
Go to [uxpilot.ai](https://uxpilot.ai/) and start a new project.

### 2. Set Project Context
Paste this into your first prompt:

```
I'm designing ALVIN, a mobile-first wellness check-in app.

Design system:
- Background: Dark gradient (#2e026d to #15162c)
- Cards: Semi-transparent white (10% opacity), 12px radius
- Buttons: Pill-shaped, semi-transparent or solid green/blue
- Text: White on dark, system sans-serif font
- Style: Modern minimal, no shadows, opacity-based depth
```

### 3. Generate Screens
Navigate to individual screen specs in `03-screens/` and copy the "UX Pilot Prompt" section directly into UX Pilot.

---

## Documentation Structure

```
docs/ux-pilot/
├── README.md                    # This file
├── 01-design-system.md          # Colors, typography, components
├── 02-user-flows.md             # User journey diagrams
├── 03-screens/
│   ├── 01-landing.md            # Home page
│   ├── 02-authentication.md     # Discord OAuth flow
│   ├── 03-check-in.md           # Main check-in interface
│   ├── 04-chat-list.md          # Conversation list
│   ├── 05-chat-conversation.md  # AI chat interface
│   ├── 06-profile-settings.md   # User preferences
│   ├── 07-profile-passkeys.md   # Biometric setup
│   ├── 08-contacts.md           # Emergency contacts
│   ├── 09-alerts.md             # Alert history
│   └── 10-contact-notification.md  # Phase 8: Contact alerts
└── 04-components/
    ├── 01-buttons.md            # Button variants
    ├── 02-forms.md              # Form patterns
    └── 03-feedback.md           # Alerts, toasts, banners
```

---

## Screens Overview

| Screen | Route | Purpose |
|--------|-------|---------|
| Landing | `/` | Home with navigation cards |
| Authentication | `/api/auth/signin` | Discord OAuth login |
| Check-In | `/check-in` | Manual + biometric check-in |
| Chat List | `/chat` | List of conversations |
| Chat | `/chat/[id]` | AI wellness chat |
| Profile | `/profile` | Check-in preferences |
| Passkeys | `/profile/passkeys` | Biometric setup |
| Contacts | `/contacts` | Emergency contact management |
| Alerts | `/alerts` | Alert history and status |
| Contact Notification | Phase 8 | Alerts for trusted contacts |

---

## Design Principles

### 1. Mobile-First
All designs start with mobile viewport (375px) and scale up responsively.

### 2. Calm & Clear
Dark gradient backgrounds reduce eye strain. Semi-transparent surfaces create depth without harsh contrasts.

### 3. Accessible Actions
Large touch targets (128px for primary actions). Clear visual feedback for all states.

### 4. Progressive Disclosure
Show only essential information. Details expand on interaction.

---

## Using with Figma

After generating designs in UX Pilot:

1. **Export to Figma** using UX Pilot's Figma plugin
2. **Apply Design Tokens** from `01-design-system.md`
3. **Create Component Library** from `04-components/`
4. **Build Prototypes** following `02-user-flows.md`

---

## Key Flows

### Primary: Daily Check-In
```
Landing → Check-In Page → "I'm OK" Button → Success Feedback
```

### Biometric Check-In
```
Check-In Page → Biometric Button → WebAuthn Prompt → Success
```

### Alert Escalation
```
Missed Check-In → L1 (24h) → L2 (48h) → L3 (72h) → L4 (96h)
```

### Emergency Contact Setup
```
Contacts Page → Add Contact → Fill Form → Set Priority → Save
```

---

## Tips for UX Pilot

### Effective Prompts
- Start with layout structure (viewport, max-width)
- Specify exact colors and opacities
- Describe all interactive states
- Include empty and error states

### Component Consistency
- Reference the design system document
- Use consistent spacing (4px grid)
- Maintain button and input patterns

### Iterating
- Generate base layout first
- Refine individual components
- Add states and interactions last

---

## Phase 8: Contact Notifications

The `10-contact-notification.md` screen is for a planned feature where trusted contacts receive notifications about missed check-ins.

This screen will be accessed by external contacts (not app users) via a unique link.

---

## Contributing

When adding new screens:

1. Follow the existing file naming convention
2. Include a "UX Pilot Prompt" section
3. Document all states (default, hover, loading, success, error, empty)
4. Reference components from `04-components/`
5. Add screen to this README's overview table
