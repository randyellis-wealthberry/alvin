# Standard Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Discord OAuth with email/password credentials authentication including self-service user registration.

**Architecture:** Add password field to User model, create CredentialsProvider for NextAuth with bcrypt hashing, add tRPC auth router for registration, create sign-in and sign-up pages using existing shadcn/ui components.

**Tech Stack:** NextAuth.js 5 (beta.25), bcryptjs, tRPC, Prisma, React

---

## Task 1: Add bcryptjs Dependency

**Files:**
- Modify: `package.json`

**Step 1: Install bcryptjs**

Run: `npm install bcryptjs`

**Step 2: Install types**

Run: `npm install -D @types/bcryptjs`

**Step 3: Verify installation**

Run: `npm ls bcryptjs`
Expected: `bcryptjs@X.X.X`

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add bcryptjs for password hashing"
```

---

## Task 2: Add Password Field to Schema

**Files:**
- Modify: `prisma/schema.prisma:58-68`

**Step 1: Add password field to User model**

In `prisma/schema.prisma`, update the User model to add password field after `image`:

```prisma
model User {
    id            String       @id @default(cuid())
    name          String?
    email         String?      @unique
    emailVerified DateTime?
    image         String?
    password      String?
    accounts      Account[]
    sessions      Session[]
    posts         Post[]
    profile       UserProfile?
}
```

**Step 2: Push schema changes**

Run: `npm run db:push`
Expected: "Your database is now in sync with your Prisma schema"

**Step 3: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

**Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add password field to User model"
```

---

## Task 3: Create Auth Router with Register Mutation

**Files:**
- Create: `src/server/api/routers/auth.ts`
- Modify: `src/server/api/root.ts`

**Step 1: Create the auth router**

Create `src/server/api/routers/auth.ts`:

```typescript
import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, rateLimitedProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  register: rateLimitedProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      await ctx.db.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
        },
      });

      return { success: true };
    }),
});
```

**Step 2: Register auth router in root**

In `src/server/api/root.ts`, add the import and register the router:

Add import at top:
```typescript
import { authRouter } from "~/server/api/routers/auth";
```

Add to appRouter object:
```typescript
export const appRouter = createTRPCRouter({
  auth: authRouter,
  alert: alertRouter,
  // ... rest of routers
});
```

**Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/server/api/routers/auth.ts src/server/api/root.ts
git commit -m "feat(api): add auth router with register mutation"
```

---

## Task 4: Update NextAuth Config for Credentials

**Files:**
- Modify: `src/server/auth/config.ts`

**Step 1: Replace Discord with Credentials provider**

Replace the entire contents of `src/server/auth/config.ts`:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
```

**Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/server/auth/config.ts
git commit -m "feat(auth): replace Discord with Credentials provider"
```

---

## Task 5: Create Sign-Up Page

**Files:**
- Create: `src/app/auth/signup/page.tsx`

**Step 1: Create signup page**

Create directory and file `src/app/auth/signup/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push("/auth/signin?registered=true");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    registerMutation.mutate({
      email,
      password,
      name: name || undefined,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min 8 characters"
                minLength={8}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
```

**Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/auth/signup/page.tsx
git commit -m "feat(ui): add sign-up page"
```

---

## Task 6: Create Sign-In Page

**Files:**
- Create: `src/app/auth/signin/page.tsx`

**Step 1: Create signin page**

Create file `src/app/auth/signin/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          {registered && (
            <p className="mb-4 text-center text-sm text-green-600">
              Account created! Please sign in.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
```

**Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/auth/signin/page.tsx
git commit -m "feat(ui): add sign-in page"
```

---

## Task 7: Update Environment and Test

**Files:**
- Modify: `.env` (local only, not committed)

**Step 1: Update .env file**

Remove or comment out Discord vars (optional, they won't hurt):
```
# AUTH_DISCORD_ID=...
# AUTH_DISCORD_SECRET=...
```

Ensure you have:
```
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

**Step 2: Start dev server**

Run: `npm run dev`
Expected: Server starts without errors

**Step 3: Manual test - registration**

1. Navigate to `http://localhost:3000/auth/signup`
2. Enter email, password (min 8 chars), optional name
3. Click "Create Account"
4. Should redirect to `/auth/signin?registered=true`

**Step 4: Manual test - sign in**

1. On sign-in page, enter same email and password
2. Click "Sign In"
3. Should redirect to home page, showing "Logged in as [name]"

**Step 5: Manual test - sign out**

1. Click "Sign out" on home page
2. Should return to home page, showing "Sign in" button

**Step 6: Commit any final adjustments**

```bash
git add -A
git commit -m "feat(auth): complete standard auth implementation"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Install bcryptjs dependency |
| 2 | Add password field to User schema |
| 3 | Create auth router with register mutation |
| 4 | Update NextAuth config for credentials |
| 5 | Create sign-up page |
| 6 | Create sign-in page |
| 7 | Test end-to-end flow |

Total: 7 tasks with incremental commits.
