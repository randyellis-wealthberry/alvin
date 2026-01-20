# Form Components

> Input and form patterns for ALVIN

## Text Input

```text
UX Pilot: Design a text input for dark backgrounds:

- Background: Semi-transparent white (10% opacity)
- Border: None (or very subtle 1px white/10)
- Text: White
- Placeholder: 50% white opacity
- Padding: 12px horizontal, 12px vertical
- Border radius: 8px (rounded-lg)
- Focus: Ring outline in purple (ring-2 ring-purple-500)
- Disabled: Background 5% white, text 50% white
- Error: Ring in red (ring-2 ring-red-500)
```

### Specifications

| Property | Default | Focus | Disabled | Error |
| -------- | ------- | ----- | -------- | ----- |
| Background | white/10 | white/10 | white/5 | white/10 |
| Border | none | ring-2 purple-500 | none | ring-2 red-500 |
| Text | white | white | white/50 | white |
| Cursor | text | text | not-allowed | text |

---

## Input with Label

```text
UX Pilot: Design a labeled input field:

LAYOUT:
- Vertical stack
- 8px gap between label and input

LABEL:
- 0.875rem (14px)
- Medium weight (font-medium)
- White text
- Required indicator: " *" in red or purple

INPUT:
- Full width
- Semi-transparent styling as above

HELPER TEXT (optional):
- 0.75rem (12px)
- 50% white opacity
- 4px margin-top
- Use for format hints, character counts

ERROR TEXT:
- 0.75rem
- Red-400 color
- Replaces or appears below helper text
```

### Example Structure

```text
Email *
[john@example.com          ]
Enter your email address
```

---

## Select Dropdown

```text
UX Pilot: Design a select dropdown for dark backgrounds:

TRIGGER:
- Same styling as text input
- Custom down arrow icon (white)
- Right padding to accommodate arrow

DROPDOWN:
- Background: Dark navy (#15162c)
- Border: 1px white/10 (optional)
- Shadow: None or very subtle
- Border radius: 8px
- Max height: 240px (scrollable)

OPTIONS:
- Padding: 12px 16px
- Hover: Slightly lighter background
- Selected: Purple tinted background
- Text: White
```

### Specifications

| Element | Value |
| ------- | ----- |
| Trigger BG | white/10 |
| Dropdown BG | #15162c |
| Option Hover | white/5 |
| Option Selected | purple-500/20 |
| Text | white |

---

## Checkbox

```text
UX Pilot: Design a checkbox for dark backgrounds:

CHECKBOX:
- Size: 20px × 20px (h-5 w-5)
- Background: Semi-transparent white (10%)
- Border radius: 4px (rounded)
- Checked: Blue or green fill with white checkmark
- Focus: Ring outline
- Disabled: 50% opacity

LABEL:
- Inline with checkbox
- 8px gap
- 0.875rem or 1rem
- White text (disabled: 50% white)
```

### States

| State | Visual |
| ----- | ------ |
| Unchecked | Transparent/10% white |
| Checked | Blue-500 fill, white checkmark |
| Disabled | 50% opacity |
| Focused | Ring outline |

---

## Toggle Switch

```text
UX Pilot: Design a toggle switch:

TRACK:
- Size: 44px wide, 24px tall
- Border radius: Full (12px)
- Off: Gray-500 background
- On: Green-500 background

THUMB:
- Size: 20px diameter
- Background: White
- Shadow: Subtle
- Position: Left when off, right when on
- Transition: 150ms ease

LABEL:
- Inline, after toggle
- 12px gap
```

---

## Number Input

```text
UX Pilot: Design a number input:

- Same base styling as text input
- Optional +/- stepper buttons on sides
- Or browser default number controls
- Constrained width (max 120px typically)
```

---

## Time Picker

```text
UX Pilot: Design a time picker input:

- Same styling as text input
- Format: HH:MM (24-hour) or HH:MM AM/PM
- Native time input type or custom
- Placeholder: "09:00 AM"
```

---

## Form Layout

```text
UX Pilot: Design standard form layout:

FORM CONTAINER:
- Semi-transparent card (10% white)
- 24px or 32px padding
- 16px border radius

FIELD SPACING:
- 20px or 24px gap between fields
- Related fields can be grouped with 16px gap

SECTION HEADERS:
- 1rem semibold
- 24px margin-top (after first section)
- 12px margin-bottom

SUBMIT AREA:
- 24px margin-top
- Full-width button or button group
```

---

## Validation Patterns

### Inline Validation

```text
- Validate on blur (when leaving field)
- Show error immediately
- Red ring around input
- Error text below in red-400
```

### Form-level Validation

```text
- Validate on submit
- Scroll to first error
- Focus first errored field
- Error summary at top (optional)
```

### Error Messages

| Type | Example |
| ---- | ------- |
| Required | "This field is required" |
| Format | "Please enter a valid email" |
| Range | "Must be between 1 and 100" |
| Match | "Passwords don't match" |

---

## Form States

| State | Behavior |
| ----- | -------- |
| Default | All inputs enabled |
| Submitting | Inputs disabled, button loading |
| Success | Success message, may close form |
| Error | Error message, inputs re-enabled |

---

## Accessibility

- All inputs have labels (visible or aria-label)
- Error messages linked via aria-describedby
- Required fields marked with aria-required
- Focus order follows visual order
- Error messages announced to screen readers
