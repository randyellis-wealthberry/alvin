# Phase 1: Database Schema - Research

**Researched:** 2026-01-16
**Domain:** Prisma 6.x schema design for check-in/alert notification system
**Confidence:** HIGH

<research_summary>
## Summary

Researched Prisma 6.x patterns for ALVIN's "dead man's switch" schema: user profiles with check-in schedules, family contacts with priority ordering, check-in records, and escalating alerts with 4-level state progression.

Key findings:
1. **SQLite limitations** - No native enums (use String with comments for typing), no JSON arrays, DateTime stored as ISO 8601 strings
2. **Cascade deletes** - Use `onDelete: Cascade` for contacts/check-ins when user is deleted, but alerts need careful handling
3. **Schedule storage** - Store frequency as interval integer + unit enum pattern, not cron expressions (simpler for v1)
4. **Alert state machine** - Model as enum with level progression (LEVEL_1 through LEVEL_4), not complex state machine library

**Primary recommendation:** Keep schema simple - SQLite-compatible patterns, soft deletes for alerts (never lose audit trail), and store scheduling as simple fields rather than complex cron expressions.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @prisma/client | 6.6.0 | ORM queries | Already in codebase, type-safe |
| prisma | 6.6.0 | Schema/migrations | Already in codebase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cuid2 | 2.x | ID generation | Default in schema, collision-resistant |
| date-fns | 3.x | Date calculations | Calculating next check-in due |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| String enums | Native enums | SQLite doesn't support native enums, String is compatible |
| JSON schedule | Separate fields | JSON not queryable in SQLite, separate fields more flexible |
| Soft delete | Hard delete | Keep alerts forever for audit, soft delete users/contacts |

**Installation:**
```bash
# Already installed in project
npm install date-fns  # If not present
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Schema Structure
```
prisma/schema.prisma
├── User (existing - NextAuth)
├── UserProfile (new - extends User with ALVIN settings)
├── Contact (new - family contacts)
├── CheckIn (new - check-in records)
└── Alert (new - escalation state)
```

### Pattern 1: Extending User with Profile
**What:** Don't modify the NextAuth User model; create a separate UserProfile that references it
**When to use:** Adding app-specific fields to auth users
**Example:**
```prisma
// Source: T3 Stack pattern - separate concerns
model UserProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // ALVIN-specific fields
  checkInFrequencyHours Int      @default(24)
  preferredCheckInTime  String?  // "09:00" format
  timezone              String   @default("UTC")
  isActive              Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Pattern 2: Contact Priority with Order Field
**What:** Use integer `order` field for contact notification priority, not complex sorting
**When to use:** When contacts need explicit ordering (primary contact first)
**Example:**
```prisma
// Source: Redgate recurring events pattern
model Contact {
  id           String  @id @default(cuid())
  userProfile  UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
  userProfileId String

  name         String
  email        String
  phone        String?
  relationship String?  // "spouse", "child", "friend", etc.

  // Priority: lower = notified first (1 = primary)
  priority     Int     @default(999)

  // Notification preferences
  notifyByEmail Boolean @default(true)
  notifyBySms   Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userProfileId, priority])
}
```

### Pattern 3: Alert State as Enum Levels
**What:** Model escalation as discrete levels, not complex state machine
**When to use:** Linear progression (Level 1 → 2 → 3 → 4)
**Example:**
```prisma
// Source: Prisma docs - enum patterns
// Note: SQLite uses String, but comment provides typing
model Alert {
  id            String @id @default(cuid())
  userProfile   UserProfile @relation(fields: [userProfileId], references: [id])
  userProfileId String

  // String enum for SQLite compatibility
  // Valid values: LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, CANCELLED, RESOLVED
  level         String @default("LEVEL_1")

  triggeredAt   DateTime @default(now())
  lastEscalatedAt DateTime?
  resolvedAt    DateTime?
  cancelledAt   DateTime?

  // Audit fields
  cancelReason  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userProfileId, level])
}
```

