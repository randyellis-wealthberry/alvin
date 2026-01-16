# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**Missing Error Handling in Mutations:**
- Issue: `createPost` mutation has no `onError` callback
- File: `src/app/_components/post.tsx` (lines 12-17)
- Why: Starter template focuses on happy path
- Impact: Users get no feedback when form submission fails
- Fix approach: Add `onError` callback to display error toast/message

**Console Logging in Production:**
- Issue: tRPC timing middleware logs unconditionally
- File: `src/server/api/trpc.ts` (line 99)
- Why: Development debugging left in place
- Impact: Pollutes production logs, minor performance impact
- Fix approach: Gate with `if (env.NODE_ENV === "development")`

**Commented Role Implementation:**
- Issue: Custom user role field is commented out
- File: `src/server/auth/config.ts` (lines 18-25)
- Why: Template placeholder for future implementation
- Impact: Confusing for new developers
- Fix approach: Either implement role-based auth or remove comments

## Known Bugs

**None detected** - Clean T3 starter template

## Security Considerations

**NextAuth Beta Version:**
- Risk: Using `next-auth@5.0.0-beta.25` in production-ready template
- File: `package.json` (line 32)
- Current mitigation: None - beta version in use
- Recommendations: Monitor for stable v5 release, test thoroughly before production

**AUTH_SECRET Development Behavior:**
- Risk: `AUTH_SECRET` optional in development, silent failure risk in production
- File: `src/env.js` (lines 10-13)
- Current mitigation: Zod validation in production mode
- Recommendations: Add `.env.example` documenting required production vars

**No Rate Limiting:**
- Risk: API endpoints have no rate limiting
- File: `src/app/api/trpc/[trpc]/route.ts`
- Current mitigation: None
- Recommendations: Add rate limiting middleware for production

## Performance Bottlenecks

**No current bottlenecks detected** - Small codebase with simple queries

**Potential Future Issues:**
- `getLatest` query without pagination could scale poorly
- No caching layer for frequently accessed data
- React Query stale time (30s) may cause unnecessary refetches

## Fragile Areas

**tRPC Context Creation:**
- File: `src/server/api/trpc.ts`
- Why fragile: Session retrieval on every request
- Common failures: Auth misconfiguration breaks all protected routes
- Safe modification: Add tests before changing auth logic
- Test coverage: None

**Environment Validation:**
- File: `src/env.js`
- Why fragile: Missing vars cause startup failure
- Common failures: Missing `DATABASE_URL` in new environments
- Safe modification: Add `.env.example` for documentation
- Test coverage: None

## Scaling Limits

**SQLite Database:**
- Current capacity: Single-user development only
- Limit: Concurrent writes, file-based storage
- Symptoms at limit: Database lock errors, slow writes
- Scaling path: Switch to PostgreSQL/MySQL for production

## Dependencies at Risk

**next-auth (beta):**
- Risk: Beta version may have breaking changes
- Impact: Auth system could break on updates
- Migration plan: Monitor for v5 stable, pin version until migration

**React 19:**
- Risk: Relatively new major version
- Impact: Some third-party libs may not be compatible
- Migration plan: Already on React 19, monitor ecosystem

## Missing Critical Features

**Error Boundary:**
- Problem: No `error.tsx` for graceful error handling
- Current workaround: Users see white screen on errors
- Blocks: Production readiness
- Implementation complexity: Low

**Client-Side Validation:**
- Problem: Form inputs have no client-side validation
- File: `src/app/_components/post.tsx`
- Current workaround: Server validates, but poor UX
- Blocks: Good user experience
- Implementation complexity: Low

**Environment Documentation:**
- Problem: No `.env.example` file
- Current workaround: Developers read `src/env.js` to find required vars
- Blocks: Smooth onboarding
- Implementation complexity: Trivial

## Test Coverage Gaps

**Everything:**
- What's not tested: Entire codebase (no tests configured)
- Risk: Any change could break functionality unnoticed
- Priority: High
- Difficulty to test: Low - standard tRPC/Next.js testing patterns exist

**Critical Paths (if tests added):**
1. `protectedProcedure` authorization logic
2. Post CRUD operations
3. Session callback modifications
4. Environment validation

## Recommendations Summary

**Before Production:**
1. Add error handling to mutations (high priority)
2. Create `.env.example` file (high priority)
3. Add `error.tsx` error boundary (medium priority)
4. Gate console.log behind dev check (medium priority)
5. Set up basic test coverage (medium priority)

**Nice to Have:**
6. Remove commented role implementation or implement it
7. Add rate limiting
8. Switch to stable NextAuth when available
9. Add client-side form validation

---

*Concerns audit: 2026-01-16*
*Update as issues are fixed or new ones discovered*
