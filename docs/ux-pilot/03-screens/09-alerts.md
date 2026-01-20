# Alert History Page (/alerts)

> View and manage wellness check-in alerts

## UX Pilot Prompt

```text
Design an alert history and management page for wellness monitoring:

LAYOUT:
- Full viewport, gradient background (#2e026d to #15162c)
- Centered content (max-width: 640px)
- 64px top padding

HEADER:
- "Alerts" title (2.5rem bold white, centered)
- "Your check-in alert history" subtitle (1.125rem, 70% white, centered)
- 32px gap below

=== SUMMARY STATS ===

Centered horizontal layout, 24px gaps between:
- "Active: X" - yellow-400 text
- "Resolved: X" - green-400 text
- "Cancelled: X" - gray-400 text
- 0.875rem font size
- 24px gap below

=== EMPTY STATE ===

Centered card (10% white, 32px padding):
- Bell icon (48px, 50% white)
- "No alerts yet" heading (1.25rem white)
- "Alerts are created if you miss a scheduled check-in. Keep checking in to stay connected!"
  (0.875rem, 70% white)

=== ALERT LIST ===

Vertical stack, 16px gap between cards

Each alert card (10% white, 16px radius, 24px padding):

TOP ROW (flex, items-center, gap-3):
- Alert level badge (pill shape):
  - LEVEL_1: yellow-500/30 bg, "Level 1"
  - LEVEL_2: orange-500/30 bg, "Level 2"
  - LEVEL_3: red-500/30 bg, "Level 3"
  - LEVEL_4: red-800/30 bg, "Level 4"
  - RESOLVED: green-500/30 bg, "Resolved"
  - CANCELLED: gray-500/30 bg, "Cancelled"
  - Padding: 6px 12px, 0.875rem text

- Active indicator (only for L1-L4):
  - Small pulsing badge
  - Red-500/50 background
  - "Active" text (0.75rem)
  - animate-pulse animation

TIMESTAMPS (below badge row):
- "Triggered: Jan 15, 2026 at 2:30 PM" (0.875rem, 70% white)

- If resolved:
  - "Resolved: Jan 16, 2026 at 10:15 AM" (0.875rem, green-400/70)

- If cancelled:
  - "Cancelled: Jan 16, 2026 at 9:00 AM" (0.875rem, gray-400/70)
  - If has reason: " - User was traveling"

- If escalated:
  - "Last escalated: Jan 15, 2026 at 8:30 PM" (0.875rem, 50% white)

ACTIONS (right side, only for active alerts):
- "Cancel Alert" button:
  - Gray-500/30 background
  - White text, 0.875rem
  - 8px radius
  - Hover: gray-500/50

=== CANCEL CONFIRMATION ===

When "Cancel Alert" clicked, replace actions with:

Vertical stack:
- Reason input:
  - Placeholder: "Reason (optional)"
  - Semi-transparent, 0.875rem
  - Full width

- Button row:
  - "Confirm" button (red-500/30, hover: red-500/50)
  - "Back" button (10% white, hover: 20% white)
  - 8px gap between

- Loading state: "Cancelling..."
```

---

## Component Details

### Alert Level Badge

| Level | Background | Text |
| ----- | ---------- | ---- |
| LEVEL_1 | bg-yellow-500/30 | "Level 1" |
| LEVEL_2 | bg-orange-500/30 | "Level 2" |
| LEVEL_3 | bg-red-500/30 | "Level 3" |
| LEVEL_4 | bg-red-800/30 | "Level 4" |
| RESOLVED | bg-green-500/30 | "Resolved" |
| CANCELLED | bg-gray-500/30 | "Cancelled" |

### Active Indicator

| Property | Value |
| -------- | ----- |
| Background | bg-red-500/50 |
| Text | white, 0.75rem |
| Padding | 2px 8px |
| Radius | full |
| Animation | animate-pulse |

### Alert Card

| Property | Value |
| -------- | ----- |
| Background | bg-white/10 |
| Padding | 24px |
| Radius | 16px |
| Layout | flex, space-between |

### Cancel Button

| Property | Default | Hover |
| -------- | ------- | ----- |
| Background | gray-500/30 | gray-500/50 |
| Text | white | white |
| Padding | 8px 16px | - |
| Radius | 8px | - |

---

## States

### Empty

- No alerts exist
- Show encouraging empty state
- User has been checking in regularly

### Has Alerts

- List all alerts, most recent first
- Active alerts at top (optional sort)
- Resolved/cancelled shown below

### Active Alert

- Shows pulsing "Active" indicator
- Cancel button visible
- Level badge shows current escalation

### Resolved Alert

- Green "Resolved" badge
- Shows resolution timestamp
- No actions available

### Cancelled Alert

- Gray "Cancelled" badge
- Shows cancellation timestamp
- Shows reason if provided

### Cancel Confirmation

- Replaces cancel button
- Optional reason input
- Confirm/back buttons

### Cancelling

- Button shows "Cancelling..."
- Disabled state during API call
- On success: alert updates to cancelled

---

## Alert Level Descriptions

| Level | Timing | Meaning |
| ----- | ------ | ------- |
| LEVEL_1 | 24h after missed check-in | Initial alert created |
| LEVEL_2 | 48h total | First escalation |
| LEVEL_3 | 72h total | Urgent - contacts notified |
| LEVEL_4 | 96h total | Critical - all contacts notified |
| RESOLVED | Any time | User checked in |
| CANCELLED | Any time | User manually cancelled |

---

## Responsive Behavior

| Breakpoint | Layout |
| ---------- | ------ |
| Mobile (<640px) | Full width, stacked |
| Tablet+ (>=640px) | Centered, 640px max |

---

## Data Requirements

| Field | Source | Usage |
| ----- | ------ | ----- |
| id | alert.id | Cancel operation |
| level | alert.level | Badge display |
| triggeredAt | alert.triggeredAt | Timestamp |
| resolvedAt | alert.resolvedAt | Resolution time |
| cancelledAt | alert.cancelledAt | Cancellation time |
| cancelReason | alert.cancelReason | Display reason |
| lastEscalatedAt | alert.lastEscalatedAt | Escalation time |
| activeCount | alert.list.activeCount | Summary stat |
| resolvedCount | alert.list.resolvedCount | Summary stat |
| cancelledCount | alert.list.cancelledCount | Summary stat |

---

## Date Formatting

```text
Format: "Jan 15, 2026 at 2:30 PM"
Use: toLocaleString() with appropriate options
Timezone: User's configured timezone
```

---

## Cancel Reasons (Common)

```text
- "I was traveling"
- "Phone was off"
- "Forgot to check in"
- "Technical issue"
- (Custom reason)
```

---

## Accessibility

- Alert cards use appropriate article semantics
- Active indicator has aria-label
- Cancel button clearly labeled
- Confirmation is keyboard accessible
- Timestamps use semantic time elements
- Status changes announced via aria-live