### Anti-Patterns to Avoid
- **Storing cron expressions for v1:** Overkill - simple frequency + preferred time is sufficient
- **Using native enums with SQLite:** Will fail - use String with documented values
- **Hard deleting alerts:** Lose audit trail - use resolvedAt/cancelledAt timestamps instead
- **Complex state machine library:** XState is overkill for linear 4-level progression
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ID generation | Custom UUID logic | `@default(cuid())` | Prisma's cuid() is collision-resistant |
| Timestamp handling | Manual Date.now() | `@default(now())`, `@updatedAt` | Prisma handles timezone-safe timestamps |
| Cascade deletes | Manual cleanup queries | `onDelete: Cascade` | Database enforces referential integrity |
| Order/priority | Complex sorting logic | Integer `priority` field with index | Simple, queryable, reorderable |

**Key insight:** Prisma 6.x handles most complexity. The schema should be declarative - business logic lives in tRPC routers, not in the database layer.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: SQLite Enum Limitations
**What goes wrong:** Schema fails with "Enums are not supported" error
**Why it happens:** SQLite doesn't support native SQL enums
**How to avoid:** Use String fields with documented valid values in comments
**Warning signs:** Prisma migrate fails immediately on SQLite

### Pitfall 2: DateTime Timezone Confusion
**What goes wrong:** Check-in times appear at wrong hours for users
**Why it happens:** Storing times without timezone context
**How to avoid:** Store user's timezone separately, store all DateTimes as UTC, convert on display
**Warning signs:** Users report reminders at 3am instead of 9am

### Pitfall 3: Cascade Delete Destroying Audit Trail
**What goes wrong:** User deletes account, all alert history vanishes
**Why it happens:** `onDelete: Cascade` on Alert relation
**How to avoid:** Don't cascade delete Alerts - use `onDelete: SetNull` or soft delete user instead
**Warning signs:** Compliance/audit requirements mentioning "data retention"

### Pitfall 4: Contact Priority Gaps
**What goes wrong:** After deleting contact #2, priorities become 1, 3, 4 (gap)
**Why it happens:** Not renumbering on delete
**How to avoid:** Either accept gaps (query with ORDER BY priority) or renumber on delete
**Warning signs:** UI showing "weird" ordering after contact removal
</common_pitfalls>

<code_examples>
## Code Examples

### Complete ALVIN Schema Addition
```prisma
// Source: Verified Prisma 6.x patterns + project requirements

// ======================
// ALVIN EXTENSION MODELS
// ======================

model UserProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Check-in schedule
  checkInFrequencyHours Int      @default(24)    // How often user should check in
  preferredCheckInTime  String?                   // "HH:MM" format, e.g., "09:00"
  timezone              String   @default("UTC")

  // Status
  isActive              Boolean  @default(true)
  lastCheckInAt         DateTime?
  nextCheckInDue        DateTime?

  // Relations
  contacts              Contact[]
  checkIns              CheckIn[]
  alerts                Alert[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Contact {
  id            String      @id @default(cuid())
  userProfile   UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
  userProfileId String

  name          String
  email         String
  phone         String?
  relationship  String?     // "spouse", "child", "sibling", "friend", "other"

  // Notification settings
  priority      Int         @default(999)  // Lower = higher priority
  notifyByEmail Boolean     @default(true)
  notifyBySms   Boolean     @default(false)

  // Soft delete
  deletedAt     DateTime?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userProfileId, priority])
  @@index([userProfileId, deletedAt])
}

model CheckIn {
  id            String      @id @default(cuid())
  userProfile   UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Cascade)
  userProfileId String

  // Check-in method
  // Values: "MANUAL", "BIOMETRIC"
  method        String      @default("MANUAL")

  // Device info (optional)
  deviceInfo    String?
  ipAddress     String?

  performedAt   DateTime    @default(now())

  @@index([userProfileId, performedAt])
}

model Alert {
  id              String      @id @default(cuid())
  userProfile     UserProfile @relation(fields: [userProfileId], references: [id])
  userProfileId   String

  // Escalation level
  // Values: "LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "CANCELLED", "RESOLVED"
  level           String      @default("LEVEL_1")

  // Timing
  triggeredAt     DateTime    @default(now())
  lastEscalatedAt DateTime?

  // Resolution
  resolvedAt      DateTime?   // User checked in
  cancelledAt     DateTime?   // User manually cancelled
  cancelReason    String?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([userProfileId, level])
  @@index([level, triggeredAt])
}
```

