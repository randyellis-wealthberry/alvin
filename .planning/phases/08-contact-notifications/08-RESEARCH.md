# Phase 8: Contact Notifications - Research

**Researched:** 2026-01-17
**Domain:** Transactional email notifications to family contacts
**Confidence:** HIGH

<research_summary>
## Summary

Researched patterns for sending alert notifications to family contacts at escalation levels 3 and 4. The infrastructure is already established from Phase 6 (Resend + React Email), making this primarily an integration task rather than new technology adoption.

Key finding: Resend provides a batch API (`resend.batch.send()`) that can send up to 100 emails in a single request—ideal for L4 when notifying all contacts. Webhooks are available for delivery tracking if needed, but for MVP, simple success/failure logging is sufficient.

**Primary recommendation:** Extend the existing escalation cron to trigger notifications at L3/L4 transitions. Use single send for L3 (primary contact only), batch send for L4 (all contacts). Create urgency-appropriate email templates that clearly communicate the situation without causing unnecessary panic.
</research_summary>

<standard_stack>
## Standard Stack

### Already Integrated (from Phase 6)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| resend | latest | Email API | Configured in src/app/api/cron/reminders/route.ts |
| @react-email/components | latest | Email templates | Used in src/emails/ReminderEmail.tsx |

### No Additional Libraries Required

The existing stack fully supports Phase 8 requirements:
- Resend client initialized with `RESEND_API_KEY`
- React Email components for template rendering
- Cron endpoint pattern with `CRON_SECRET` security

### Resend Features to Use

| Feature | Purpose | When |
|---------|---------|------|
| `resend.emails.send()` | Single email | L3 - primary contact only |
| `resend.batch.send()` | Batch up to 100 | L4 - all contacts |
| Tags | Tracking/filtering | `{ name: "alert_id", value: alertId }` |

**Note:** Attachments and scheduled_at are NOT supported in batch sends, but not needed for alert notifications.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Integration Point

Extend the existing escalation cron (`src/app/api/cron/escalation/route.ts`) to send notifications when alerts transition to L3 or L4.

```
Escalation Cron Flow:
1. Find alerts needing escalation
2. For each alert:
   a. Update level in database
   b. IF new level is L3 → notify primary contact
   c. IF new level is L4 → notify all contacts (batch)
3. Return summary
```

### Pattern 1: Notification on Escalation Transition

**What:** Send notifications immediately after level transition, within the same cron execution
**When to use:** Always—notifications are tightly coupled to escalation events
**Rationale:**
- Ensures notifications are only sent once per level transition
- Atomic: if cron fails mid-execution, re-run will correctly skip already-escalated alerts
- Simpler than separate notification cron

```typescript
// In escalation cron after updating alert level
if (newLevel === "LEVEL_3") {
  await notifyPrimaryContact(alert, profile, contacts);
} else if (newLevel === "LEVEL_4") {
  await notifyAllContacts(alert, profile, contacts);
}
```

### Pattern 2: Contact Priority for L3

**What:** At L3, notify only the contact with the lowest priority number
**Why:** The Contact model has `priority: Int @default(999)` where lower = higher priority
**Implementation:**

```typescript
const primaryContact = contacts
  .filter(c => c.deletedAt === null && c.notifyByEmail)
  .sort((a, b) => a.priority - b.priority)[0];
```

### Pattern 3: Batch Send for L4

**What:** Use Resend batch API to send to all contacts in one request
**Why:** More efficient than sequential sends, rate-limit friendly
**Limit:** Up to 100 emails per batch (ALVIN likely has <10 contacts per user)

```typescript
const emails = contacts
  .filter(c => c.deletedAt === null && c.notifyByEmail)
  .map(contact => ({
    from: "ALVIN Alert <alerts@resend.dev>",
    to: contact.email,
    subject: `Urgent: [User] needs your attention`,
    react: ContactAlertEmail({ ... }),
    tags: [{ name: "alert_id", value: alertId }],
  }));

await resend.batch.send(emails);
```

### Project Structure Addition

```
src/
├── emails/
│   ├── ReminderEmail.tsx           # Existing (Phase 6)
│   └── ContactAlertEmail.tsx       # NEW: Alert notification template
└── lib/
    └── alerts/
        ├── escalation.ts           # Existing (Phase 7)
        └── notifications.ts        # NEW: Contact notification logic
```

### Anti-Patterns to Avoid

