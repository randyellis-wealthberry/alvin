# ALVIN Design System

> Design tokens and patterns for UX Pilot AI prompts

## Brand Foundation

| Attribute | Value |
|-----------|-------|
| Application | ALVIN - Wellness Check-In Companion |
| Personality | Caring, trustworthy, calm, accessible |
| Target Users | Adults who want wellness monitoring, their trusted contacts |
| Style | Modern & minimal - clean lines, high contrast, focused interactions |
| Platform | Mobile-first responsive |

---

## Color Palette

### Primary Gradient Background
```
Background: Linear gradient from #2e026d (deep purple) to #15162c (dark navy)
CSS: bg-gradient-to-b from-[#2e026d] to-[#15162c]
Usage: Full-page backgrounds, immersive screens
```

### Accent Color
```
Purple accent: hsl(280, 100%, 70%) / #a855f7
Usage: Brand highlights, emphasized text
```

### Semantic Colors

| Token | Hex/Value | Tailwind | Usage |
|-------|-----------|----------|-------|
| Primary Action | #22c55e | green-600 | Check-in button, success states |
| Primary Hover | #16a34a | green-700 | Check-in button hover |
| Secondary Action | #2563eb | blue-600 | Biometric button, links |
| Secondary Hover | #1d4ed8 | blue-700 | Biometric button hover |
| Destructive | #ef4444 | red-500 | Delete, cancel actions |
| Warning | #f59e0b | amber-500 | Caution states |
| Success Text | #4ade80 | green-400 | Success feedback text |
| Error Text | #f87171 | red-400 | Error feedback text |

### Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| Surface | rgba(255,255,255,0.1) / bg-white/10 | Cards, elevated surfaces |
| Surface Hover | rgba(255,255,255,0.2) / bg-white/20 | Hover states on cards |
| Surface Strong | rgba(255,255,255,0.3) / bg-white/30 | Active/pressed states |
| Input Background | rgba(255,255,255,0.1) / bg-white/10 | Form inputs |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| Text Primary | #ffffff | Headings, important text |
| Text Secondary | rgba(255,255,255,0.7) / text-white/70 | Body text, descriptions |
| Text Muted | rgba(255,255,255,0.5) / text-white/50 | Helper text, timestamps |
| Placeholder | rgba(255,255,255,0.5) | Input placeholders |

### Alert Level Colors

| Level | Background | Badge Class | Meaning |
|-------|------------|-------------|---------|
| LEVEL_1 | rgba(234,179,8,0.3) | bg-yellow-500/30 | Initial alert (24h) |
| LEVEL_2 | rgba(249,115,22,0.3) | bg-orange-500/30 | Escalated (48h) |
| LEVEL_3 | rgba(239,68,68,0.3) | bg-red-500/30 | Urgent (72h) |
| LEVEL_4 | rgba(153,27,27,0.3) | bg-red-800/30 | Critical (96h) |
| RESOLVED | rgba(34,197,94,0.3) | bg-green-500/30 | User checked in |
| CANCELLED | rgba(107,114,128,0.3) | bg-gray-500/30 | Manually cancelled |

---

## Typography

### Font Family
```
Primary: Geist Sans
Fallback: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
CSS: font-sans (Tailwind default with Geist)
```

### Type Scale

| Name | Size | Weight | Tailwind | Usage |
|------|------|--------|----------|-------|
| Display | 5rem (80px) | 800 | text-5xl font-extrabold | Hero headlines |
| Heading 1 | 2.5rem (40px) | 700 | text-4xl font-bold | Page titles |
| Heading 2 | 1.5rem (24px) | 600 | text-2xl font-bold | Section headers |
| Heading 3 | 1.25rem (20px) | 600 | text-xl font-semibold | Card titles |
| Body Large | 1.125rem (18px) | 400 | text-lg | Emphasized paragraphs |
| Body | 1rem (16px) | 400 | text-base | Standard text |
| Caption | 0.875rem (14px) | 500 | text-sm font-medium | Labels, links |
| Small | 0.75rem (12px) | 400 | text-xs | Badges, helper text |

---

## Spacing System

