---
phase: 16-convex-realtime
plan: 02
subsystem: realtime
tags: [convex, real-time, subscription, sync, tRPC, dashboard]

# Dependency graph
requires:
  - phase: 16-01
    provides: Convex schema, sync utility, query/mutation functions
provides:
  - Real-time activity log via Convex subscriptions
  - Write-through sync on check-in operations
  - Write-through sync on alert operations
  - Graceful tRPC fallback when Convex not configured
affects: [Phase 16-03 (status component integration)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useConvexQuery with 'skip' for conditional subscriptions"
    - "Try/catch require() for optional module imports in client components"
    - "Environment-based feature detection (NEXT_PUBLIC_CONVEX_URL)"
    - "Data mapping from Convex format (number timestamps) to UI format"

key-files:
  created: []
  modified:
    - src/server/api/routers/checkin.ts
    - src/server/api/routers/alert.ts
    - src/app/dashboard/activity-log.tsx

key-decisions:
  - "Use require() with try/catch for Convex API import to handle missing generated files"
  - "Check NEXT_PUBLIC_CONVEX_URL at runtime for feature detection"
  - "Map Convex timestamps (numbers) to Date objects in activity log"

patterns-established:
  - "Convex subscription with tRPC fallback pattern for gradual migration"
  - "Non-critical sync calls wrapped in try/catch to prevent main operation failures"

issues-created: []

# Metrics
duration: ~7 min
completed: 2026-01-22
---

# Phase 16 Plan 2: Real-time Dashboard Integration Summary

**Convex real-time subscriptions integrated into activity log with write-through sync on check-ins and alerts**

## Performance

- **Duration:** ~7 min
- **Completed:** 2026-01-22
- **Tasks:** 3 (all auto)
- **Files modified:** 3

## Accomplishments

### Task 1: Sync Calls in Check-in Router
- Added syncActivity call after successful check-in with description "Manual check-in completed"
- Added syncUserStatus call with lastCheckIn, nextDue, and alertLevel: null
- All sync calls wrapped in try/catch for graceful failure handling

### Task 2: Sync Calls in Alert Router
- Added sync calls to `create` mutation: syncs "Alert triggered at Level 1" + L1 status
- Added sync calls to `escalate` mutation: syncs escalation message + updated level
- Added sync calls to `cancel` mutation: syncs "Alert cancelled" + null level/triggeredAt
- Includes level mapping from Prisma format (LEVEL_X) to Convex format (LX)

### Task 3: Convex Real-time Activity Log
- Added useConvexQuery subscription to getRecentActivities
- Implemented conditional query with "skip" when Convex not configured or no user session
- Added tRPC fallback when NEXT_PUBLIC_CONVEX_URL not set
- Mapped Convex data format (number timestamps, _id) to UI format (Date timestamps, id)
- Smart loading state detection for both Convex and tRPC paths

## Task Commits

1. **Task 1** - `0d3341a` - feat(16-02): add Convex sync calls to check-in router
2. **Task 2** - `d2f8804` - feat(16-02): add Convex sync calls to alert router
3. **Task 3** - `57feb15` - feat(16-02): add Convex real-time subscription to activity log
4. **Bugfix** - `0944be4` - fix(16-02): correct v.null_() to v.null() in Convex validators

## Files Modified

| File | Purpose |
|------|---------|
| src/server/api/routers/checkin.ts | Added Convex sync after check-in operations |
| src/server/api/routers/alert.ts | Added Convex sync after alert create/escalate/cancel |
| src/app/dashboard/activity-log.tsx | Real-time Convex subscription with tRPC fallback |
| convex/alerts.ts | Fixed v.null_() → v.null() validator syntax |
| convex/schema.ts | Fixed v.null_() → v.null() validator syntax |

## Decisions Made

1. **Runtime feature detection:** Check `NEXT_PUBLIC_CONVEX_URL` environment variable to determine if Convex is available, rather than compile-time detection
2. **Try/catch require():** Use try/catch around require() for Convex API import to handle case where generated files don't exist yet
3. **Data mapping layer:** Transform Convex document format (number timestamps, _id) to match existing UI expectations (Date timestamps, id)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Convex validator syntax**
- **Found during:** Session start when running `npx convex dev`
- **Issue:** Used `v.null_()` instead of `v.null()` - Convex validators don't use underscore suffix
- **Fix:** Changed to `v.null()` in both convex/schema.ts and convex/alerts.ts
- **Files modified:** convex/alerts.ts:35, convex/schema.ts:31
- **Verification:** `npx convex dev` now starts successfully
- **Commit:** 0944be4

---

**Total deviations:** 1 auto-fixed (bug)
**Impact on plan:** Bug fix was necessary for Convex to function. No scope creep.

## Pre-existing Issues

The following typecheck errors existed before this plan and are unrelated:
- `src/app/_components/post.test.tsx`: Missing exports from @testing-library/react

## Verification

- [x] `npm run typecheck` - passes (except pre-existing test file issue)
- [x] Check-in syncs activity + status to Convex
- [x] Alert changes sync to Convex
- [x] Activity log renders with real-time data (when Convex configured)
- [x] Activity log falls back to tRPC (when Convex not configured)

## Next Steps

Proceed to Phase 16-03 to integrate Convex real-time subscriptions into the user status component.

---
*Phase: 16-convex-realtime*
*Completed: 2026-01-22*
