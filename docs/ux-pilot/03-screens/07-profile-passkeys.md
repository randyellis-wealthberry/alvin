# Passkey Management Page (/profile/passkeys)

> Biometric authentication setup and management

## UX Pilot Prompt

```text
Design a passkey/biometric authentication management page:

LAYOUT:
- Full viewport, gradient background (#2e026d to #15162c)
- Centered content (max-width: 480px)
- 64px top padding

NAVIGATION:
- "← Back to Settings" link at top
- 70% white text, hover: 100% white
- Links to /profile
- 24px below

HEADER:
- "Passkeys" title (2.5rem bold white, centered)
- Description (1rem, 70% white, centered, max-width for readability):
  "Use TouchID, FaceID, or Windows Hello to check in quickly and securely."
- 32px gap below

=== ADD PASSKEY SECTION ===

Semi-transparent card (10% white, 16px radius, 24px padding):

Heading: "Add New Passkey" (1.25rem semibold)
16px gap below

Name Input:
- Label: "Passkey Name (optional)" (0.875rem, 70% white)
- Input: text field
  - Semi-transparent (10% white)
  - Placeholder: "e.g., MacBook TouchID"
  - White text
- 16px gap below

Add Button:
- Full width
- Blue background (#2563eb)
- White text "Add Passkey"
- Pill shape
- Loading state: "Registering..."
- Disabled during registration

=== FEEDBACK AREA ===

Below add section, 16px gap:

Success Message:
- Green background (green-500/20)
- Green-300 text
- "Passkey registered successfully!"
- 12px padding, 8px radius

Error Message:
- Red background (red-500/20)
- Red-300 text
- Specific error (e.g., "Registration cancelled")

=== REGISTERED PASSKEYS LIST ===

Semi-transparent card (10% white, 16px radius, 24px padding):

Heading: "Your Passkeys" (1.25rem semibold)
16px gap below

EMPTY STATE (no passkeys):
- Centered text
- "No passkeys registered yet"
- "Add one above to enable biometric check-ins"
- 50% white, 0.875rem

PASSKEY LIST (if passkeys exist):
- Vertical stack, 12px gap between items
- Each passkey in subtle card (5% white, 8px radius, 16px padding)

Each passkey item:
- Layout: flex, space-between, items-center

Left side:
- Passkey name (1rem, medium weight, white)
  - If no name: "Unnamed Passkey" in 70% white
- Below: metadata line (0.875rem, 50% white)
  - Device type: "Single Device" or "Multi-Device (Synced)"
  - Separator: " • "
  - Created date: "Added Jan 15, 2026"

Right side:
- Delete button:
  - "Delete" text
  - Red tinted background (red-500/20)
  - Red-300 text
  - 8px radius
  - Hover: red-500/30

=== DELETE CONFIRMATION ===

When delete clicked, replace item with confirmation:
- Same card styling
- Text: "Delete this passkey?"
- Two buttons:
  - "Cancel" - transparent, white text
  - "Delete" - red-500/30 background, red-300 text
- Loading: "Deleting..."
```

---

## Component Details

### Passkey Card

| Property | Value |
| -------- | ----- |
| Background | bg-white/5 |
| Padding | 16px |
| Radius | 8px |
| Layout | flex, space-between |

### Add Button

| Property | Default | Loading |
| -------- | ------- | ------- |
| Background | blue-600 | blue-600/50 |
| Text | "Add Passkey" | "Registering..." |
| Disabled | false | true |

### Delete Button

| Property | Value |
| -------- | ----- |
| Background | red-500/20 |
| Text | red-300 |
| Padding | 8px 12px |
| Radius | 8px |
| Hover | red-500/30 |

---

## States

### No Passkeys

- Empty state message shown
- Add section prominent
- Biometric check-in unavailable

### Has Passkeys

- List shows all registered passkeys
- Add section still available
- Can have multiple passkeys

### Adding Passkey

1. User enters optional name
2. Clicks "Add Passkey"
3. Button shows "Registering..."
4. System WebAuthn prompt appears
5. User completes biometric
6. Success message, list updates

### Registration Cancelled

- User cancelled WebAuthn prompt
- Show: "Registration cancelled. Please try again."
- Button returns to default state

### Registration Error

- Already registered: "This authenticator is already registered"
- Not supported: "Your device doesn't support passkeys"
- Generic: "Registration failed. Please try again."

### Deleting Passkey

1. User clicks "Delete"
2. Confirmation UI replaces item
3. User confirms
4. Button shows "Deleting..."
5. Item removed from list
6. Success message (optional)

---

## WebAuthn Flow

### Registration

```text
1. Click "Add Passkey"
2. Call generateRegistrationOptions API
3. Browser shows system prompt
4. User authenticates (TouchID/FaceID/etc)
5. Call verifyRegistration with response
6. On success: passkey saved, list updated
```

### Device Types

| Type | Description |
| ---- | ----------- |
| singleDevice | Passkey tied to this device only |
| multiDevice | Synced via iCloud Keychain, Google, etc |

---

## Data Requirements

| Field | Source | Usage |
| ----- | ------ | ----- |
| passkeys | passkey.list | Display list |
| id | passkey.id | Deletion |
| name | passkey.name | Display name |
| deviceType | passkey.deviceType | Show sync status |
| createdAt | passkey.createdAt | Display date |

---

## Responsive Behavior

| Breakpoint | Layout |
| ---------- | ------ |
| Mobile (<640px) | Full width cards |
| Tablet+ (>=640px) | Centered, max 480px |

---

## Error Messages

| Error | Message |
| ----- | ------- |
| Cancelled | "Registration cancelled. Please try again." |
| Already exists | "This authenticator is already registered." |
| Not supported | "Passkeys aren't supported on this device." |
| Network error | "Could not connect. Please try again." |
| Delete failed | "Could not delete passkey. Please try again." |

---

## Accessibility

- Add button has clear accessible name
- Passkey list uses list semantics
- Delete confirmation is keyboard accessible
- Focus management on delete confirmation
- Screen reader announces success/error messages
