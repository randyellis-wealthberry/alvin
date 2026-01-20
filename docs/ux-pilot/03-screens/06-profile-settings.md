# Profile Settings Page (/profile)

> User preferences for check-in schedule and notifications

## UX Pilot Prompt

```text
Design a user settings/preferences page for a wellness check-in app:

LAYOUT:
- Full viewport, gradient background (#2e026d to #15162c)
- Centered content (max-width: 480px)
- 64px top padding

HEADER:
- "Settings" title (2.5rem bold white, centered)
- "Configure your check-in preferences" (1.125rem, 70% white, centered)
- 32px gap below

SETTINGS FORM (in semi-transparent card):
- Card: 10% white background, 16px radius, 32px padding
- Vertical stack with 24px gaps between sections

=== SECTION 1: CHECK-IN SCHEDULE ===

Section header: "Check-in Schedule" (1rem semibold, 16px bottom margin)

Field 1 - Frequency:
- Label: "How often should we expect a check-in?" (0.875rem)
- Button group (3 options, horizontal):
  - "12 hours" | "24 hours" | "48 hours"
  - Selected: purple background (purple-500/50), white text
  - Unselected: transparent, 70% white text
  - Each button: 12px padding, 8px radius
- Helper text: "We'll remind you when it's time" (0.75rem, 50% white)

Field 2 - Preferred Time:
- Label: "Preferred time of day (optional)"
- Time picker input
  - Semi-transparent (10% white)
  - Format: HH:MM (24-hour or 12-hour with AM/PM)
  - Placeholder: "09:00 AM"
- Helper: "When would you like to receive reminders?"

Field 3 - Timezone:
- Label: "Your timezone"
- Select dropdown with common timezones
  - Auto-detected value shown by default
  - Semi-transparent styling
  - Options on dark background (#15162c)
- Auto-detected note: "Detected from your device" (0.75rem, 50% white)

=== SECTION 2: ACCOUNT ===

Section header: "Account" (1rem semibold)

Active Status Toggle:
- Horizontal layout: toggle + label
- Toggle switch (44px wide, 24px tall)
  - On: Green background, white circle right
  - Off: Gray background, white circle left
- Label: "Wellness monitoring active"
- Description: "When off, ALVIN won't track check-ins or send alerts"

Email Display (read-only):
- Label: "Email"
- Value: user's email in muted text
- "Change email" link below (optional, links to email change flow)

=== SECTION 3: NOTIFICATIONS ===

Section header: "Notifications" (1rem semibold)

Email Reminders:
- Checkbox + label
- "Send email reminders when check-in is due"
- Checked by default

Push Notifications (future):
- Checkbox + label (disabled, grayed out)
- "Push notifications (coming soon)"

=== FEEDBACK MESSAGES ===

Success:
- Green background (green-500/20), green-300 text
- "Settings saved successfully"
- 12px padding, 8px radius

Error:
- Red background (red-500/20), red-300 text
- Specific error message

=== SUBMIT BUTTON ===

- Full width within card
- Semi-transparent (20% white), pill shape
- "Save Changes" / "Saving..." states
- Hover: 30% white
- Disabled during save: 50% opacity

=== ADDITIONAL LINKS (below form) ===

- 16px spacing above
- "Manage Passkeys →" - links to /profile/passkeys
- "Delete Account" - red text, links to deletion flow (future)
- Both: 0.875rem, ghost button style
```

---

## Component Details

### Section Header

| Property | Value |
| -------- | ----- |
| Font Size | 1rem (16px) |
| Weight | semibold |
| Color | white |
| Margin | 0 0 16px 0 |

### Button Group

| Property | Selected | Unselected |
| -------- | -------- | ---------- |
| Background | purple-500/50 | transparent |
| Text | white | 70% white |
| Border | none | 1px white/20 |
| Padding | 12px 16px | 12px 16px |
| Radius | 8px | 8px |

### Toggle Switch

| Property | Value |
| -------- | ----- |
| Width | 44px |
| Height | 24px |
| Radius | full (12px) |
| On Color | green-500 |
| Off Color | gray-500 |
| Thumb | 20px white circle |

### Time Picker

| Property | Value |
| -------- | ----- |
| Background | bg-white/10 |
| Text | white |
| Placeholder | text-white/50 |
| Padding | 12px 16px |
| Radius | 8px |

---

## States

### Form Default

- All fields show current values
- Save button enabled if changes made
- Save button disabled if no changes

### Field Focused

- Input shows focus ring (ring-2 ring-purple-500)
- Clear visual indication of active field

### Saving

- Button shows "Saving..." text
- Button and form inputs disabled
- Brief loading state

### Save Success

- Success message appears above button
- Message: "Settings saved successfully"
- Auto-dismiss after 3 seconds

### Save Error

- Error message appears above button
- Specific error text shown
- Form remains enabled for retry

### Monitoring Off

- Toggle in "off" position
- Visual indication that check-ins paused
- Helper text explains implications

---

## Responsive Behavior

| Breakpoint | Layout |
| ---------- | ------ |
| Mobile (<640px) | Full width, button group may stack |
| Tablet+ (>=640px) | Centered card, max 480px |

---

## Data Requirements

| Field | Source | Type |
| ----- | ------ | ---- |
| checkInFrequencyHours | userProfile | number (1-168) |
| preferredCheckInTime | userProfile | string (HH:MM) or null |
| timezone | userProfile | string |
| isActive | userProfile | boolean |
| email | user.email | string (read-only) |

---

## Timezone Options

```text
UTC
America/New_York (Eastern)
America/Chicago (Central)
America/Denver (Mountain)
America/Los_Angeles (Pacific)
Europe/London
Europe/Paris
Asia/Tokyo
Australia/Sydney
```

---

## Validation

| Field | Rule | Error Message |
| ----- | ---- | ------------- |
| Frequency | Required, 1-168 | "Please select a frequency" |
| Time | HH:MM format or empty | "Please enter a valid time" |
| Timezone | Required, valid value | "Please select a timezone" |

---

## Accessibility

- All inputs have associated labels
- Toggle has aria-checked state
- Button group uses role="radiogroup"
- Focus order follows visual order
- Success/error messages announced via aria-live
