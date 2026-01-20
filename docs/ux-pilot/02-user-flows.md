# ALVIN User Flows

> Visual journey maps for key user scenarios

---

## Flow 1: First-Time User Onboarding

```
┌──────────────────┐
│   Landing Page   │
│        /         │
│  (Unauthenticated)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    "Sign In"     │
│     Button       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────┐
│   Auth Provider  │────▶│  Auth Error  │
│    Redirect      │     │   Message    │
└────────┬─────────┘     └──────┬───────┘
         │                      │
         │                      ▼
         │               ┌──────────────┐
         │               │  Try Again   │
         │               └──────────────┘
         ▼
┌──────────────────┐
│   Landing Page   │
│ (Authenticated)  │
│ Shows nav cards  │
└────────┬─────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    ▼         ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Check-In│ │Settings│ │Contacts│ │ Alerts │
└────────┘ └───┬────┘ └───┬────┘ └────────┘
               │          │
               ▼          ▼
         ┌──────────┐ ┌────────────┐
         │Set Check-│ │Add Contact │
         │in Prefs  │ │  Form      │
         └──────────┘ └────────────┘
```

**Key Screens:**
- `/` - Landing (shows sign-in CTA when unauthenticated)
- `/api/auth/signin` - Auth provider selection
- `/profile` - Set check-in frequency, timezone
- `/contacts` - Add emergency contacts

---

## Flow 2: Daily Check-In (Manual)

```
┌──────────────────┐
│   Landing Page   │
│  or Home Screen  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Check-In Page  │
│     /check-in    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  "I'm OK" Button │
│  (Green, 128px)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Button Loading   │
│     "..."        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Success State    │
│ ✓ "Checked in!"  │
│ (2s auto-dismiss)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ History Updated  │
│ New entry shows  │
│ "just now"       │
└──────────────────┘
```

**States:**
- Default: Green button with "I'm OK" text
- Loading: Pulsing "..." text
- Success: Checkmark icon, green glow, "Checked in!" message
- Returns to default after 2 seconds

---

## Flow 3: Biometric Check-In

```
┌──────────────────┐
│   Check-In Page  │
│   /check-in      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Biometric Button │
│ (Blue, 128px)    │
│ Fingerprint icon │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ WebAuthn Prompt  │
│ (System dialog)  │
│ TouchID/FaceID   │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│Success │ │  Cancelled │
│   ✓    │ │   Error    │
└────────┘ └─────┬──────┘
                 │
                 ▼
           ┌──────────────┐
           │ "Auth cancelled.│
           │ Please try again"│
           └──────────────┘
```

**Prerequisites:**
- User must have passkeys registered
- No passkeys → Show "Set up biometric check-in →" link

---

## Flow 4: Chat-Triggered Check-In

```
┌──────────────────┐
│   Chat List      │
│      /chat       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ "New Chat" Button│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Chat Conversation│
│ /chat/[id]       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User types:      │
│ "I'm doing great"│
│ "feeling fine"   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ AI detects       │
│ wellness phrase  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check-In Banner  │
│ appears below    │
│ header           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ "Check-in recorded"│
│ + timestamp      │
└──────────────────┘
```

**Wellness Detection Phrases:**
- "I'm okay" / "I'm fine" / "I'm good"
- "doing well" / "doing great"
- "feeling fine" / "feeling good"

---

## Flow 5: Alert Escalation (System)

```
┌──────────────────┐
│ User Misses      │
│ Check-In Window  │
└────────┬─────────┘
         │
         ▼ +24 hours
┌──────────────────┐
│ LEVEL_1 Alert    │
│ Created          │
│ (Yellow badge)   │
└────────┬─────────┘
         │
    ┌────┴────────────┐
    ▼                 ▼
┌────────┐      ┌─────────────┐
│User    │      │ No Check-In │
│Checks  │      │ +24 more hrs│
│In      │      └──────┬──────┘
└───┬────┘             │
    │                  ▼
    ▼           ┌──────────────┐
┌────────┐      │ LEVEL_2 Alert│
│RESOLVED│      │ (Orange)     │
│(Green) │      └──────┬───────┘
└────────┘             │
                       ▼ +24 hours
                ┌──────────────┐
                │ LEVEL_3 Alert│
                │ (Red)        │
                │ Contact #1   │
                │ Notified     │
                └──────┬───────┘
                       │
                       ▼ +24 hours
                ┌──────────────┐
                │ LEVEL_4 Alert│
                │ (Dark Red)   │
                │ All Contacts │
                │ Notified     │
                └──────────────┘
```

**Alert Resolution:**
- Any check-in (manual, biometric, conversation) resolves active alert
- User can manually cancel alert with optional reason

---

## Flow 6: Manual Alert Cancellation

