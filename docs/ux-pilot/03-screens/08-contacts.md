# Contacts Management Page (/contacts)

> Emergency contact management for alert escalation

## UX Pilot Prompt

```text
Design an emergency contacts management page for a wellness app:

LAYOUT:
- Full viewport, gradient background (#2e026d to #15162c)
- Centered content (max-width: 640px)
- 64px top padding

HEADER:
- "Trusted Contacts" title (2.5rem bold white, centered)
- "People who care about you" subtitle (1.125rem, 70% white, centered)
- 32px gap below

ADD CONTACT BUTTON:
- Right-aligned (or centered on mobile)
- Semi-transparent (20% white)
- White text "Add Contact"
- Plus icon (16px) before text
- Pill shape, 12px vertical, 20px horizontal padding
- Hover: 30% white
- 24px gap below

=== EMPTY STATE (no contacts) ===

Centered card (10% white, 32px padding, 16px radius):
- Users icon (48px, 50% white)
- "No contacts yet" heading (1.25rem, white)
- "Add someone who cares about you. They'll be notified if you miss check-ins."
  (0.875rem, 70% white, centered)
- "Add Your First Contact" button below (green, pill shape)

=== CONTACT LIST ===

Vertical stack, 16px gap between cards

Each contact card (10% white, 16px radius, 24px padding):

LEFT CONTENT:
- Name (1.125rem semibold white)
- Inline badges after name (8px gap):
  - Relationship badge (20% white bg, capitalize text, 0.75rem)
    e.g., "Spouse", "Friend"
  - Priority badge (purple-500/30 bg, "Priority 1", 0.75rem)

- Email (0.875rem, 70% white)
  - Email icon (12px) before text optional

- Phone (0.875rem, 70% white) - if exists
  - Phone icon before text optional

- Notification prefs (0.75rem, 50% white)
  - "Email: Yes" or "Email: No"
  - Separator " | "
  - "SMS: No (coming soon)"

RIGHT ACTIONS:
- Vertical or horizontal button group
- Edit button:
  - "Edit" text
  - Semi-transparent (10% white)
  - 8px radius
  - Hover: 20% white
- Delete button:
  - "Delete" text
  - Red tinted (red-500/20)
  - Hover: red-500/30

=== CONTACT FORM (Modal or Inline) ===

Show when adding or editing:

Card (10% white, 32px padding, 16px radius):

Header:
- "Add Contact" or "Edit Contact" (1.25rem semibold)
- X close button (top right, 70% white)
- 24px gap below

Form Fields (vertical stack, 20px gap):

1. Name (required):
   - Label: "Name *"
   - Input: semi-transparent, placeholder "John Doe"

2. Email (required):
   - Label: "Email *"
   - Input: email type, placeholder "john@example.com"

3. Phone (optional):
   - Label: "Phone"
   - Input: tel type, placeholder "+1 (555) 123-4567"

4. Relationship (optional):
   - Label: "Relationship"
   - Select dropdown:
     - Options: Spouse, Child, Sibling, Parent, Friend, Other
   - Placeholder: "Select relationship"

5. Priority:
   - Label: "Priority"
   - Number input (min: 1)
   - Helper: "Lower number = notified first (1 is highest)"

6. Notification Preferences:
   - Section label: "Notifications"
   - Checkbox: "Notify by email" (checked by default)
   - Checkbox: "Notify by SMS" (disabled, grayed, "coming soon")

Buttons (side by side, 16px gap):
- Cancel: ghost button, "Cancel"
- Submit: primary, "Add Contact" or "Save Changes"
  - Loading: "Saving..."

=== DELETE CONFIRMATION ===

Replace card content with:
- "Delete [Name]?" heading
- "They will no longer be notified about your check-ins."
- Buttons:
  - "Cancel" - ghost
  - "Delete" - red (red-500/30)
- Loading: "Deleting..."
```

---

## Component Details

### Contact Card

| Property | Value |
| -------- | ----- |
| Background | bg-white/10 |
| Padding | 24px |
| Radius | 16px |
| Layout | flex, space-between |

### Relationship Badge

| Property | Value |
| -------- | ----- |
| Background | bg-white/20 |
| Text | white, 0.75rem |
| Padding | 4px 8px |
| Radius | 4px |
| Transform | capitalize |

### Priority Badge

| Property | Value |
| -------- | ----- |
| Background | bg-purple-500/30 |
| Text | purple-200, 0.75rem |
| Padding | 4px 8px |
| Radius | 4px |

### Form Input

| Property | Value |
| -------- | ----- |
| Background | bg-white/10 |
| Text | white |
| Placeholder | text-white/50 |
| Padding | 12px 16px |
| Radius | 8px |
| Focus | ring-2 ring-purple-500 |

---

## States

### Empty List

- Show empty state with illustration
- Prominent CTA to add first contact

### Has Contacts

- List all contacts sorted by priority
- Add button visible at top

### Adding Contact

- Form appears (modal or pushes content)
- Form fields empty
- Submit says "Add Contact"

### Editing Contact

- Form appears with pre-filled values
- Submit says "Save Changes"

### Form Validation

- Required fields show red border on blur if empty
- Email validates format
- Phone accepts various formats

### Submitting

- Button shows "Saving..."
- Form disabled during save
- On success: form closes, list updates

### Delete Confirmation

- Replaces card content
- Clear warning message
- Confirm/cancel actions

---

## Responsive Behavior

| Breakpoint | Layout |
| ---------- | ------ |
| Mobile (<640px) | Full width, stacked layout |
| Tablet+ (>=640px) | Centered container, 640px max |

---

## Data Requirements

| Field | Source | Usage |
| ----- | ------ | ----- |
| id | contact.id | Edit/delete operations |
| name | contact.name | Display |
| email | contact.email | Display, notifications |
| phone | contact.phone | Display, future SMS |
| relationship | contact.relationship | Badge display |
| priority | contact.priority | Sort order, badge |
| notifyByEmail | contact.notifyByEmail | Notification pref |
| notifyBySms | contact.notifyBySms | Future feature |

---

## Priority System

```text
Priority 1: Notified first when L3 alert triggers
Priority 2: Notified at L4 or if Priority 1 unresponsive
Priority 3+: Notified sequentially as escalation continues

Lower number = Higher priority
```

---

## Relationship Options

```text
- spouse
- child
- sibling
- parent
- friend
- other
```

---

## Validation Rules

| Field | Rule | Error |
| ----- | ---- | ----- |
| Name | Required, 1-100 chars | "Name is required" |
| Email | Required, valid format | "Please enter a valid email" |
| Phone | Optional, if provided must be valid | "Please enter a valid phone number" |
| Priority | Required, positive integer | "Priority must be 1 or higher" |

---

## Accessibility

- Form uses proper labels and aria-describedby
- Delete confirmation is keyboard accessible
- Focus trapped in modal/form when open
- List uses appropriate list semantics
- Action buttons have clear accessible names
