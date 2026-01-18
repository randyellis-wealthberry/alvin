# Phase 12: Push Notifications - Research

**Researched:** 2026-01-17
**Domain:** Web Push API with service worker integration
**Confidence:** HIGH

<research_summary>
## Summary

Researched the Web Push ecosystem for implementing native push alerts in a Next.js 15 PWA using Serwist. The standard approach uses the `web-push` Node.js library with VAPID authentication, storing PushSubscription objects in the database per user, and handling push events in the existing service worker.

Key finding: Don't hand-roll push encryption. The `web-push` library handles all RFC 8291 encryption, VAPID key management, and push service communication. The main complexity is in UX (two-step permission flow) and subscription lifecycle management (handling 410/404 for expired subscriptions).

**Primary recommendation:** Use web-push library with VAPID keys stored as environment variables. Implement two-step permission prompt in UI. Add PushSubscription model to Prisma schema. Extend existing sw.ts with push event handler.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| web-push | ^3.6.7 | Server-side push sending | Official Web Push library, handles encryption/VAPID, 97.1 benchmark score |
| Serwist | existing | Service worker framework | Already in use for PWA, supports push events |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | web-push is self-contained |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| web-push | Firebase Cloud Messaging (FCM) | FCM adds vendor lock-in, requires Firebase project; web-push is standards-based and provider-free |
| VAPID (web-push) | GCM API Key | GCM is legacy, VAPID is the modern standard |

**Installation:**
```bash
npm install web-push
```

**Generate VAPID keys (one-time):**
```bash
npx web-push generate-vapid-keys --json
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── sw.ts                    # Extend with push handler
│   └── api/push/
│       ├── subscribe/route.ts   # Store PushSubscription
│       ├── unsubscribe/route.ts # Remove PushSubscription
│       └── test/route.ts        # Test notification endpoint
├── lib/
│   └── push.ts                  # web-push configuration
└── components/
    └── push-prompt.tsx          # Two-step permission UI
```

### Pattern 1: Two-Step Permission Flow (Critical UX)
**What:** Custom UI prompt before browser permission request
**When to use:** Always - prevents users from permanently blocking notifications
**Why:** If user blocks browser permission, can never ask again. Two-step gives second chance.
**Example:**
```typescript
// First: Show custom prompt with context
<Dialog>
  <p>Get notified about check-in reminders and alerts</p>
  <Button onClick={handleEnable}>Enable Notifications</Button>
  <Button onClick={handleLater}>Maybe Later</Button>
</Dialog>

// Then: If user clicks "Enable", request browser permission
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  // Subscribe to push
}
```

### Pattern 2: Subscription Storage with User Association
**What:** Store PushSubscription in database linked to UserProfile
**When to use:** When user grants permission
**Example (Prisma schema addition):**
```prisma
model PushSubscription {
  id            String      @id @default(cuid())
  userProfile   UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
  userProfileId String

  // Web Push subscription data
  endpoint      String      @unique
  p256dh        String      // Public key
  auth          String      // Auth secret

  // Metadata
  userAgent     String?     // Track device/browser
  createdAt     DateTime    @default(now())

  @@index([userProfileId])
}
```

### Pattern 3: Service Worker Push Handler
**What:** Handle push event and display notification
**When to use:** In service worker (sw.ts)
**Critical:** Always return promise inside `event.waitUntil()` or browser shows default notification
**Example:**
```typescript
// Add to sw.ts
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'ALVIN', body: 'New notification' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag, // Group by type
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';

  event.waitUntil(
    clients.openWindow(url)
  );
});
```

### Pattern 4: Handle Expired Subscriptions
**What:** Remove invalid subscriptions on 410/404 response
**When to use:** When sending notifications
**Example:**
```typescript
try {
  await webpush.sendNotification(subscription, payload);
} catch (error) {
  if (error.statusCode === 410 || error.statusCode === 404) {
    // Subscription expired - remove from database
    await db.pushSubscription.delete({ where: { endpoint: subscription.endpoint } });
  }
}
```

