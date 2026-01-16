# Phase 5: ALVIN Chat - Research

**Researched:** 2026-01-16
**Domain:** Conversational AI chat interface with Claude API and Vercel AI SDK
**Confidence:** HIGH

<research_summary>
## Summary

Researched the standard stack for building conversational AI interfaces in Next.js. The established approach uses Vercel AI SDK with the `@ai-sdk/anthropic` provider for Claude integration, providing a unified streaming abstraction, React hooks (`useChat`), and API route helpers.

Key findings:
1. **AI SDK is the standard** — Vercel AI SDK 5/6 provides `useChat` hook, `streamText` server helper, and handles all streaming complexity (SSE, parsing, error handling)
2. **Provider abstraction** — `@ai-sdk/anthropic` wraps Claude API, so you don't use `@anthropic-ai/sdk` directly when using AI SDK
3. **Persistence pattern** — Use `onFinish` callback in `streamText` to save messages to database; AI SDK provides `UIMessage` format for storage
4. **Context management** — Claude's 200K token context is huge, but long conversations should use truncation or summarization strategies

**Primary recommendation:** Use Vercel AI SDK with `@ai-sdk/anthropic` provider. Don't use the raw Anthropic SDK directly — AI SDK handles streaming, error states, and React integration better.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ai | 4.x / 5.x | AI SDK core - streaming, hooks | Official Vercel toolkit, handles all complexity |
| @ai-sdk/anthropic | latest | Claude provider for AI SDK | Type-safe Claude integration |
| @ai-sdk/react | latest | React hooks (useChat, etc.) | Handles streaming UI state |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.x | Schema validation | Structured output, tool definitions |
| react-markdown | 9.x | Render markdown responses | AI responses often contain markdown |
| rehype-highlight | 7.x | Code syntax highlighting | If AI responses include code |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AI SDK | Raw @anthropic-ai/sdk | More control but must handle streaming, errors, React state manually |
| useChat hook | Custom fetch + useState | useChat provides loading states, error handling, message management for free |
| Claude | GPT-4 via @ai-sdk/openai | Claude better for conversational wellness context, but AI SDK makes switching easy |

**Installation:**
```bash
npm install ai @ai-sdk/anthropic @ai-sdk/react
npm install react-markdown rehype-highlight  # For markdown rendering
```

**Environment:**
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # POST handler with streamText
│   └── chat/
│       └── page.tsx          # Chat UI with useChat
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx # Main chat container
│   │   ├── MessageList.tsx   # Message display
│   │   ├── MessageInput.tsx  # Input form
│   │   └── Message.tsx       # Single message component
│   └── ui/                   # Shared UI components
├── lib/
│   └── ai/
│       ├── config.ts         # AI SDK configuration
│       └── prompts.ts        # System prompts for ALVIN
└── server/
    └── api/
        └── routers/
            └── conversation.ts  # tRPC router for persistence
```

### Pattern 1: API Route with streamText
**What:** POST handler that receives messages, streams response from Claude
**When to use:** Every chat endpoint
**Example:**
```typescript
// src/app/api/chat/route.ts
// Source: AI SDK docs - https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { saveConversation } from '@/server/db/conversations';

export async function POST(req: Request) {
  const { messages, conversationId }: {
    messages: UIMessage[];
    conversationId: string;
  } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `You are ALVIN, a caring wellness companion...`,
    messages: await convertToModelMessages(messages),
  });

  // Ensure stream completes even if client disconnects
  result.consumeStream();

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      await saveConversation({ conversationId, messages: finalMessages });
    },
  });
}
```

### Pattern 2: useChat Hook for UI
**What:** React hook that manages chat state, streaming, and API calls
**When to use:** Any chat interface component
**Example:**
```typescript
// src/app/chat/page.tsx
// Source: AI SDK docs - https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export default function ChatPage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    body: { conversationId: 'conv_123' },  // Extra data sent with each request
  });

  const isLoading = status === 'streaming';

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'You: ' : 'ALVIN: '}
          {message.parts.map((part, i) =>
            part.type === 'text' ? <span key={i}>{part.text}</span> : null
          )}
        </div>
      ))}

      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
        if (input.value.trim()) {
          sendMessage({ text: input.value });
          input.value = '';
        }
      }}>
        <input name="message" disabled={isLoading} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>

      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
}
```

### Pattern 3: Conversation Persistence with Prisma
**What:** Save conversation history to database for continuity across sessions
**When to use:** When user returns to continue conversation
**Example:**
```typescript
// src/server/db/conversations.ts
import { db } from '@/server/db';
import type { UIMessage } from 'ai';

