# 11-01 Summary: PWA Core Infrastructure

**Completed:** 2026-01-17
**Duration:** ~30 minutes execution
**Status:** Complete

## What Was Built

Set up core PWA infrastructure with Serwist service worker and Next.js manifest, enabling ALVIN to be installed as a native-like mobile app.

## Tasks Completed

### Task 1: Install Serwist dependencies and update TypeScript config
- Installed `@serwist/next@9.5.0` and `serwist@9.5.0`
- Updated tsconfig.json:
  - Added "webworker" to lib array
  - Added "@serwist/next/typings" to types array
  - Added "public/sw.js" to exclude array (build artifact)

### Task 2: Create service worker and configure Next.js build
- Deleted next.config.js, created next.config.mjs with Serwist wrapper
- Created src/app/sw.ts with:
  - Precaching with `__SW_MANIFEST` injection
  - Runtime caching via `defaultCache`
  - Offline fallback for document requests
  - Navigation preload enabled
- Added `dev:pwa` script for Turbopack-free PWA testing
- Updated .gitignore to exclude generated sw.js files

### Task 3: Create PWA manifest and update layout metadata
- Created src/app/manifest.ts with ALVIN branding:
  - App name, description, theme colors
  - Icon configuration (192x192, 512x512, apple-touch)
  - Standalone display mode, portrait orientation
- Updated layout.tsx:
  - ALVIN title with template pattern
  - Apple Web App configuration
  - Viewport with theme color
  - formatDetection disabled for telephone

## Verification

- [x] `npm run build` succeeds without errors
- [x] `public/sw.js` generated after build (161KB)
- [x] `npm run typecheck` passes
- [x] Manifest route at /manifest.webmanifest in build output

## Files Modified

| File | Change |
|------|--------|
| package.json | Added @serwist/next, serwist deps; dev:pwa script |
| package-lock.json | Updated with new dependencies |
| tsconfig.json | Added webworker lib, serwist types, exclude sw.js |
| next.config.js | DELETED |
| next.config.mjs | NEW - Serwist wrapper configuration |
| src/app/sw.ts | NEW - Service worker source |
| src/app/manifest.ts | NEW - PWA manifest with ALVIN branding |
| src/app/layout.tsx | Updated metadata and viewport exports |
| .gitignore | Added public/sw.js exclusion |

## Commits

1. `2a88450` feat(11-01): install Serwist dependencies and update TypeScript config
2. `e4569b5` feat(11-01): create service worker and configure Next.js build
3. `4ee58ed` feat(11-01): create PWA manifest and update layout metadata

## Notes

- Service worker is disabled in development mode (Turbopack incompatible)
- Use `npm run dev:pwa` to test PWA features during development
- Large JS chunk (2.26 MB) not precached - this is expected for Thesys/AI SDK
- Existing ESLint warning in activity-log.tsx (unused function) - not related to this plan

## Next Steps

- Create placeholder PWA icons (icon-192x192.png, icon-512x512.png, apple-touch-icon.png)
- Create /offline page for graceful offline experience
- Add install prompt component for Chromium browsers
- Add iOS install instructions component