### Anti-Patterns to Avoid
- **Requesting permission on page load:** 90% of prompts are dismissed. Wait for user context.
- **Single permission prompt:** If blocked, can never ask again. Always use two-step.
- **Not using event.waitUntil():** Browser shows default notification or kills service worker.
- **Storing subscriptions without user association:** Can't target notifications to specific users.
- **Ignoring 410/404 errors:** Database fills with stale subscriptions.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Push encryption | Custom RFC 8291 implementation | `web-push.sendNotification()` | Encryption is complex (P-256, HKDF, AEAD), easy to get wrong |
| VAPID key generation | Manual elliptic curve keys | `web-push generate-vapid-keys` | Cryptographically secure generation required |
| Payload encoding | Manual Base64URL encoding | `web-push` handles internally | Multiple encoding steps, easy to corrupt |
| Subscription validation | Manual endpoint checking | Send and handle 410/404 | Push service tells you when invalid |
| Permission state tracking | localStorage flags | `Notification.permission` + `navigator.permissions.query()` | Browser already tracks this reliably |

**Key insight:** Web Push involves multiple encryption layers (VAPID JWT signing, ECDH key exchange, AES-GCM encryption). The `web-push` library abstracts all of this. Rolling your own is a security risk.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: iOS PWA Limitations
**What goes wrong:** Notifications don't work on iOS Safari, only installed PWAs
**Why it happens:** iOS requires: (1) iOS 16.4+, (2) PWA added to home screen, (3) permission requested from installed PWA
**How to avoid:**
- Detect iOS and show "Add to Home Screen" instructions before enabling push
- Only show push prompt after confirming PWA is installed (check `display-mode: standalone`)
- Expect some iOS users to report "notifications don't work" - document requirements
**Warning signs:** Works on Android but not iOS, works in Safari but not home screen app

### Pitfall 2: Permission Permanently Blocked
**What goes wrong:** User clicks "Block" on browser prompt, can never ask again
**Why it happens:** Single-step permission prompt with no context
**How to avoid:**
- Always use two-step prompt with custom UI first
- Explain value: "Get notified about check-in reminders" not just "Enable notifications"
- If `Notification.permission === 'denied'`, show instructions to unblock in settings
**Warning signs:** Low opt-in rate, users saying "I never saw a prompt"

### Pitfall 3: Subscription Expiry and Staleness
**What goes wrong:** Notifications fail silently, delivery rate drops over time
**Why it happens:** Subscriptions can expire (browser-dependent), user may have unsubscribed
**How to avoid:**
- Handle 410/404 errors from `sendNotification()` and delete stale subscriptions
- Consider re-prompting users after long inactivity (optional, careful UX)
- Use `pushsubscriptionchange` event in service worker to update subscription
**Warning signs:** High failure rate on older subscriptions, 410 errors in logs

### Pitfall 4: Payload Size Exceeded
**What goes wrong:** Push service returns 413, notification not delivered
**Why it happens:** Payload exceeds 4096 bytes (or 4078 after encryption overhead)
**How to avoid:**
- Keep payload minimal: title, body, icon, url, tag
- Don't embed large data - fetch from server when notification clicked
- Test with realistic payloads
**Warning signs:** 413 errors in logs, some notifications not arriving

### Pitfall 5: Service Worker Not Handling Push
**What goes wrong:** Browser shows generic "Site has been updated" notification
**Why it happens:** Push event not returning promise in `event.waitUntil()`
**How to avoid:**
- Always wrap `showNotification()` in `event.waitUntil()`
- Test push notifications in development (requires HTTPS or localhost)
**Warning signs:** Wrong notification content, "Site has been updated" messages
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Server-Side VAPID Setup
```typescript
// src/lib/push.ts
// Source: web-push README (Context7)
import webpush from 'web-push';
import { env } from '~/env';

webpush.setVapidDetails(
  'mailto:' + env.VAPID_CONTACT_EMAIL, // e.g., mailto:support@alvin.app
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export { webpush };
```

