---
phase: 13-offline-caching
plan: 01
status: complete
completed: 2026-01-21
---

## Summary

Implemented view-only offline mode with cached activity history and clear offline indication.

## What Was Built

1. **ALVIN-specific caching rules** (`src/app/sw.ts`)
   - StaleWhileRevalidate strategy for dashboard tRPC endpoints
   - 7-day cache retention for activity history
   - Cache name: `alvin-dashboard-data`
   - Max 50 entries

2. **OfflineIndicator component** (`src/components/offline/`)
   - Client component using `navigator.onLine` and online/offline events
   - Fixed amber banner at top of viewport when offline
   - Text: "You're offline — viewing cached data"
   - Accessible with `role="alert"`

3. **Dashboard integration** (`src/app/dashboard/page.tsx`)
   - OfflineIndicator rendered at top of HydrateClient
   - Shows only when user is disconnected

## Technical Decisions

- **StaleWhileRevalidate** chosen over NetworkFirst for better offline UX (shows cached data immediately)
- **7-day expiration** balances freshness with offline availability
- **Amber color** (not red) indicates informational state, not error
- **Non-dismissible banner** ensures users always know when viewing stale data

## Verification

- [x] `npm run build` succeeds
- [x] Service worker has alvinCache rules before defaultCache
- [x] OfflineIndicator component exports correctly
- [x] Dashboard includes offline indicator
- [ ] Manual offline test (skipped)

## Dependencies Fixed During Build

- Added `@crayonai/react-core`, `zustand`, `@crayonai/stream` (peer deps for thesys SDK)
- Made ConvexClientProvider conditional (skips if URL not configured)
- Fixed `@/` → `~/` path alias in layout.tsx
- Excluded `design-os/` and `convex/` from tsconfig

## Next

Phase 14: SMS Notifications (Twilio integration)
