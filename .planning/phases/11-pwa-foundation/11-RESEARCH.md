# Phase 11: PWA Foundation - Research

**Researched:** 2026-01-17
**Domain:** Next.js 15 App Router PWA with Serwist
**Confidence:** HIGH

<research_summary>
## Summary

Researched the PWA ecosystem for Next.js 15 App Router. The standard approach uses **Serwist** (the successor to next-pwa) for service worker generation, combined with Next.js built-in manifest support.

Key finding: **next-pwa is deprecated** — its maintainer archived the project and development moved to `@ducanh2912/next-pwa`, which itself now recommends migrating to `@serwist/next`. Serwist is actively maintained and designed for modern Next.js App Router patterns.

The Next.js official PWA guide recommends Serwist for offline functionality and provides built-in `app/manifest.ts` support for web app manifests without additional libraries.

**Primary recommendation:** Use `@serwist/next` + `serwist` with Next.js built-in manifest. Create `app/sw.ts` for service worker, `app/manifest.ts` for PWA metadata.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @serwist/next | ^9.x | Next.js integration for service worker | Official successor to next-pwa, designed for App Router |
| serwist | ^9.x (dev) | Service worker utilities | Fork of Workbox with active maintenance |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (built-in) | - | app/manifest.ts | Always - Next.js native manifest support |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @serwist/next | @ducanh2912/next-pwa | ducanh2912 version is predecessor, recommends migrating to Serwist |
| @serwist/next | next-pwa (original) | DEPRECATED - last update 2+ years ago, incompatible with Next.js 14/15 |
| @serwist/next | Manual service worker | Much more work, miss precaching, caching strategies handled for you |

**Installation:**
```bash
npm i @serwist/next && npm i -D serwist
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
app/
├── manifest.ts         # PWA manifest (built-in Next.js support)
├── sw.ts               # Service worker source (Serwist compiles this)
├── layout.tsx          # Add PWA metadata here
└── page.tsx
public/
├── sw.js               # Compiled service worker (generated)
├── icon-192x192.png    # PWA icons
├── icon-512x512.png
└── apple-touch-icon.png
next.config.mjs         # Serwist configuration
tsconfig.json           # Add webworker types
```

### Pattern 1: Serwist Next.js Configuration
**What:** Configure Serwist in next.config.mjs to generate service worker
**When to use:** Always - this is the entry point for PWA setup
**Example:**
```javascript
// next.config.mjs
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  register: true,
  scope: "/",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
});

const nextConfig = {
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
```

### Pattern 2: Service Worker with defaultCache
**What:** Use Serwist's built-in caching strategies optimized for Next.js
**When to use:** Always - don't hand-roll caching strategies
**Example:**
```typescript
// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

### Pattern 3: Dynamic Manifest with TypeScript
**What:** Use Next.js built-in manifest support for type-safe PWA metadata
**When to use:** Always - no external library needed
**Example:**
```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ALVIN - Vitality Monitor',
    short_name: 'ALVIN',
    description: 'AI-powered vitality monitoring',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

### Pattern 4: Layout Metadata for Apple/Mobile
**What:** Add PWA-specific metadata in root layout
**When to use:** Required for iOS compatibility
**Example:**
```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  applicationName: "ALVIN",
  title: { default: "ALVIN", template: "%s - ALVIN" },
  description: "AI-powered vitality monitoring",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ALVIN",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};
```

