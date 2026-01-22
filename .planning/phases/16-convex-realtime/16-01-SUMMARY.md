---
phase: 16-convex-realtime
plan: 01
subsystem: realtime
tags: [convex, schema, sync, write-through, graceful-degradation]

# Dependency graph
requires: []
provides:
  - Convex schema with activities and userStatus tables
  - Query functions for real-time reads
  - Mutation functions for data writes
  - Sync utility for write-through pattern
affects: [Phase 16-02 (real-time hooks integration)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Write-through sync: Prisma as source of truth, Convex for real-time reads"
    - "Graceful degradation when NEXT_PUBLIC_CONVEX_URL not configured"
    - "Dynamic import to handle missing generated types"
    - "Error isolation: sync failures don't break primary operations"

key-files:
  created:
    - convex/schema.ts
    - convex/activities.ts
    - convex/alerts.ts
    - src/lib/convex/sync.ts
  removed:
    - convex/tasks.ts (example file)

key-decisions:
  - "Use string userId (NextAuth ID) not Convex IDs for cross-system compatibility"
  - "Indexes optimized for user-centric queries and timestamp ordering"
  - "Upsert pattern for userStatus to ensure singleton per user"
  - "Dynamic import prevents typecheck failures when generated files missing"
  - "Console warnings instead of errors for missing API (non-blocking)"

patterns-established:
  - "syncActivity/syncUserStatus for write-through sync from tRPC routers"
  - "isConvexConfigured() for feature detection"

issues-created: []

# Metrics
duration: ~10 min
completed: 2026-01-21
---

# Phase 16 Plan 1: Convex Schema & Sync Utility Summary

**Established Convex data model and write-through sync mechanism for real-time dashboard data**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-01-21
- **Tasks:** 3 (all auto)
- **Files created:** 4
- **Files removed:** 1

## Accomplishments

### Task 1: Define Convex Schema
- Created `activities` table with userId, type, description, timestamp, metadata fields
- Created `userStatus` table with userId, lastCheckIn, nextDue, alertLevel, alertTriggeredAt
- Added indexes: `by_user_timestamp`, `by_timestamp` for activities
- Added index: `by_user` for userStatus singleton lookups
- Removed example tasks table from schema

### Task 2: Create Query/Mutation Functions
- `convex/activities.ts`:
  - `getRecentActivities` query: Fetches activities by userId with configurable limit
  - `addActivity` mutation: Inserts new activity records
- `convex/alerts.ts`:
  - `getUserStatus` query: Fetches user status singleton
  - `updateUserStatus` mutation: Upserts user status (patch if exists, insert if new)
- Removed example `tasks.ts` file

### Task 3: Create Sync Utility
- Created `src/lib/convex/sync.ts` with:
  - `syncActivity()`: Syncs activity data to Convex
  - `syncUserStatus()`: Syncs user status to Convex
  - `isConvexConfigured()`: Feature detection helper
- Graceful degradation when Convex URL not configured
- Dynamic import prevents TypeScript errors when generated files missing
- Error handling ensures sync failures don't break primary operations

## Task Commits

1. **Task 1** - `fd65388` - Define Convex schema for activities and userStatus tables
2. **Task 2** - `a5bf330` - Create Convex query/mutation functions
3. **Task 3** - `9e7b83d` - Create sync utility for write-through pattern

## Files Created

| File | Purpose |
|------|---------|
| convex/schema.ts | Schema definitions for activities and userStatus |
| convex/activities.ts | Query/mutation for activity records |
| convex/alerts.ts | Query/mutation for user status |
| src/lib/convex/sync.ts | Server-side sync utility for tRPC routers |

## Verification

- [x] Schema defines activities and userStatus tables with indexes
- [x] Query functions (getRecentActivities, getUserStatus) created
- [x] Mutation functions (addActivity, updateUserStatus) created
- [x] Sync utility handles missing Convex URL gracefully
- [x] `npm run typecheck` passes (no new errors from this plan)
- [ ] `npx convex dev` acceptance (requires authentication, deferred to runtime)

## Deviations from Plan

1. **Dynamic import technique:** Added template literal indirection (`CONVEX_API_PATH`) to prevent TypeScript from statically resolving the generated API path. This is necessary because `convex/_generated/api` doesn't exist until `npx convex dev` runs, which requires authentication.

2. **Added `isConvexConfigured()` helper:** Not in original plan but useful for feature detection in consuming code.

## Pre-existing Issues

The following typecheck errors existed before this plan and are unrelated:
- `src/app/_components/post.test.tsx`: Missing exports from @testing-library/react

## Next Steps

Run `npx convex dev` to:
1. Authenticate with Convex
2. Generate `convex/_generated/api.ts` types
3. Deploy schema to Convex backend

Then proceed to Phase 16-02 to integrate real-time hooks into dashboard components.

---
*Phase: 16-convex-realtime*
*Completed: 2026-01-21*
