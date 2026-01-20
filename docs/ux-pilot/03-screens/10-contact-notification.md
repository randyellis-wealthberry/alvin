# Contact Notification Page (Phase 8)

> Notification landing page for trusted contacts

## Overview

This screen is accessed by external contacts (not app users) when they receive an alert notification. It provides a simple interface for contacts to acknowledge the alert and take action.

---

## UX Pilot Prompt - Notification Landing Page

```text
Design a notification landing page for contacts of a wellness app user:

URL PATTERN: /notify/[alertId]/[contactToken]
This is a PUBLIC page - no login required

LAYOUT:
- Full viewport
- Calm gradient background: navy (#15162c) to dark gray (#1f2937)
- Centered content (max-width: 480px)
- 48px top padding

=== HEADER ===

Alert Icon:
- Warning triangle or alert bell (48px)
- Amber/orange color (#f59e0b)
- Centered

Title: "Wellness Check Alert" (2rem bold white, centered)
Subtitle: "Someone you care about needs your attention" (1rem, 70% white)
32px gap below

=== USER INFO CARD ===

Semi-transparent card (15% white, 16px radius, 24px padding):

User Info:
- User avatar (64px circle, centered) - or placeholder icon if no avatar
- User name (1.5rem semibold white, centered)
- Your relationship: "You are listed as their [relationship]" (0.875rem, 70% white)

24px gap below

=== ALERT DETAILS CARD ===

Semi-transparent card (10% white, 16px radius, 24px padding):

Alert Info:
- "Last check-in: 3 days ago" (1rem, white)
  - Red warning color if > 48 hours
- "Current alert level: Level 3" with matching badge
- 16px gap

Explanation:
- "[User] hasn't checked in for 72 hours."
- "We're reaching out to make sure they're okay."
- 0.875rem, 70% white

=== ACTION SECTION ===

24px gap above

Primary Button:
- "I've contacted [User]"
- Full width
- Green background (#22c55e)
- White text, semibold
- Pill shape
- 16px vertical padding
- Hover: darker green

16px gap

Secondary Button:
- "I cannot reach [User]"
- Full width
- Semi-transparent (10% white)
- White text
- Pill shape
- Hover: 20% white
- Triggers escalation or shows next steps

16px gap

Tertiary Link:
- "Request help from other contacts"
- Text link, 70% white
- Shows if other contacts available
- Optional

=== EMERGENCY INFO ===

48px gap above
Subtle card (5% white, 12px radius, 16px padding):
- "If you believe this is an emergency:"
- Local emergency number (bold)
- "Contact local emergency services immediately"
- 0.875rem, 50% white
```

---

## UX Pilot Prompt - Already Resolved State

```text
Design an "all clear" version of the notification page:

LAYOUT:
Same as above

HEADER:
- Green checkmark icon (48px) instead of warning
- "Good News!" title (2rem bold white)
- "[User] has checked in" subtitle

USER INFO CARD:
Same as above

STATUS CARD:
- Green tinted (green-500/10)
- Green check icon
- "[User] checked in [time ago]"
- "No action is needed. Thank you for being there for them."

SINGLE BUTTON:
- "Got it" or "Close"
- Semi-transparent
- Navigates away or closes tab
```

---

## UX Pilot Prompt - Acknowledgment Success

```text
Design the success state after contact acknowledges:

LAYOUT:
Same gradient background

CONTENT:
- Green checkmark animation (64px)
- "Thank you!" heading (2rem bold)
- "We've noted that you've contacted [User]." (1rem, 70% white)
- "They've been notified that you're checking on them."
- 32px gap

NEXT STEPS (optional):
- "If [User] doesn't check in soon, we may reach out again."
- 0.875rem, 50% white

CLOSE BUTTON:
- "Close" - semi-transparent
```

---

## Component Details

### Alert Icon

| State | Icon | Color |
| ----- | ---- | ----- |
| Active | Warning triangle | amber-500 (#f59e0b) |
| Resolved | Checkmark circle | green-500 (#22c55e) |

### User Avatar

| Property | Value |
| -------- | ----- |
| Size | 64px |
| Shape | circle |
| Border | 2px white/20 (optional) |
| Fallback | User initials or default icon |

### Primary Action Button

| Property | Value |
| -------- | ----- |
| Background | green-600 (#22c55e) |
| Hover | green-700 (#16a34a) |
| Text | white, semibold |
| Padding | 16px 24px |
| Radius | full (pill) |

### Secondary Action Button

| Property | Value |
| -------- | ----- |
| Background | white/10 |
| Hover | white/20 |
| Text | white |
| Padding | 16px 24px |
| Radius | full (pill) |

---

## States

### Active Alert

- Shows warning styling
- Action buttons visible
- Urgency communicated

### Already Resolved

- Shows success styling
- Simple acknowledgment button
- Reassuring message

### Acknowledgment Received

- Thank you message
- Contact's action recorded
- Optional next steps info

### Cannot Reach User

- Form for additional info (optional)
- Option to escalate
- Emergency contact info prominent

### Loading

- Skeleton for user info
- Brief loading state

### Error

- "Link expired or invalid"
- Contact support link
- Try again option if applicable

---

## Responsive Behavior

| Breakpoint | Layout |
| ---------- | ------ |
| Mobile (<640px) | Full width with padding |
| Tablet+ (>=640px) | Centered card, 480px max |

---

## Data Requirements

| Field | Source | Usage |
| ----- | ------ | ----- |
| alertId | URL param | Load alert |
| contactToken | URL param | Authenticate contact |
| userName | user.name | Display |
| userAvatar | user.image | Display |
| relationship | contact.relationship | Display |
| alertLevel | alert.level | Badge |
| lastCheckIn | userProfile.lastCheckInAt | Time display |
| isResolved | alert.resolvedAt | State selection |

---

## Security Considerations

- Token-based access (no login required)
- Token expires after alert resolved
- Rate limiting on acknowledgment
- No sensitive user data exposed
- HTTPS required

---

## Copy Variations

### Time Since Check-In

```text
< 24h: "hasn't checked in today"
24-48h: "hasn't checked in for over a day"
48-72h: "hasn't checked in for 2 days"
> 72h: "hasn't checked in for [X] days"
```

### Relationship Display

```text
"You are listed as their spouse"
"You are listed as their friend"
"You are their emergency contact"
```

### Alert Level Descriptions

```text
Level 1: "This is an early notification"
Level 2: "We haven't heard from [User] for a while"
Level 3: "This is an urgent notification"
Level 4: "This requires immediate attention"
```

---

## Accessibility

- Page readable without JavaScript (fallback)
- High contrast for emergency info
- Large touch targets for all buttons
- Screen reader friendly structure
- Clear heading hierarchy