- **Separate notification cron:** Creates race conditions, potential duplicate sends
- **Polling for notification status:** Use Resend webhooks if tracking is needed
- **Hardcoding email addresses:** Always filter by deletedAt and notifyByEmail
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Batch email sending | Loop with individual sends | `resend.batch.send()` | Rate limiting, performance, atomic operation |
| Delivery tracking | Custom polling/status table | Resend webhooks (optional) | Resend handles retries, status is authoritative |
| Email templating | Raw HTML strings | React Email components | Maintainable, type-safe, consistent styling |
| Contact filtering | Manual array manipulation | Prisma query with WHERE | Database-level filtering is faster, less error-prone |
| Duplicate prevention | Custom "notification sent" flag | Rely on escalation level | Alert can only be at L3/L4 once—natural deduplication |

**Key insight:** The existing infrastructure handles the hard parts. Phase 8 is integration work—connecting escalation events to notification sending using established patterns.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Notifying Deleted Contacts
**What goes wrong:** Sending emails to soft-deleted contacts
**Why it happens:** Forgetting to filter by `deletedAt IS NULL`
**How to avoid:** Always include `.filter(c => c.deletedAt === null)` or Prisma WHERE clause
**Warning signs:** Emails to contacts that user removed

### Pitfall 2: Empty Contact Lists
**What goes wrong:** Crash or error when user has no contacts
**Why it happens:** Not handling edge case of zero contacts
**How to avoid:** Guard clause: `if (contacts.length === 0) return;`
**Warning signs:** Unhandled exceptions in cron logs

### Pitfall 3: Missing Email Addresses
**What goes wrong:** Resend rejects request with empty/invalid email
**Why it happens:** Contact has email field but it could be empty in edge cases
**How to avoid:** Filter: `.filter(c => c.email && c.notifyByEmail)`
**Warning signs:** Resend API errors

### Pitfall 4: Duplicate Notifications
**What goes wrong:** Contact receives multiple emails for same alert level
**Why it happens:** Cron runs while previous execution still processing
**How to avoid:**
- Update level in DB BEFORE sending notification
- Use transaction if atomicity is critical
- The escalation cron already prevents this via time-based threshold checks
**Warning signs:** Multiple identical emails to same contact

### Pitfall 5: Alarming Email Tone
**What goes wrong:** Email causes panic in family contacts
**Why it happens:** Template is too urgent/scary when situation may be benign
**How to avoid:**
- L3 (primary only): "We haven't heard from [Name]" - concerned but not alarming
- L4 (all contacts): "Please attempt to contact [Name]" - more urgent but factual
- Include context (how long since last check-in, what they can do)
**Warning signs:** Support requests about alarming emails
</common_pitfalls>

<code_examples>
## Code Examples

### L3 Notification (Primary Contact)

```typescript
// Source: Adapted from Phase 6 reminder pattern + Resend docs
async function notifyPrimaryContact(
  alert: Alert,
  profile: UserProfile & { user: User },
  contacts: Contact[]
): Promise<{ success: boolean; email?: string; error?: string }> {
  const primaryContact = contacts
    .filter(c => c.deletedAt === null && c.notifyByEmail && c.email)
    .sort((a, b) => a.priority - b.priority)[0];

  if (!primaryContact) {
    console.log(`[Alert ${alert.id}] No primary contact to notify`);
    return { success: false, error: "No eligible contact" };
  }

  const { error } = await resend.emails.send({
    from: "ALVIN Alert <alerts@resend.dev>",
    to: primaryContact.email,
    subject: `We haven't heard from ${profile.user.name ?? "your loved one"}`,
    react: ContactAlertEmail({
      contactName: primaryContact.name,
      userName: profile.user.name ?? "User",
      alertLevel: "L3",
      lastCheckIn: formatLastCheckIn(profile.lastCheckInAt),
    }),
    tags: [
      { name: "alert_id", value: alert.id },
      { name: "level", value: "LEVEL_3" },
    ],
  });

  if (error) {
    console.error(`[Alert ${alert.id}] Failed to notify ${primaryContact.email}:`, error);
    return { success: false, email: primaryContact.email, error: error.message };
  }

  console.log(`[Alert ${alert.id}] Notified primary contact: ${primaryContact.email}`);
  return { success: true, email: primaryContact.email };
}
```

### L4 Notification (All Contacts - Batch)

```typescript
// Source: Resend batch API docs
async function notifyAllContacts(
  alert: Alert,
  profile: UserProfile & { user: User },
  contacts: Contact[]
): Promise<{ sent: number; failed: number }> {
  const eligibleContacts = contacts.filter(
    c => c.deletedAt === null && c.notifyByEmail && c.email
  );

  if (eligibleContacts.length === 0) {
    console.log(`[Alert ${alert.id}] No contacts to notify for L4`);
    return { sent: 0, failed: 0 };
  }

  const emails = eligibleContacts.map(contact => ({
    from: "ALVIN Alert <alerts@resend.dev>",
    to: contact.email,
    subject: `Urgent: Please contact ${profile.user.name ?? "your loved one"}`,
    react: ContactAlertEmail({
      contactName: contact.name,
      userName: profile.user.name ?? "User",
      alertLevel: "L4",
      lastCheckIn: formatLastCheckIn(profile.lastCheckInAt),
    }),
    tags: [
      { name: "alert_id", value: alert.id },
      { name: "level", value: "LEVEL_4" },
    ],
  }));

  const { data, error } = await resend.batch.send(emails);

  if (error) {
    console.error(`[Alert ${alert.id}] Batch send failed:`, error);
    return { sent: 0, failed: eligibleContacts.length };
  }

  console.log(`[Alert ${alert.id}] Notified ${eligibleContacts.length} contacts`);
  return { sent: eligibleContacts.length, failed: 0 };
}
```

### Email Template Structure

```tsx
// src/emails/ContactAlertEmail.tsx
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text,
} from "@react-email/components";