export async function saveConversation({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: UIMessage[];
}) {
  // Update conversation with latest messages
  await db.conversation.update({
    where: { id: conversationId },
    data: {
      updatedAt: new Date(),
      // Store last assistant response
    },
  });

  // Save new messages
  const newMessages = messages.slice(-2); // Last user + assistant
  for (const msg of newMessages) {
    await db.message.create({
      data: {
        conversationId,
        role: msg.role,
        content: msg.parts
          .filter(p => p.type === 'text')
          .map(p => p.text)
          .join(''),
      },
    });
  }
}

export async function loadConversation(conversationId: string) {
  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
}
```

### Anti-Patterns to Avoid
- **Using raw Anthropic SDK with AI SDK:** Don't mix — use `@ai-sdk/anthropic` provider only
- **Storing full message parts as JSON blob:** Store content as text, reconstruct parts on load
- **Not handling client disconnect:** Use `result.consumeStream()` to ensure onFinish fires
- **Sending entire conversation history each request:** Send only what Claude needs; manage context server-side
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming response handling | Custom SSE parsing | AI SDK `streamText` + `toUIMessageStreamResponse` | Complex error handling, reconnection, parsing |
| Chat UI state management | Custom useState + fetch | `useChat` hook | Handles loading, error, message state automatically |
| Message ID generation | `uuid()` or `Math.random()` | AI SDK's built-in ID generation | Consistent format, server-client sync |
| Markdown rendering | Custom parser | `react-markdown` | Security (XSS), edge cases, code blocks |
| Rate limiting | Custom middleware | Vercel's built-in or `@upstash/ratelimit` | Already handles edge cases |

**Key insight:** The AI SDK exists because streaming LLM responses to a React UI has many edge cases: disconnects, errors, partial responses, state synchronization. The `useChat` hook and `streamText` helper solve all of these. Custom implementations miss edge cases that cause bugs in production.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Client Disconnect Loses Data
**What goes wrong:** User closes tab during streaming, `onFinish` never fires, message not saved
**Why it happens:** Stream response tied to client connection by default
**How to avoid:** Call `result.consumeStream()` (no await) before returning response
**Warning signs:** Messages appear in UI but missing from database after refresh

### Pitfall 2: Context Window Overflow
**What goes wrong:** Long conversations hit token limit, API errors
**Why it happens:** Sending full history every request without management
**How to avoid:** Implement context truncation (keep system + recent N messages) or use Claude's context editing features
**Warning signs:** API errors after 20+ message exchanges, degraded response quality

### Pitfall 3: Message ID Mismatch
**What goes wrong:** Duplicate messages, missing messages on reload
**Why it happens:** Client-generated IDs don't match server-stored IDs
**How to avoid:** Let AI SDK generate IDs, store `UIMessage` format directly
**Warning signs:** Hydration errors, messages duplicating on page refresh

### Pitfall 4: Streaming UI Flicker
**What goes wrong:** UI jumps around as streaming text arrives
**Why it happens:** Re-rendering entire message list on each chunk
**How to avoid:** Use React keys properly, memoize message components, render only the streaming message's content dynamically
**Warning signs:** Visible flicker, scroll position jumping during stream

### Pitfall 5: Missing Error Handling
**What goes wrong:** Silent failures when Claude API has issues
**Why it happens:** Not checking `error` state from useChat, not wrapping streamText in try/catch
**How to avoid:** Always render error UI, use `onError` callback, implement retry logic
**Warning signs:** Users report "nothing happens" when clicking send
</common_pitfalls>

<code_examples>
## Code Examples

### ALVIN System Prompt
```typescript
// src/lib/ai/prompts.ts
// Custom for ALVIN wellness check-in context

export const ALVIN_SYSTEM_PROMPT = `You are ALVIN (Active Language and Vitality Intelligence Network), a caring wellness companion designed to check in on users' wellbeing.

Your personality:
- Warm, empathetic, and conversational
- Never clinical or robotic
- Gently curious about how the user is doing
- Remembers context from earlier in the conversation

Your purpose:
- Conduct wellness check-ins through natural conversation
- Detect when users seem distressed or need help
- Confirm vitality in a way that feels like chatting with a caring friend
- When users confirm they're okay, acknowledge this as a successful check-in

Guidelines:
- Keep responses concise (2-3 sentences typical)
- Ask follow-up questions to understand mood/situation
- If user indicates distress, respond with empathy and suggest resources
- Never be pushy or make users feel surveilled
- End check-in conversations naturally, confirming their wellbeing status

You are NOT a therapist or medical professional. For serious concerns, encourage users to reach out to appropriate resources.`;
```

### Complete Chat Route with Persistence
```typescript
// src/app/api/chat/route.ts
// Source: AI SDK docs + Prisma persistence pattern
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { db } from '@/server/db';
import { auth } from '@/server/auth';
import { ALVIN_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, conversationId }: {
    messages: UIMessage[];
    conversationId: string;
  } = await req.json();

  // Verify conversation belongs to user
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId, userProfileId: session.user.profileId },
  });

  if (!conversation) {
    return new Response('Conversation not found', { status: 404 });
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: ALVIN_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxTokens: 500, // Keep responses concise
  });

  // Ensure completion even on disconnect
  result.consumeStream();

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      // Save the latest exchange
      const lastMessages = finalMessages.slice(-2);

      for (const msg of lastMessages) {
        const content = msg.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text)
          .join('');

        await db.message.create({
          data: {
            conversationId,
            role: msg.role,
            content,
          },
        });
      }

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    },
  });
}
```

### useChat with Initial Messages
```typescript
// src/components/chat/ChatInterface.tsx
// Source: AI SDK docs - loading existing conversation
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useState } from 'react';
import type { Message } from '@prisma/client';