### Anti-Patterns to Avoid
- **Using next-pwa (original):** Deprecated, no App Router support, security issues
- **Hand-rolling service worker from scratch:** Serwist handles precaching, caching strategies, updates
- **Skipping TypeScript types for service worker:** Add webworker types to tsconfig.json
- **Not disabling in development:** Service worker caching breaks hot reload
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker generation | Manual sw.js | @serwist/next | Handles precaching, versioning, updates automatically |
| Caching strategies | Custom cache logic | defaultCache from Serwist | Next.js-optimized strategies for pages, assets, API routes |
| Manifest generation | Manual manifest.json | app/manifest.ts | Type-safe, dynamic, built into Next.js |
| Precache manifest | Manual asset listing | Serwist __SW_MANIFEST injection | Auto-generated at build time |
| Service worker registration | navigator.serviceWorker.register() | Serwist register: true | Handles scope, update detection, lifecycle |
| Offline fallback | Custom fetch handler | Serwist fallbacks config | Declarative, handles edge cases |

**Key insight:** The PWA ecosystem has 10+ years of solved problems. Serwist (Workbox fork) implements proper service worker lifecycle management, cache versioning, and update strategies. Hand-rolling leads to stale content bugs, cache corruption, and update failures that are notoriously hard to debug.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Turbopack Incompatibility
**What goes wrong:** Error "Webpack is configured while Turbopack is not"
**Why it happens:** Serwist uses webpack plugins, Turbopack doesn't support them
**How to avoid:** Use `next dev` without `--turbo` flag for PWA development, or use `next build && next start`
**Warning signs:** Build errors mentioning webpack/turbopack conflict

### Pitfall 2: Service Worker Caching in Development
**What goes wrong:** Changes don't appear, stuck on old version
**Why it happens:** Service worker caches aggressively
**How to avoid:** Set `disable: process.env.NODE_ENV === "development"` in Serwist config
**Warning signs:** "Why isn't my change showing up?" after refresh

### Pitfall 3: Safari Caching API Responses
**What goes wrong:** Stale data after pull-to-refresh
**Why it happens:** Safari honors cache headers more strictly than Chrome
**How to avoid:** Add timestamp query params to API requests, or use NetworkOnly for dynamic data
**Warning signs:** iOS users see old data while Android users see fresh data

### Pitfall 4: iOS Storage Eviction
**What goes wrong:** PWA data disappears after 7 days
**Why it happens:** iOS 13.4+ has 7-day cap on script-writable storage if unused
**How to avoid:** Inform users to use app regularly, consider IndexedDB for critical data
**Warning signs:** Users report losing data after vacation/break

### Pitfall 5: Missing Offline Page
**What goes wrong:** Generic browser error when offline
**Why it happens:** No fallback configured
**How to avoid:** Create `/offline` page and configure in Serwist fallbacks
**Warning signs:** "This site can't be reached" instead of graceful offline UI

### Pitfall 6: iOS Install Prompt Missing
**What goes wrong:** No "Add to Home Screen" prompt on iOS
**Why it happens:** `beforeinstallprompt` only works on Chromium browsers
**How to avoid:** Show manual instructions for iOS Safari (Share → Add to Home Screen)
**Warning signs:** Android users can install easily, iOS users confused
</common_pitfalls>

<code_examples>
## Code Examples

### TypeScript Configuration for Service Worker
```json
// tsconfig.json - add these to compilerOptions
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "types": ["@serwist/next/typings"]
  }
}
```

### Security Headers for Service Worker
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};
```

### Install Prompt Component (Chromium)
```typescript
// components/InstallPrompt.tsx
'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button onClick={async () => {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }}>
      Install App
    </button>
  );
}
```

### iOS Install Instructions Component
```typescript
// components/IOSInstallInstructions.tsx
'use client';

import { useEffect, useState } from 'react';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return ('standalone' in window.navigator) && (window.navigator as any).standalone;
}

export function IOSInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) {
      setShowInstructions(true);
    }
  }, []);

  if (!showInstructions) return null;

  return (
    <div className="ios-install-banner">
      <p>Install ALVIN: tap Share then "Add to Home Screen"</p>
      <button onClick={() => setShowInstructions(false)}>Dismiss</button>
    </div>
  );
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa | @serwist/next | 2024 | next-pwa deprecated, Serwist actively maintained |
| @ducanh2912/next-pwa | @serwist/next | 2024-2025 | ducanh2912 version now recommends Serwist |
| Pages Router SW setup | App Router app/sw.ts | Next.js 13+ | Different file location, ESM imports |
| Static manifest.json | Dynamic app/manifest.ts | Next.js 13+ | Type-safe, can use environment variables |
| Manual precache list | __SW_MANIFEST injection | Serwist default | Build-time generation, automatic updates |

