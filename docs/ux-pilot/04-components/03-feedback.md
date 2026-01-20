# Feedback Components

> Alerts, messages, and status indicators for ALVIN

## Success Message

```text
UX Pilot: Design an inline success message:

- Background: Green tinted (green-500/20)
- Text: Green-300 color
- Padding: 12px 16px
- Border radius: 8px (rounded-lg)
- Icon: Checkmark (optional, 16px)
- Content: Success message text
- Behavior: Auto-dismiss after 3 seconds or manual close
```

### Specifications

| Property | Value |
| -------- | ----- |
| Background | bg-green-500/20 |
| Text | text-green-300 |
| Icon | checkmark, green-400 |
| Padding | 12px 16px |
| Radius | 8px |

---

## Error Message

```text
UX Pilot: Design an inline error message:

- Background: Red tinted (red-500/20)
- Text: Red-300 color
- Padding: 12px 16px
- Border radius: 8px
- Icon: X or warning (optional)
- Content: Error description
- Behavior: Persists until user action
```

### Specifications

| Property | Value |
| -------- | ----- |
| Background | bg-red-500/20 |
| Text | text-red-300 |
| Icon | X or warning, red-400 |
| Padding | 12px 16px |
| Radius | 8px |

---

## Info Banner

```text
UX Pilot: Design an info/notice banner:

- Background: Blue tinted (blue-500/20) or white/10
- Text: Blue-300 or white
- Padding: 12px 16px
- Border radius: 8px
- Icon: Info circle (optional)
- Use for: Tips, instructions, neutral info
```

---

## Warning Banner

```text
UX Pilot: Design a warning banner:

- Background: Amber tinted (amber-500/20)
- Text: Amber-300 color
- Border: Optional amber-500/30 left border (3px)
- Padding: 12px 16px
- Border radius: 8px
- Icon: Warning triangle
- Use for: Important but non-critical notices
```

---

## Status Badge (Pill)

```text
UX Pilot: Design status badges/pills:

BASE:
- Border radius: Full (pill shape)
- Padding: 4px horizontal, 8px vertical (small) or 6px/12px (normal)
- Font size: 0.75rem (small) or 0.875rem (normal)
- Font weight: Medium

VARIANTS:
- Success: green-500/30 bg, green-300 text
- Warning: yellow-500/30 bg, yellow-300 text
- Error: red-500/30 bg, red-300 text
- Info: blue-500/30 bg, blue-300 text
- Neutral: gray-500/30 bg, gray-300 text
- Purple: purple-500/30 bg, purple-300 text
```

### Badge Examples

| Badge | Background | Text |
| ----- | ---------- | ---- |
| "Active" | red-500/50 | white |
| "Resolved" | green-500/30 | green-300 |
| "Level 1" | yellow-500/30 | yellow-300 |
| "Level 3" | red-500/30 | red-300 |
| "Priority 1" | purple-500/30 | purple-200 |

---

## Active/Pulsing Indicator

```text
UX Pilot: Design an active status indicator:

- Background: Red-500/50
- Text: White, 0.75rem
- Content: "Active"
- Animation: animate-pulse
- Use with: Active alerts, live statuses
```

---

## Check-In Banner

```text
UX Pilot: Design a check-in recorded banner:

LIGHT BACKGROUND VERSION (for chat):
- Background: Green-50
- Border bottom: Green-200 (1px)
- Text: Green-700, 0.875rem
- Icon: Checkmark
- Content: "Check-in recorded at [time]"
- Position: Below header

DARK BACKGROUND VERSION:
- Background: Green-500/20
- Text: Green-300
- Same structure
```

---

## Toast Notification

```text
UX Pilot: Design a toast notification:

POSITION:
- Fixed position
- Bottom center on mobile
- Bottom right on desktop
- 16px from edges

CONTAINER:
- Semi-transparent dark (#15162c/90) or white/10
- 12px 16px padding
- 8px border radius
- Shadow for pop effect

CONTENT:
- Icon (optional) + message text
- Optional action button
- Close X button

BEHAVIOR:
- Slide in from bottom
- Auto-dismiss after 3-5 seconds
- Dismissable via X button
```

---

## Empty State

```text
UX Pilot: Design an empty state message:

CONTAINER:
- Centered in parent
- Optional card background (10% white)
- 32px padding

CONTENT:
- Icon: Relevant illustration (48px, 50% white)
- Heading: "No [items] yet" (1.25rem, white)
- Description: Encouraging message (0.875rem, 70% white)
- CTA: Optional action button (e.g., "Add First Contact")

EXAMPLES:
- Contacts: Users icon, "No contacts yet"
- Alerts: Bell icon, "No alerts yet"
- Chat: Message icon, "No conversations yet"
```

---

## Loading States

### Inline Loading

```text
- Text: "Loading..."
- Animation: Subtle pulse (animate-pulse)
- Color: 50% white or gray-400
```

### Skeleton Loading

```text
- Shape: Matches content shape
- Background: Animated gradient (shimmer)
- Color: white/5 to white/10
```

### Button Loading

```text
- Text: "Saving..." or "..."
- Animation: Pulse
- Button: Disabled state
```

---

## Confirmation Dialog

```text
UX Pilot: Design inline confirmation for destructive actions:

REPLACES original element with:
- Warning message (optional)
- Two buttons side by side:
  - "Cancel" - ghost style
  - "Confirm" or "Delete" - red/destructive style
- Loading state: "Deleting..."
```

---

## Progress Indicator

```text
UX Pilot: Design step progress dots:

LAYOUT:
- Horizontal row
- 12px gap between dots

DOTS:
- Size: 8px diameter
- Shape: Circle
- Active: White filled
- Inactive: White outline, 40% opacity
- Completed: White filled (or checkmark)
```

---

## Accessibility

- Status messages use role="status" or aria-live
- Error messages use role="alert"
- Toasts don't steal focus
- Animations respect prefers-reduced-motion
- Color not sole indicator of status (use icons/text too)
- Dismissable toasts have visible close button
