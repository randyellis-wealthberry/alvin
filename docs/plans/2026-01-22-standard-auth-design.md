# Standard Authentication Design

## Overview

Replace Discord OAuth with email/password (credentials) authentication, including self-service user registration.

## Schema Changes

Add `password` field to User model in `prisma/schema.prisma`:

```prisma
model User {
  id            String       @id @default(cuid())
  name          String?
  email         String?      @unique
  emailVerified DateTime?
  image         String?
  password      String?      // Hashed password (nullable for OAuth migration)
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  profile       UserProfile?
}
```

Password is nullable to support existing OAuth users and future flexibility.

## Auth Configuration

Replace DiscordProvider with CredentialsProvider in `src/server/auth/config.ts`:

- Use `bcryptjs` for password hashing
- JWT session strategy (required for credentials)
- Custom sign-in page at `/auth/signin`

## Registration API

New tRPC router at `src/server/api/routers/auth.ts`:

```typescript
authRouter.register({
  input: {
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
  },
  // Check email exists, hash password, create user
})
```

## UI Pages

### `/auth/signup`
- Name (optional), email, password fields
- Calls tRPC `auth.register` mutation
- Links to sign-in page

### `/auth/signin`
- Email, password fields
- Calls NextAuth `signIn("credentials", ...)`
- Links to sign-up page

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add password field to User |
| `package.json` | Add bcryptjs dependency |
| `src/server/auth/config.ts` | CredentialsProvider, JWT sessions |
| `src/server/api/routers/auth.ts` | New auth router (register mutation) |
| `src/server/api/root.ts` | Register auth router |
| `src/app/auth/signin/page.tsx` | Sign-in page |
| `src/app/auth/signup/page.tsx` | Sign-up page |

## Security Considerations

- bcrypt cost factor 10 (~100ms hash time)
- Minimum 8-character password
- Generic errors to prevent email enumeration
- JWT sessions stored in encrypted cookie

## Environment Changes

Remove requirements for:
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
