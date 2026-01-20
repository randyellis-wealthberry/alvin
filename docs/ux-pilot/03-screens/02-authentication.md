# Authentication Flow

> Email and Google OAuth sign-in with simplified onboarding

## UX Pilot Prompt - Sign In Screen

```
Design a modern sign-in screen for a wellness app with email and Google options:

LAYOUT:
- Full viewport, gradient background (#2e026d to #15162c)
- Centered content container (max-width: 400px)
- Vertically centered in viewport

SIGN-IN CARD:
- Semi-transparent white (10% opacity)
- 32px padding
- 16px border radius

CARD CONTENT:

Header:
- ALVIN logo or app icon (64px, centered)
- "Welcome to ALVIN" heading (1.5rem semibold white, centered)
- "Your wellness companion" subtitle (1rem, 70% white, centered)
- 24px gap below

=== EMAIL SIGN-IN SECTION ===

Email Input:
- Full width
- Semi-transparent background (10% white)
- White text, placeholder: "you@example.com"
- 12px padding, 8px radius
- 12px gap below

Password Input:
- Same styling as email
- Placeholder: "Password"
- Show/hide toggle icon (eye) on right
- 8px gap below

"Forgot password?" link:
- Right-aligned, 0.875rem, 70% white
- Hover: 100% white with underline
- 16px gap below

Sign In Button:
- Full width
- Semi-transparent white (20%)
- White text "Sign In"
- 14px vertical padding, pill shape
- Hover: 30% white
- Loading: "Signing in..."

=== DIVIDER ===

- Horizontal line with "or" text centered
- Line: 1px, 20% white
- Text: 0.875rem, 50% white
- 16px vertical margin

=== SOCIAL AUTH ===

Google Button:
- Full width
- White background
- Dark text "Continue with Google"
- Google "G" logo on left (20px)
- 12px vertical padding
- 8px border radius
- Hover: gray-50 background

=== SIGN UP LINK ===

- 24px gap above
- "Don't have an account?"
- "Sign up" link - purple accent (#a855f7)
- 0.875rem, centered

=== SIGN UP VARIANT ===

When showing sign-up form:
- Change header to "Create your account"
- Add "Name" input above email
- Add "Confirm password" input
- Change button to "Create Account"
- Footer: "Already have an account? Sign in"
```

---

## UX Pilot Prompt - Onboarding Flow (Post Sign-Up)

```
Design a 3-step onboarding wizard after first sign-up:

LAYOUT:
- Same gradient background
- Centered card (max-width: 480px)
- Progress dots at top (3 dots)

=== STEP 1: WELCOME ===

Progress: ● ○ ○

Content:
- Checkmark in green circle (64px)
- "Welcome aboard!" heading (1.5rem semibold white)
- Paragraph:
  "ALVIN helps you stay connected with people who care.
   Check in regularly, and we'll make sure someone knows you're okay."
- 24px gap

Button:
- "Get Started" - full width, green (#22c55e), white text, pill

=== STEP 2: SET YOUR PREFERENCES ===

Progress: ● ● ○

Content:
- Clock icon (48px, 70% white)
- "Set your check-in schedule" heading

Form (semi-transparent cards):
1. Check-in Frequency:
   - Label: "How often should we expect a check-in?"
   - Large button group (not dropdown):
     - "12 hours" - "24 hours" (selected/default) - "48 hours"
   - Selected: white text on semi-transparent purple
   - Unselected: 70% white text, transparent

2. Timezone:
   - Auto-detected with note: "Detected: America/New_York"
   - "Change" link if incorrect

Buttons (side by side):
- "Skip" - ghost, 70% white
- "Continue" - green primary

=== STEP 3: ADD A CONTACT (OPTIONAL) ===

Progress: ● ● ●

Content:
- Heart/users icon (48px)
- "Add someone who cares" heading
- "They'll be notified only if you miss check-ins for too long" (70% white)

Quick form:
- Name input
- Email input
- "How do they know you?" - relationship dropdown

Buttons:
- "I'll do this later" - ghost
- "Add Contact" - green primary

=== COMPLETION ===

- Success animation (subtle confetti or checkmark bounce)
- "You're all set!" heading
- "Your first check-in is due in [X hours]" (70% white)
- "Check In Now" button → /check-in
```