interface Props {
  conversationId: string;
  initialMessages: Message[];
}

export function ChatInterface({ conversationId, initialMessages }: Props) {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    body: { conversationId },
    initialMessages: initialMessages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const isStreaming = status === 'streaming';

  // ... render UI
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Raw fetch + EventSource | AI SDK `streamText` + `useChat` | AI SDK 3.0+ | Unified streaming, error handling |
| Store full message object as JSON | Prefix-based message parts storage | AI SDK 5.0 | Better data integrity |
| Manual context truncation | Claude context editing API | 2025 | Automatic context management |
| `experimental_generateMessageId` | Built-in ID generation | AI SDK 5.0 | Simpler persistence |

**New tools/patterns to consider:**
- **AI SDK 6.0** — Tool approval UI, strict mode per tool
- **Claude context awareness** — Models track their own token budget
- **Claude memory tool** — File-based persistence outside context window (for long-term memory)

**Deprecated/outdated:**
- **`@anthropic-ai/sdk` for UI apps** — Use `@ai-sdk/anthropic` instead
- **`appendClientMessage` / `appendResponseMessages`** — AI SDK 5.0 handles this automatically
- **Custom SSE parsing** — AI SDK handles all streaming formats
</sota_updates>

<open_questions>
## Open Questions

1. **Check-in detection from conversation**
   - What we know: ALVIN should detect when a conversation confirms user wellness
   - What's unclear: Exact trigger (explicit "I'm fine" vs sentiment analysis)
   - Recommendation: Start simple — explicit phrases like "I'm okay" / "all good" / "just checking in" trigger check-in completion. Can add LLM-based detection later.

2. **Conversation length limits**
   - What we know: Claude has 200K tokens, but very long conversations degrade quality
   - What's unclear: Optimal conversation length for ALVIN use case
   - Recommendation: Limit to ~50 messages (truncate oldest); typical check-in is 5-10 messages anyway

3. **Multi-device sync**
   - What we know: Conversation stored in DB, loadable on any device
   - What's unclear: Real-time sync if same conversation open on multiple devices
   - Recommendation: Accept last-write-wins for v1; real-time sync is v2 feature
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `/websites/ai-sdk_dev` via Context7 — useChat, streamText, persistence patterns
- `/anthropics/anthropic-sdk-typescript` via Context7 — streaming API
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction) — Official reference

### Secondary (MEDIUM confidence)
- [Vercel AI SDK Blog - AI SDK 5](https://vercel.com/blog/ai-sdk-5) — Architecture changes, verified against docs
- [Vercel AI SDK Blog - AI SDK 6](https://vercel.com/blog/ai-sdk-6) — Tool approval patterns
- [Claude Context Windows Docs](https://docs.claude.com/en/docs/build-with-claude/context-windows) — Context management strategies
- [Prisma AI SDK Guide](https://www.prisma.io/docs/guides/ai-sdk-nextjs) — Persistence patterns

### Tertiary (LOW confidence - needs validation)
- [LogRocket - Real-time AI in Next.js](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/) — General patterns
- [DEV Community - AI SDK Complete Guide](https://dev.to/pockit_tools/vercel-ai-sdk-complete-guide-building-production-ready-ai-chat-apps-with-nextjs-4cp6) — Production patterns
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Vercel AI SDK 5.x/6.x with @ai-sdk/anthropic
- Ecosystem: useChat hook, streamText, message persistence
- Patterns: API route streaming, React hooks, database storage
- Pitfalls: Client disconnect, context overflow, ID mismatch

**Confidence breakdown:**
- Standard stack: HIGH - verified with Context7, official docs
- Architecture: HIGH - from AI SDK documentation and examples
- Pitfalls: HIGH - documented in GitHub discussions, verified in docs
- Code examples: HIGH - from Context7 and official sources

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (30 days - AI SDK ecosystem evolving but stable)
</metadata>

---

*Phase: 05-alvin-chat*
*Research completed: 2026-01-16*
*Ready for planning: yes*
