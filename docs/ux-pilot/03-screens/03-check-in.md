# Check-In Page (/check-in)

> Primary wellness check-in interface with manual and biometric options

## UX Pilot Prompt

```
Design a wellness check-in screen with large action buttons:

LAYOUT:
- Full viewport, gradient background (#2e026d to #15162c)
- Centered content (max-width: 480px)
- 64px top padding

HEADER:
- "Check In" title (2.5rem bold white, centered)
- "Let us know you're okay" subtitle (1.125rem, 70% white, centered)
- 48px gap below

PRIMARY ACTION BUTTONS (centered, side by side on tablet+):

1. MANUAL CHECK-IN BUTTON:
- Large circular button (128px diameter)
- Bright green background (#22c55e)
- White text "I'm OK" (1.25rem bold, centered)
- Hover: darker green (#16a34a)
- Active: scale 0.98
- Shadow: subtle green glow (optional)

2. BIOMETRIC CHECK-IN BUTTON (only if passkeys exist):
- Large circular button (128px diameter)
- Blue background (#2563eb)
- White fingerprint icon (32px) centered
- "Biometric" label below icon (0.875rem)
- Hover: darker blue (#1d4ed8)

Button container:
- Flex row with 16px gap
- Stack vertically on very small screens

BUTTON STATES:

Loading:
- Replace content with pulsing "..."
- Button disabled (50% opacity)

Success:
- Green checkmark icon (✓) replaces content
- Subtle green glow pulse
- "Checked in!" text appears below (green-400)
- Auto-dismiss after 2 seconds

ERROR DISPLAY (below buttons, if error):
- Red text (red-400)
- "Error: [message]"

NO PASSKEYS PROMPT (if no biometric set up):
- Below buttons, 24px spacing
- Link text: "Set up biometric check-in →"
- 70% white, hover: 100% white with underline
- Links to /profile/passkeys

CHECK-IN HISTORY SECTION:
- 64px spacing above
- "Recent Check-ins" heading (1.25rem semibold)
- 16px gap below heading

History list (max 10 items):
- Each item in semi-transparent card (10% white, 12px radius, 16px padding)
- 12px gap between items
- Layout per item:
  - Left: Relative time ("just now", "2 hours ago") in 1rem
  - Left below: Full timestamp (0.875rem, 50% white)
  - Right: Method badge (pill shape):
    - Manual: blue-500/30 background, "Manual"
    - Biometric: purple-500/30 background, "Biometric"
    - Conversation: green-500/30 background, "Chat"

EMPTY HISTORY STATE:
- Centered text: "No check-ins yet"
- Subtitle: "Press the button above to record your first check-in"
- 70% white
```

---

## Component Details

### Circular Action Button
| Property | Manual | Biometric |
|----------|--------|-----------|
| Size | 128x128px | 128x128px |
| Shape | rounded-full | rounded-full |
| Background | green-600 (#22c55e) | blue-600 (#2563eb) |
| Hover | green-700 (#16a34a) | blue-700 (#1d4ed8) |
| Content | "I'm OK" text | Fingerprint icon + label |
| Icon Size | N/A | 32px |

### Check-In History Item
| Property | Value |
|----------|-------|
| Background | bg-white/10 |
| Padding | 16px |
| Border Radius | 12px |
| Layout | flex, space-between |
| Gap | 12px between items |

### Method Badge
| Method | Background | Text |
|--------|------------|------|
| MANUAL | bg-blue-500/30 | "Manual" |
| BIOMETRIC | bg-purple-500/30 | "Biometric" |
| CONVERSATION | bg-green-500/30 | "Chat" |

---

## States

### Button Default
- Green/blue background
- White text/icon
- Cursor pointer

### Button Hover
- Darker shade of color
- Cursor pointer

### Button Loading
- Pulsing "..." text (animate-pulse)
- 50% opacity
- Cursor not-allowed

### Button Success
- Checkmark icon (✓) in white
- Brief green glow animation
- Text "Checked in!" below in green-400
- Returns to default after 2 seconds

### Button Disabled
- 50% opacity
- Cursor not-allowed
- Used during loading or post-success

### Error State
- Error message in red-400 below buttons
- Format: "Error: [specific message]"
- Button returns to default state

---

## Interactions

### Manual Check-In Flow
1. User taps "I'm OK" button
2. Button shows loading ("...")
3. API call to `checkIn.record`
4. On success: show checkmark, "Checked in!" message
5. History list updates with new entry
6. If active alert exists: auto-resolves

### Biometric Check-In Flow
1. User taps biometric button
2. Button shows loading
3. Generate WebAuthn authentication options
4. System prompt appears (TouchID/FaceID/Windows Hello)
5. User authenticates
6. Verify with server
7. On success: same as manual
8. On cancel: show "Authentication cancelled" error

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Buttons stacked vertically, centered |
| Tablet+ (>=640px) | Buttons side by side |

---

## Data Requirements

| Field | Source | Usage |
|-------|--------|-------|
| Has Passkeys | passkey.hasPasskeys | Show/hide biometric button |
| Check-in History | checkIn.list | Display recent check-ins |
| Method | checkIn.method | Badge color and text |
| Timestamp | checkIn.performedAt | Display time |

---

## History Time Formatting

| Time Difference | Display |
|-----------------|---------|
| < 1 minute | "just now" |
| < 60 minutes | "X minutes ago" |
| < 24 hours | "X hours ago" |
| < 7 days | "X days ago" |
| >= 7 days | Full date (e.g., "Jan 15, 2026") |

---

## Error Messages

| Error | User Message |
|-------|--------------|
| Network failure | "Connection error. Please try again." |
| Auth cancelled | "Authentication cancelled. Please try again." |
| Server error | "Something went wrong. Please try again." |
| Passkey not found | "Passkey not recognized. Try a different method." |

---

## Accessibility

- Buttons are keyboard accessible (Enter/Space to activate)
- Focus ring visible on all interactive elements
- Screen reader: "Check in button" / "Biometric check-in button"
- Success/error messages announced to screen readers
- Touch targets: 128px (exceeds 44px minimum)