### Update User Model for Relation
```prisma
// Add to existing User model
model User {
  // ... existing fields ...

  // Add ALVIN profile relation
  profile UserProfile?
}
```

### Type Definitions for String Enums
```typescript
// src/types/alvin.ts
// TypeScript types to enforce String enum values

export const AlertLevel = {
  LEVEL_1: "LEVEL_1",
  LEVEL_2: "LEVEL_2",
  LEVEL_3: "LEVEL_3",
  LEVEL_4: "LEVEL_4",
  CANCELLED: "CANCELLED",
  RESOLVED: "RESOLVED",
} as const;

export type AlertLevel = (typeof AlertLevel)[keyof typeof AlertLevel];

export const CheckInMethod = {
  MANUAL: "MANUAL",
  BIOMETRIC: "BIOMETRIC",
} as const;

export type CheckInMethod = (typeof CheckInMethod)[keyof typeof CheckInMethod];
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@prisma/client` from node_modules | Custom output path | Prisma 5+ | Use `output = "../generated/prisma"` (already configured) |
| MySQL/PostgreSQL enums everywhere | String for SQLite compatibility | Ongoing | SQLite dev → PostgreSQL prod pattern common |
| Complex cron libraries | Simple interval + time | T3 patterns | Simpler for v1, can upgrade later |

**New tools/patterns to consider:**
- **Prisma Postgres** (hosted): Could simplify production deployment, but not needed for v1
- **`@updatedAt` directive**: Automatically updates timestamp on any change

**Deprecated/outdated:**
- **Direct imports from `@prisma/client/runtime`**: Use `Prisma` namespace instead (Prisma 5+)
- **`findUnique` without select**: Always select only needed fields for performance
</sota_updates>

<open_questions>
## Open Questions

1. **Alert retention policy**
   - What we know: Alerts should be kept for audit purposes
   - What's unclear: How long? Forever? 1 year?
   - Recommendation: Keep forever for v1, add cleanup job in v2 if needed

2. **Contact soft delete behavior**
   - What we know: Soft delete preserves data
   - What's unclear: Should soft-deleted contacts still receive alerts if deleted during an active escalation?
   - Recommendation: No - query excludes `deletedAt IS NOT NULL`, active escalations continue to next contact

3. **Multiple active alerts**
   - What we know: User might miss check-in, check in, then miss again
   - What's unclear: Can user have multiple simultaneous active alerts?
   - Recommendation: No - resolve existing alert before creating new one
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `/prisma/docs` via Context7 - schema patterns, relations, enums, cascades
- Existing project `prisma/schema.prisma` - established patterns, version 6.6.0 confirmed

### Secondary (MEDIUM confidence)
- [Redgate: Managing Recurring Events](https://www.red-gate.com/blog/again-and-again-managing-recurring-events-in-a-data-model) - schedule pattern inspiration
- [Medium: Recurring Calendar Events Database Design](https://medium.com/@aureliadotlim/recurring-calendar-events-database-design-dc872fb4f2b5) - interval storage pattern
- [Bytebase: Top 10 Database Schema Design Best Practices](https://www.bytebase.com/blog/top-database-schema-design-best-practices/) - general patterns

### Tertiary (LOW confidence - needs validation)
- None - all critical patterns verified against Prisma docs
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Prisma 6.6.0 with SQLite
- Ecosystem: cuid2 IDs, date-fns for calculations
- Patterns: User profile extension, contact priority, alert state enum
- Pitfalls: SQLite enums, timezone handling, cascade deletes, priority gaps

**Confidence breakdown:**
- Standard stack: HIGH - verified in existing codebase
- Architecture: HIGH - patterns from Prisma docs
- Pitfalls: HIGH - documented SQLite limitations
- Code examples: HIGH - tested Prisma 6.x syntax

**Research date:** 2026-01-16
**Valid until:** 2026-02-16 (30 days - Prisma stable, patterns established)
</metadata>

---

*Phase: 01-database-schema*
*Research completed: 2026-01-16*
*Ready for planning: yes*