### Client-Side Subscription Flow
```typescript
// Source: web-push docs + MDN Push API
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // Required by browsers
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    )
  });

  // Send to server to store
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

// Helper function (required for VAPID public key)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData, char => char.charCodeAt(0));
}
```

### Send Notification with Error Handling
```typescript
// Source: web-push docs (Context7)
import { webpush } from '~/lib/push';
import { db } from '~/server/db';

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: 'high',
      }
    );
    return { success: true };
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired - clean up
      await db.pushSubscription.delete({
        where: { endpoint: subscription.endpoint },
      });
      return { success: false, reason: 'expired' };
    }
    throw error;
  }
}
```

### Service Worker Push Handler
```typescript
// Add to src/app/sw.ts
// Source: MDN Push API + web.dev push-notifications-handling-messages

// Push event - received when server sends notification
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {
    title: 'ALVIN',
    body: 'You have a new notification',
  };

  const options: NotificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag ?? 'default',
    requireInteraction: data.requireInteraction ?? false,
    data: { url: data.url ?? '/dashboard' },
  };

  // CRITICAL: Must use waitUntil or browser shows default notification
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click - open relevant page
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const url = event.notification.data?.url ?? '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GCM API Key | VAPID authentication | 2018+ | VAPID is now standard, GCM deprecated |
| next-pwa | Serwist | 2024 | Already using Serwist, push compatible |
| Single permission prompt | Two-step prompt | Best practice | Higher opt-in rates, recoverable denial |

**New tools/patterns to consider:**
- **iOS 16.4+ PWA push:** Finally supported (2023), but requires home screen install
- **Serwist:** Already in use, supports push event handling natively
- **Web Push urgency/TTL:** Use `urgency: 'high'` for check-in reminders, `TTL: 86400` for 24h expiry

**Deprecated/outdated:**
- **GCM API Key:** Legacy, use VAPID instead
- **next-pwa:** Unmaintained, already migrated to Serwist
- **Single permission prompt:** Bad UX, causes permanent blocks
</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **iOS subscription reliability**
   - What we know: iOS PWA push works but has reported reliability issues (subscriptions becoming invalid unexpectedly)
   - What's unclear: Root cause and mitigation strategies
   - Recommendation: Implement subscription refresh on app focus, handle errors gracefully, expect some iOS-specific issues

2. **Notification grouping strategy**
   - What we know: `tag` option groups notifications, new replaces old with same tag
   - What's unclear: Best strategy for ALVIN's use cases (reminders vs escalations vs family alerts)
   - Recommendation: Define tag taxonomy during planning (e.g., `reminder`, `escalation-{level}`, `family-alert`)
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [/web-push-libs/web-push](https://github.com/web-push-libs/web-push) - Context7 - VAPID setup, sendNotification API, error handling
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) - Push event handling, showNotification
- [web.dev Push Notifications](https://web.dev/articles/push-notifications-overview) - Architecture patterns, UX best practices

### Secondary (MEDIUM confidence)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - PWA + push integration with Next.js 15
- [Permission UX (web.dev)](https://web.dev/articles/push-notifications-permissions-ux) - Two-step prompt pattern
- [Pushpad Blog](https://pushpad.xyz/blog/web-push-error-410-the-push-subscription-has-expired-or-the-user-has-unsubscribed) - Subscription expiry handling

### Tertiary (LOW confidence - needs validation)
- iOS reliability issues reported in Apple Developer Forums - monitor during implementation
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Web Push API, Push API
- Ecosystem: web-push npm library, VAPID
- Patterns: Two-step permission, subscription storage, push event handling
- Pitfalls: iOS limitations, permission blocking, subscription expiry, payload size

**Confidence breakdown:**
- Standard stack: HIGH - web-push is the only serious option for Node.js
- Architecture: HIGH - patterns from official docs and Context7
- Pitfalls: HIGH - well-documented across multiple sources
- Code examples: HIGH - from Context7 and official MDN

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - Web Push ecosystem is stable)
</metadata>

---

*Phase: 12-push-notifications*
*Research completed: 2026-01-17*
*Ready for planning: yes*
