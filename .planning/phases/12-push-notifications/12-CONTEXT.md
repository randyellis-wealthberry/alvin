# Phase 12: Push Notifications - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<vision>
## How This Should Work

Push notifications become the primary communication channel for ALVIN, with email serving as a backup for users who haven't enabled push. This is about making ALVIN feel native on mobile — when it's time to check in, a push notification appears and tapping it takes you directly to the check-in screen, ready to verify.

The flow is: notification arrives → tap → land on check-in → confirm you're okay. Minimal friction for a safety-critical action.

</vision>

<essential>
## What Must Be Nailed

All three equally important for a safety app:

- **Reliability** — Notifications MUST arrive on time. This is a safety app; missed alerts are dangerous.
- **User control** — Easy to enable/disable, feel in control of what the app can do.
- **Clear messaging** — Notifications should be unmistakably ALVIN. Not generic, not alarming unless the situation actually warrants it.

</essential>

<boundaries>
## What's Out of Scope

- **Granular notification preferences** — No per-notification-type toggles. Just on/off for the whole push channel.
- **Family member push notifications** — Only the primary user gets push. Family contacts continue receiving email (and later SMS in Phase 14).
- **Rich media notifications** — No images, custom sounds, or fancy formatting. Text-only notifications.

</boundaries>

<specifics>
## Specific Ideas

- Tapping a check-in reminder opens directly to the check-in screen (not dashboard)
- Push replaces email as primary; email only for users without push enabled
- Keep notification text calm and clear — matches ALVIN's personality

</specifics>

<notes>
## Additional Context

This aligns with v2.0's "Mobile & Messaging" milestone goal. Push notifications are the mobile-native way to reach users, making ALVIN feel like a proper app rather than a website that sends emails.

The "primary channel" decision means the notification flow logic may need to check push subscription status before falling back to email.

</notes>

---

*Phase: 12-push-notifications*
*Context gathered: 2026-01-17*
