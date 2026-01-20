# Individual Chat Page (/chat/[id])

> AI wellness conversation interface

## UX Pilot Prompt

```
Design an AI chat interface for wellness conversations:

LAYOUT:
- Full viewport height
- Light/white background
- Flex column structure: header, banner (optional), messages, input
- No scrolling on main container; messages area scrolls

HEADER (sticky top):
- White background with bottom border (gray-200)
- 16px padding
- Left: "← Back" link
  - Blue text (blue-500)
  - Links to /chat
  - No underline, hover: underline
- Center/Right:
  - "ALVIN" title (1.25rem semibold, gray-900)
  - "Your wellness companion" (0.875rem, gray-500)

CHECK-IN BANNER (conditional - shows if conversation has check-in):
- Light green background (green-50)
- Green bottom border (green-200)
- Centered text: "Check-in recorded" + timestamp
- 12px padding
- 0.875rem font size
- Green icon (checkmark) optional

MESSAGE AREA:
- Flex-1, scrollable (overflow-y auto)
- 16px padding
- Messages stack vertically with 12px gap
- Auto-scroll to bottom on new messages

USER MESSAGES (right-aligned):
- Max-width: 80%
- Blue background (#3b82f6)
- White text
- 12px padding
- 8px border radius
- Margin-left: auto (pushes right)

ASSISTANT MESSAGES (left-aligned):
- Max-width: 80%
- Light gray background (gray-100)
- Dark text (gray-900)
- 12px padding
- 8px border radius
- Margin-right: auto (pushes left)
- Supports basic markdown rendering

TYPING INDICATOR (when waiting for AI):
- Left-aligned like assistant message
- Gray-100 background
- "ALVIN is thinking..." in gray-500
- Animated dots (optional)

EMPTY STATE (no messages yet):
- Centered in message area
- ALVIN icon or avatar (48px)
- "Hi! I'm ALVIN." (1.125rem, gray-700)
- "How are you doing today?" (0.875rem, gray-500)

ERROR BANNER (if sending fails):
- Red background (red-50)
- Red border (red-200)
- Red text (red-600)
- Position: above input area
- Dismiss button (X)

INPUT AREA (sticky bottom):
- White background with top border (gray-200)
- 16px padding
- Horizontal flex layout

Text Input:
- Flex-1
- Border (gray-300), focus: blue-500
- 8px border radius
- 12px padding
- Placeholder: "Type a message..."
- Disabled: gray-50 background

Send Button:
- 8px gap from input
- Blue background when enabled (blue-500)
- Gray when disabled (gray-300)
- White text "Send"
- Medium font weight
- 12px vertical, 24px horizontal padding
- 8px border radius
- Disabled: when input empty or sending
```

---

## Component Details

### Message Bubble - User
| Property | Value |
|----------|-------|
| Background | blue-500 (#3b82f6) |
| Text Color | white |
| Padding | 12px |
| Border Radius | 8px |
| Max Width | 80% |
| Alignment | right (ml-auto) |

### Message Bubble - Assistant
| Property | Value |
|----------|-------|
| Background | gray-100 |
| Text Color | gray-900 |
| Padding | 12px |
| Border Radius | 8px |
| Max Width | 80% |
| Alignment | left (mr-auto) |

### Check-In Banner
| Property | Value |
|----------|-------|
| Background | green-50 |
| Border | border-b border-green-200 |
| Text | gray-700, 0.875rem |
| Padding | 12px |
| Icon | checkmark, green-600 |

### Input Field
| Property | Value |
|----------|-------|
| Background | white |
| Border | gray-300, focus: blue-500 |
| Padding | 12px |
| Border Radius | 8px |
| Placeholder | gray-400 |

### Send Button
| Property | Enabled | Disabled |
|----------|---------|----------|
| Background | blue-500 | gray-300 |
| Text | white | white |
| Cursor | pointer | not-allowed |

---

## States

### Idle
- Input enabled
- Send button disabled (no text)
- Ready for user input

### Typing
- Input contains text
- Send button enabled (blue)

### Sending
- Input disabled (gray background)
- Send button shows "Sending..." or disabled
- User message appears immediately (optimistic)

### Streaming Response
- Input disabled
- Typing indicator shows
- Assistant message streams in word by word

### Check-In Detected
- Wellness phrase detected in conversation
- Check-in recorded automatically
- Banner appears below header

### Error
- Red error banner above input
- Message: "Failed to send. Tap to retry."
- Input re-enabled for retry

---

## Wellness Detection

The system automatically detects wellness phrases and can trigger a check-in:

| Phrase Pattern | Action |
|----------------|--------|
| "I'm okay" / "I'm fine" / "I'm good" | Offer check-in |
| "doing well" / "doing great" | Offer check-in |
| "feeling fine" / "feeling good" | Offer check-in |

When detected, the check-in banner appears showing the check-in was recorded.

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Full width, edge-to-edge messages |
| Tablet+ (>=640px) | Max-width container for messages |

---

## Data Requirements

| Field | Source | Usage |
|-------|--------|-------|
| Conversation | conversation.getById | Load conversation |
| Messages | conversation.messages | Display messages |
| Check-In Status | conversation.checkInId | Show banner |
| User Role | message.role | Bubble alignment |
| Content | message.content | Display text |

---

## Message Streaming

Messages from the AI assistant stream in progressively:

```
1. User sends message
2. Typing indicator appears
3. First chunk arrives - start displaying
4. Subsequent chunks append
5. Complete - indicator removed
6. Input re-enabled
```

---

## Empty State Copy

```
Icon: ALVIN avatar or chat bubble icon
Heading: "Hi! I'm ALVIN."
Subtext: "How are you doing today?"
```

---

## Accessibility

- Input has proper label (aria-label="Message input")
- Messages have role="log" for screen readers
- New messages announced via aria-live
- Back link has aria-label="Back to conversations"
- Focus management: input focused on page load
- Keyboard: Enter to send (Shift+Enter for newline optional)