```
┌──────────────────┐
│   Alerts Page    │
│     /alerts      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Active Alert Card│
│ with "Cancel     │
│ Alert" button    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Confirmation UI  │
│ - Reason input   │
│   (optional)     │
│ - Confirm button │
│ - Back button    │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Confirm │ │ Back   │
│clicked │ │clicked │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│CANCELLED│ │Return  │
│(Gray)  │ │to list │
└────────┘ └────────┘
```

---

## Flow 7: Emergency Contact Management

```
┌──────────────────┐
│  Contacts Page   │
│    /contacts     │
└────────┬─────────┘
         │
    ┌────┴────────────┬────────────┐
    ▼                 ▼            ▼
┌──────────┐   ┌──────────┐  ┌──────────┐
│Add New   │   │Edit      │  │Delete    │
│Contact   │   │Existing  │  │Contact   │
└────┬─────┘   └────┬─────┘  └────┬─────┘
     │              │             │
     ▼              ▼             ▼
┌──────────────────────────┐ ┌──────────┐
│    Contact Form          │ │Confirm?  │
│ - Name (required)        │ │Yes / No  │
│ - Email (required)       │ └────┬─────┘
│ - Phone (optional)       │      │
│ - Relationship           │      ▼
│ - Priority (1 = highest) │ ┌──────────┐
│ - Notify by Email ☑      │ │Soft      │
│ - Notify by SMS ☐        │ │Delete    │
│   (disabled)             │ └──────────┘
└──────────┬───────────────┘
           │
           ▼
     ┌─────┴─────┐
     ▼           ▼
┌────────┐  ┌────────┐
│Success │  │Error   │
│Message │  │Message │
└────────┘  └────────┘
```

**Priority System:**
- Lower number = higher priority
- Priority 1: Notified first at L3
- Priority 2+: Notified at L4 or sequentially

---

## Flow 8: Passkey Setup

```
┌──────────────────┐
│ Check-In Page    │
│ (no passkeys)    │
│ Shows link:      │
│ "Set up biometric│
│  check-in →"     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Passkey Page     │
│ /profile/passkeys│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ "Add New Passkey"│
│ - Name input     │
│   (optional)     │
│ - Add button     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ WebAuthn         │
│ Registration     │
│ Prompt           │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│Success │ │ Error:     │
│Passkey │ │ Already    │
│Added   │ │ Registered │
└────────┘ └────────────┘
         │
         ▼
┌──────────────────┐
│ Passkey appears  │
│ in list with:    │
│ - Name or        │
│   "Unnamed"      │
│ - Device type    │
│ - Delete button  │
└──────────────────┘
```

---

## Flow 9: Contact Notification (Phase 8)

```
┌──────────────────┐
│ L3 Alert         │
│ Triggered        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notification     │
│ Sent to Contact  │
│ (Email/SMS)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Contact clicks   │
│ link in email    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notification     │
│ Landing Page     │
│ /notify/[id]     │
└────────┬─────────┘
         │
    ┌────┴────────────┐
    ▼                 ▼
┌──────────┐   ┌──────────────┐
│Already   │   │ Alert Active │
│Resolved  │   │ - User info  │
│ ✓ All OK │   │ - Alert level│
└──────────┘   │ - Last check │
               └──────┬───────┘
                      │
                 ┌────┴────┐
                 ▼         ▼
           ┌────────┐ ┌────────────┐
           │"I've   │ │"Cannot     │
           │contacted│ │reach them" │
           │[user]" │ │            │
           └────────┘ └────────────┘
```

---

## Screen Transition Map

```
                    ┌─────────────┐
                    │   Landing   │
                    │      /      │
                    └──────┬──────┘
                           │
    ┌────────┬─────────┬───┴───┬─────────┬────────┐
    ▼        ▼         ▼       ▼         ▼        ▼
┌────────┐┌─────┐ ┌─────────┐┌────────┐┌──────┐┌────────┐
│Check-In││Chat │ │Settings ││Contacts││Alerts││Sign Out│
│/check-in││/chat │ │/profile ││/contacts││/alerts││        │
└────────┘└──┬──┘ └────┬────┘└────────┘└──────┘└────────┘
             │         │
             ▼         ▼
       ┌──────────┐ ┌─────────┐
       │Chat Conv.│ │Passkeys │
       │/chat/[id]│ │/profile/│
       └──────────┘ │passkeys │
                    └─────────┘
```

---

## Error Recovery Flows

### Network Error
```
Any Screen → API Call → Network Error → Toast: "Connection error" → Retry Button
```

### Authentication Expired
```
Protected Screen → Session Check → Expired → Redirect to Sign In → Return to Original Screen
```

### Validation Error
```
Form Submit → Validation Fail → Inline Error Messages → User Corrects → Resubmit
```
