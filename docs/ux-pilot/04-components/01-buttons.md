# Button Components

> Reusable button patterns for ALVIN

## Primary Button (Semi-transparent)

```text
UX Pilot: Design a primary button for dark backgrounds:

- Background: Semi-transparent white (20% opacity)
- Text: White, semibold (font-weight: 600)
- Padding: 12px vertical, 24px horizontal
- Border radius: Full (pill shape)
- Hover: Background opacity increases to 30%
- Active: Scale 0.98
- Disabled: 50% opacity, cursor-not-allowed
- Loading: Text changes to "Loading..." with subtle pulse
- Transition: 150ms ease all properties
```

### Specifications

| Property | Default | Hover | Active | Disabled |
| -------- | ------- | ----- | ------ | -------- |
| Background | white/20 | white/30 | white/25 | white/10 |
| Text | white | white | white | white/50 |
| Transform | none | none | scale(0.98) | none |
| Cursor | pointer | pointer | pointer | not-allowed |

---

## Primary Button (Solid Color)

```text
UX Pilot: Design a solid primary action button:

- Background: Green (#22c55e) for primary actions
- Text: White, semibold
- Padding: 14px vertical, 28px horizontal
- Border radius: Full (pill shape)
- Hover: Darker shade (#16a34a)
- Active: Even darker (#15803d)
- Shadow: Optional subtle green glow
- Disabled: 50% opacity
```

### Color Variants

| Variant | Background | Hover | Usage |
| ------- | ---------- | ----- | ----- |
| Primary (Green) | green-600 | green-700 | Check-in, save, confirm |
| Secondary (Blue) | blue-600 | blue-700 | Biometric, OAuth |
| Destructive (Red) | red-500/30 | red-500/50 | Delete, cancel |
| Ghost | transparent | white/10 | Cancel, back |

---

## Circular Action Button

```text
UX Pilot: Design a large circular action button:

- Size: 128px diameter (h-32 w-32)
- Shape: Perfect circle (rounded-full)
- Background: Solid color (green or blue)
- Content: Centered - either text or icon
- Text: 1.25rem bold white (if text)
- Icon: 32px white (if icon)
- Hover: Darker shade of background
- Active: Scale 0.95
- Loading: Pulsing "..." text
- Success: Checkmark icon, brief green glow
- Disabled: 50% opacity
```

### States

| State | Visual |
| ----- | ------ |
| Default | Solid color, text/icon visible |
| Hover | Slightly darker background |
| Active | Scale 0.95, darker background |
| Loading | Pulsing "..." text, disabled |
| Success | Checkmark (✓), brief glow animation |
| Disabled | 50% opacity, no hover effect |

---

## Ghost Button

```text
UX Pilot: Design a ghost/text button:

- Background: Transparent
- Border: None
- Text: 70% white opacity
- Padding: 8px 16px
- Hover: Text becomes 100% white, optional underline
- Use for: Cancel, back, secondary actions
```

### Specifications

| Property | Default | Hover |
| -------- | ------- | ----- |
| Background | transparent | transparent or white/5 |
| Text | white/70 | white |
| Decoration | none | underline (optional) |

---

## Icon Button

```text
UX Pilot: Design a small icon-only button:

- Size: 40px square
- Shape: Circle (rounded-full)
- Background: Transparent or semi-transparent
- Icon: 20px, centered
- Hover: Background appears (white/10)
- Use for: Close, menu toggle, settings
```

---

## Button Group

```text
UX Pilot: Design a horizontal button group for selections:

- Layout: Horizontal flex, no gap
- Each button:
  - 12px vertical, 16px horizontal padding
  - First: rounded-l-lg
  - Middle: no radius
  - Last: rounded-r-lg
- Selected: Purple/blue tinted background, white text
- Unselected: Transparent, 70% white text
- Border: 1px white/20 (optional)
```

### Example: Frequency Selector

```text
[ 12 hours ] [ 24 hours ] [ 48 hours ]
     ○            ●            ○
```

---

## Link Button

```text
UX Pilot: Design a text link styled as a button:

- Text: Purple accent (#a855f7) or white/70
- No background
- Hover: Underline appears
- Use for: Navigation, secondary actions
- Padding: Optional (4px for click area)
```

---

## Loading States

All buttons support loading states:

```text
Default text → "Loading..." or "Saving..." or "..."
Button becomes disabled
Subtle pulse animation on text (animate-pulse)
```

---

## Touch Targets

Minimum touch target sizes:

| Button Type | Minimum Size |
| ----------- | ------------ |
| Primary | 44px height |
| Circular | 128px diameter |
| Icon | 44px × 44px |
| Ghost | 44px height |

---

## Accessibility

- All buttons keyboard accessible
- Focus ring visible (ring-2)
- Disabled state removes from tab order
- Loading announced to screen readers
- Icon buttons have aria-label