---

## Component Details

### Email/Password Input
| Property | Value |
|----------|-------|
| Background | bg-white/10 |
| Text | white |
| Placeholder | text-white/50 |
| Padding | 12px 16px |
| Border Radius | 8px |
| Focus | ring-2 ring-purple-500 |

### Primary Button
| Property | Value |
|----------|-------|
| Background | bg-white/20 |
| Hover | bg-white/30 |
| Text | white, font-semibold |
| Padding | 14px 24px |
| Border Radius | rounded-full |

### Google Button
| Property | Value |
|----------|-------|
| Background | white |
| Text | gray-800, font-medium |
| Icon | Google "G" logo, 20px |
| Padding | 12px 16px |
| Border Radius | 8px |
| Hover | bg-gray-50 |

### Progress Dots
| Property | Value |
|----------|-------|
| Size | 8px diameter |
| Active | white filled |
| Inactive | white outline, 40% opacity |
| Gap | 12px |

---

## States

### Sign-In Form

| State | Visual |
|-------|--------|
| Default | Inputs empty, button enabled |
| Typing | Input focused with ring |
| Error | Red border on input, error message below |
| Loading | "Signing in..." button disabled |
| Success | Redirect to home or onboarding |

### Sign-Up Form

| State | Visual |
|-------|--------|
| Default | All inputs empty |
| Validation | Real-time validation on blur |
| Password Match | Green check or red X on confirm |
| Loading | "Creating account..." button disabled |
| Success | Start onboarding flow |

### OAuth

| State | Visual |
|-------|--------|
| Default | Google button enabled |
| Loading | "Connecting..." with spinner |
| Redirect | Full-screen loading |

---

## Error Messages

| Error | Message |
|-------|---------|
| Invalid email | "Please enter a valid email address" |
| Wrong password | "Incorrect password. Try again." |
| No account | "No account found. Would you like to sign up?" |
| Email taken | "This email is already registered" |
| Weak password | "Password must be at least 8 characters" |
| Mismatch | "Passwords don't match" |
| Google failed | "Google sign-in failed. Please try again." |
| Network error | "Can't connect. Check your connection." |

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Full-width card with padding |
| Tablet+ (>=640px) | Centered card, 400px max |

---

## Onboarding Copy

### Step 1 - Welcome
```
Heading: "Welcome aboard!"
Body: "ALVIN helps you stay connected with people who care.
Check in regularly, and we'll make sure someone knows you're okay."
CTA: "Get Started"
```

### Step 2 - Preferences
```
Heading: "Set your check-in schedule"
Body: "We'll send you gentle reminders when it's time to check in."
Skip: "Skip" (uses 24-hour default)
Continue: "Continue"
```

### Step 3 - Contact
```
Heading: "Add someone who cares"
Body: "They'll only be notified if you miss check-ins for too long.
No spam, just safety."
Skip: "I'll do this later"
Add: "Add Contact"
```

### Completion
```
Heading: "You're all set!"
Body: "Your first check-in is due in 24 hours."
CTA: "Check In Now"
```

---

## Security Considerations

- Password field uses type="password"
- Show/hide password toggle available
- Minimum 8 character password requirement
- Rate limiting on failed attempts (show message after 5 failures)
- Secure OAuth redirect handling
- Email verification for new accounts (optional flow)

---

## Accessibility

- All inputs have proper labels
- Error messages linked to inputs via aria-describedby
- Focus trapped in modal during onboarding
- Progress dots have aria-labels ("Step 1 of 3")
- Password toggle has accessible name
- Tab order follows visual order