**New tools/patterns to consider:**
- **Serwist defaultCache:** Next.js-optimized caching strategies out of the box
- **app/manifest.ts:** Built-in Next.js manifest with TypeScript types
- **navigationPreload:** Faster navigation when enabled in Serwist

**Deprecated/outdated:**
- **next-pwa (shadowwalker/next-pwa):** Archived, no longer maintained
- **Manual workbox-webpack-plugin:** Serwist handles this internally
- **Turbopack for PWA dev:** Not yet compatible with Serwist webpack plugins
</sota_updates>

<ios_limitations>
## iOS/Safari PWA Limitations (2026)

These are platform constraints, not implementation issues:

| Limitation | Impact | Workaround |
|------------|--------|------------|
| No beforeinstallprompt | Can't show custom install button | Manual instructions component |
| 50MB cache limit | Large assets may not cache | Prioritize critical assets |
| 7-day storage eviction | Data cleared if unused | Educate users, use regularly |
| No background sync | Can't sync when closed | Sync on next open |
| Push requires iOS 16.4+ | Older devices can't receive push | Email fallback (already have) |
| WebKit-only rendering | All browsers use Safari engine | Accept the limitation |

**Bottom line:** iOS PWA is good enough for ALVIN's use case. Push notifications work on iOS 16.4+, home screen install works, offline reading works. The 7-day eviction is the main concern for a vitality app, but users checking in daily won't hit it.
</ios_limitations>

<open_questions>
## Open Questions

1. **Turbopack timeline**
   - What we know: Serwist uses webpack, Turbopack incompatible
   - What's unclear: When Turbopack will support webpack plugins or Serwist will adapt
   - Recommendation: Use webpack build for now, monitor serwist/next.js releases

2. **PWA icons generation**
   - What we know: Need 192x192 and 512x512 at minimum
   - What's unclear: Best tool for generating all required sizes
   - Recommendation: Use favicon generator tool (real favicon generator) to create icon set
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- /serwist/serwist - Next.js integration, service worker setup, caching strategies
- /websites/nextjs - PWA guide, manifest.ts, metadata configuration
- https://serwist.pages.dev/docs/next/getting-started - Official Serwist Next.js docs
- https://nextjs.org/docs/app/guides/progressive-web-apps - Official Next.js PWA guide

### Secondary (MEDIUM confidence)
- https://github.com/shadowwalker/next-pwa/issues/241 - Deprecation confirmation
- https://www.npmjs.com/package/@ducanh2912/next-pwa - Migration recommendation to Serwist
- WebSearch ecosystem discovery (verified against official docs)

### Tertiary (LOW confidence - needs validation)
- https://firt.dev/notes/pwa-ios/ - iOS PWA compatibility reference
- WebSearch pitfalls (verify specific claims during implementation)
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js 15 App Router + Serwist
- Ecosystem: Service worker tooling, manifest generation
- Patterns: PWA setup, caching strategies, install prompts
- Pitfalls: Turbopack, Safari caching, iOS limitations

**Confidence breakdown:**
- Standard stack: HIGH - verified with Context7 and official docs
- Architecture: HIGH - from official Serwist and Next.js documentation
- Pitfalls: MEDIUM-HIGH - from WebSearch, partially verified
- Code examples: HIGH - from Context7/official sources

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - PWA ecosystem relatively stable)
</metadata>

---

*Phase: 11-pwa-foundation*
*Research completed: 2026-01-17*
*Ready for planning: yes*