Based on 4px grid:

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | gap-1, p-1 | Tight spacing |
| sm | 8px | gap-2, p-2 | Compact elements |
| md | 16px | gap-4, p-4 | Standard spacing |
| lg | 24px | gap-6, p-6 | Section spacing |
| xl | 32px | gap-8, p-8 | Large sections |
| 2xl | 48px | gap-12, py-12 | Page sections |
| 3xl | 64px | py-16 | Hero spacing |

---

## Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| Small | 8px | rounded-lg | Inputs, badges, small cards |
| Medium | 12px | rounded-xl | Cards, panels |
| Large | 16px | rounded-2xl | Large panels |
| Full | 9999px | rounded-full | Buttons, pills, avatars |

---

## Elevation & Shadows

ALVIN uses semi-transparent backgrounds instead of shadows for elevation:

| Level | Style | Usage |
|-------|-------|-------|
| Base | bg-white/10 | Default card state |
| Raised | bg-white/20 | Hover, focus states |
| Elevated | bg-white/30 | Active, pressed states |

No box-shadows are used. Depth is conveyed through opacity changes.

---

## Component Patterns

### Card
```css
Background: bg-white/10
Border radius: rounded-xl (12px)
Padding: p-4 (16px) to p-8 (32px)
Hover: bg-white/20
```

### Button (Primary)
```css
Background: bg-white/10 or solid color
Border radius: rounded-full
Padding: px-10 py-3
Font: font-semibold
Hover: bg-white/20 or darker shade
Disabled: opacity-50, cursor-not-allowed
Transition: transition (150ms)
```

### Circular Action Button
```css
Size: h-32 w-32 (128px)
Shape: rounded-full
Layout: flex items-center justify-center
```

### Form Input
```css
Background: bg-white/10
Border radius: rounded-lg
Padding: px-4 py-2
Text color: text-white
Placeholder: placeholder:text-white/50
```

### Select Dropdown
```css
Same as input
Option background: bg-[#15162c]
```

### Checkbox
```css
Size: h-5 w-5
Border radius: rounded
Background: bg-white/10
Disabled: opacity-50
```

### Status Badge (Pill)
```css
Border radius: rounded-full
Padding: px-3 py-1
Font: text-sm font-medium
```

### Feedback Message
```css
Success: bg-green-500/20, text-green-300
Error: bg-red-500/20, text-red-300
Border radius: rounded-lg
Padding: px-4 py-2
```

---

## Icons

| Property | Value |
|----------|-------|
| Style | Line icons (stroke-width: 2) |
| Default Size | 24px |
| Large Size | 32px (primary actions) |
| Color | currentColor (inherits text color) |
| Source | Inline SVG (Lucide-style) |

---

## Transitions & Animations

| Effect | Duration | Easing | Usage |
|--------|----------|--------|-------|
| Hover transitions | 150ms | ease | Button, card hover |
| Fade in | 200ms | ease-in | Success messages |
| Pulse | 1000ms | ease-in-out | Loading states, active badges |

### Loading State Pattern
```
Text: Replace content with "..." or "Saving..."
Animation: animate-pulse
```

### Success Animation Pattern
```
Icon: Checkmark (&#10003;)
Color: Green
Duration: 2 seconds then auto-dismiss
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile (default) | < 640px | Single column, stacked |
| sm | >= 640px | Side-by-side buttons |
| md | >= 768px | Wider cards |
| lg | >= 1024px | Max container width |

### Container Max Widths

| Screen | Max Width |
|--------|-----------|
| Content cards | max-w-xs (320px) |
| Forms | max-w-md (448px) |
| Lists | max-w-2xl (672px) |
| Page container | 1024px |

---

## UX Pilot Prompt Template

When generating screens, include these design tokens:

```
DESIGN SYSTEM:
- Background: Linear gradient #2e026d to #15162c
- Cards: Semi-transparent white (10%), 12px radius
- Buttons: Pill shape, semi-transparent or solid color
- Text: White primary, 70% white secondary
- Inputs: Semi-transparent white (10%), 8px radius
- Success: Green-500/20 background, green-300 text
- Error: Red-500/20 background, red-300 text
- Font: System sans-serif (Geist)
- Style: Modern minimal, no shadows, opacity-based elevation
```
