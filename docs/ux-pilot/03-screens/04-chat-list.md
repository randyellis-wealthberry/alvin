# Chat List Page (/chat)

> Conversation list and new chat creation

## UX Pilot Prompt

```
Design a chat conversation list for a wellness AI companion app:

LAYOUT:
- Full viewport height
- LIGHT background (white or very light gray) - contrast from dark app screens
- No gradient - clean, minimal interface

HEADER (sticky top):
- White background with subtle bottom border (gray-200)
- Left side:
  - "ALVIN" title (1.25rem semibold, dark text)
  - "Your wellness companion" subtitle (0.875rem, gray-500)
- Right side:
  - "New Chat" button:
    - Blue background (#3b82f6)
    - White text
    - 8px border radius
    - 12px horizontal, 8px vertical padding
    - Hover: darker blue

CONVERSATION LIST:
- Scrollable area (flex-1, overflow-y auto)
- 16px padding all around
- 8px gap between items

Each conversation card:
- White background
- Subtle border (gray-200)
- 16px padding
- 8px border radius
- Hover: light gray background (gray-50)
- Content layout:
  - First line: Preview text (truncated, max 50 chars + "...")
    - 1rem, medium weight, dark text (gray-900)
  - Second line: Date
    - 0.875rem, gray-500
    - Format: "Jan 15, 2026" or "Today" / "Yesterday"

EMPTY STATE (centered in viewport):
- Chat bubble icon (48px, gray-300)
- "No conversations yet" (1rem, gray-500)
- "Start a new chat with ALVIN!" (0.875rem, gray-400)
- Optional: Larger "New Chat" button below

LOADING STATE:
- "Loading..." centered (gray-500)
- Or skeleton cards (3 placeholder cards)

BUTTON STATES:
- "New Chat" default: blue-500
- "New Chat" hover: blue-600
- "New Chat" loading: "Creating..." disabled state
```

---

## Component Details

### Header
| Property | Value |
|----------|-------|
| Background | white |
| Border | border-b border-gray-200 |
| Padding | 16px |
| Position | sticky top-0 |
| Z-index | 10 |

### Conversation Card
| Property | Value |
|----------|-------|
| Background | white |
| Border | border border-gray-200 |
| Padding | 16px |
| Border Radius | 8px |
| Hover | bg-gray-50 |
| Cursor | pointer |

### New Chat Button
| Property | Value |
|----------|-------|
| Background | blue-500 (#3b82f6) |
| Hover | blue-600 (#2563eb) |
| Text | white, font-medium |
| Padding | 8px 12px |
| Border Radius | 8px |

---

## States

### Default (Has Conversations)
- List of conversation cards
- Most recent first
- Each shows preview and date

### Empty (No Conversations)
- Centered empty state message
- Chat icon
- Encouraging text to start chatting

### Loading
- "Loading..." text or skeleton cards
- Brief loading state during fetch

### Creating New Chat
- Button shows "Creating..."
- Disabled state
- On success: navigate to new conversation

### Error
- Toast notification: "Could not load conversations"
- Retry option

---

## Interactions

### Tap Conversation
1. Highlight card briefly
2. Navigate to `/chat/[conversationId]`

### Tap New Chat
1. Button shows loading state
2. Create new conversation via API
3. Navigate to new conversation

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Full width cards |
| Tablet+ (>=640px) | Max-width container, centered |

---

## Data Requirements

| Field | Source | Usage |
|-------|--------|-------|
| Conversations | conversation.list | Display list |
| Preview | First message content | Card preview text |
| Date | conversation.updatedAt | Display date |
| Conversation ID | conversation.id | Navigation |

---

## Preview Text Formatting

```
- Truncate at 50 characters
- Add "..." if truncated
- If empty: show "New conversation"
- Strip any markdown formatting
```

---

## Date Formatting

| Condition | Display |
|-----------|---------|
| Today | "Today" |
| Yesterday | "Yesterday" |
| This week | Day name ("Monday") |
| This year | "Jan 15" |
| Older | "Jan 15, 2025" |

---

## Accessibility

- Cards are keyboard navigable (Tab, Enter)
- Focus ring visible on cards and button
- Screen reader: "Conversation from [date]: [preview]"
- Button labeled "Create new conversation"
