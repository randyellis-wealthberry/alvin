import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      onboardingStep: number;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    onboardingStep?: number;
    onboardingCompleted?: boolean;
  }
}

async function loadOnboardingState(userId: string) {
  const profile = await db.userProfile.findUnique({
    where: { userId },
    select: {
      onboardingStep: true,
      onboardingCompleted: true,
      _count: { select: { contacts: { where: { deletedAt: null } } } },
    },
  });

  if (!profile) {
    return { onboardingStep: 0, onboardingCompleted: false };
  }

  // Auto-complete for existing users who already have contacts
  if (!profile.onboardingCompleted && profile._count.contacts > 0) {
    await db.userProfile.update({
      where: { userId },
      data: { onboardingStep: 4, onboardingCompleted: true },
    });
    return { onboardingStep: 4, onboardingCompleted: true };
  }

  return {
    onboardingStep: profile.onboardingStep,
    onboardingCompleted: profile.onboardingCompleted,
  };
}

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
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
        onboardingStep: token.onboardingStep ?? 0,
        onboardingCompleted: token.onboardingCompleted ?? false,
      },
    }),
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.sub = user.id;
        const state = await loadOnboardingState(user.id!);
        token.onboardingStep = state.onboardingStep;
        token.onboardingCompleted = state.onboardingCompleted;
      }

      if (trigger === "update") {
        const state = await loadOnboardingState(token.sub!);
        token.onboardingStep = state.onboardingStep;
        token.onboardingCompleted = state.onboardingCompleted;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