export interface ContactAlertEmailProps {
  contactName: string;
  userName: string;
  alertLevel: "L3" | "L4";
  lastCheckIn: string;
}

export function ContactAlertEmail({
  contactName,
  userName,
  alertLevel,
  lastCheckIn,
}: ContactAlertEmailProps) {
  const isUrgent = alertLevel === "L4";

  return (
    <Html>
      <Head />
      <Preview>
        {isUrgent
          ? `Urgent: Please contact ${userName}`
          : `We haven't heard from ${userName}`
        }
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>
            {isUrgent ? "Urgent Alert" : "Wellness Check Request"}
          </Heading>

          <Text style={paragraphStyle}>
            Hello {contactName},
          </Text>

          <Text style={paragraphStyle}>
            {isUrgent
              ? `We haven't been able to reach ${userName} for an extended period. Their last check-in was ${lastCheckIn}.`
              : `We haven't heard from ${userName} in a while. Their last check-in was ${lastCheckIn}.`
            }
          </Text>

          <Text style={paragraphStyle}>
            {isUrgent
              ? "Please attempt to contact them as soon as possible to ensure they are okay."
              : "If you have a chance, please check in with them to make sure everything is alright."
            }
          </Text>

          {/* ... footer with ALVIN explanation ... */}
        </Container>
      </Body>
    </Html>
  );
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SendGrid/Mailgun | Resend | 2023+ | Better DX, React Email native support |
| HTML string templates | React Email | 2023+ | Type-safe, maintainable, testable |
| Individual API calls | Batch API | Standard | 100x efficiency for bulk sends |

**Already using current approaches:**
- Resend is already integrated (Phase 6)
- React Email templates already in use
- Batch API available and documented

**No deprecated patterns detected** in existing implementation.
</sota_updates>

<open_questions>
## Open Questions

1. **Should we track notification delivery status?**
   - What we know: Resend webhooks can report delivery status
   - What's unclear: Whether ALVIN needs this for MVP
   - Recommendation: Skip for v1—simple success/failure logging is sufficient. Can add webhook endpoint later if delivery tracking becomes a requirement.

2. **What happens if batch send partially fails?**
   - What we know: Resend batch API returns success if request accepted
   - What's unclear: How individual failures within batch are reported
   - Recommendation: Log batch result, trust Resend's retry logic. For MVP, treat batch send as atomic.

3. **Should contacts receive different templates based on relationship?**
   - What we know: Contact model has `relationship` field (spouse, child, sibling, friend, other)
   - What's unclear: Whether this affects messaging
   - Recommendation: Use same template for v1, personalize only with contact name. Relationship-specific messaging is a v2 enhancement.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- /websites/resend - Context7: Webhooks, batch API, event types
- /resend/react-email - Context7: Email template patterns
- Existing codebase: src/emails/ReminderEmail.tsx, src/app/api/cron/reminders/route.ts

### Secondary (MEDIUM confidence)
- Resend API reference for batch limits and tag structure

### Verified from existing codebase
- Resend client initialization pattern
- React Email component usage
- Cron security pattern (CRON_SECRET)
- Contact model structure (priority, deletedAt, notifyByEmail)
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Resend + React Email (already integrated)
- Ecosystem: Batch API, webhooks (for future)
- Patterns: Escalation-triggered notifications
- Pitfalls: Duplicate sends, deleted contacts, empty lists

**Confidence breakdown:**
- Standard stack: HIGH - already using Resend/React Email
- Architecture: HIGH - extends established cron pattern
- Pitfalls: HIGH - derived from existing code review
- Code examples: HIGH - adapted from Phase 6 implementation

**Research date:** 2026-01-17
**Valid until:** 2026-02-17 (30 days - stable technology stack)
</metadata>

---

*Phase: 08-contact-notifications*
*Research completed: 2026-01-17*
*Ready for planning: yes*
