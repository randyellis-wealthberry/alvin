import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// WebAuthn Relying Party (RP) configuration
// In production, these should come from environment variables
const rpName = "ALVIN";
const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";
const origin = process.env.WEBAUTHN_ORIGIN ?? `http://${rpID}:3000`;

// Challenge storage (in-memory for MVP, would use Redis in production)
// Challenges expire after 5 minutes
interface StoredChallenge {
  challenge: string;
  userProfileId: string;
  expiresAt: Date;
}

const challengeStore = new Map<string, StoredChallenge>();

// Clean up expired challenges periodically
function cleanupExpiredChallenges() {
  const now = new Date();
  for (const [key, value] of challengeStore.entries()) {
    if (value.expiresAt < now) {
      challengeStore.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredChallenges, 60000);

// Helper to store challenge with 5-minute expiry
function storeChallenge(challenge: string, userProfileId: string): void {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  challengeStore.set(challenge, { challenge, userProfileId, expiresAt });
}

// Helper to generate a WebAuthn user ID (random bytes encoded as base64url)
function generateWebAuthnUserID(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

// Helper to convert transports array to CSV string for storage
function transportsToString(
  transports?: AuthenticatorTransportFuture[],
): string | null {
  if (!transports || transports.length === 0) return null;
  return transports.join(",");
}

// Helper to convert CSV string back to transports array
function stringToTransports(
  str: string | null,
): AuthenticatorTransportFuture[] | undefined {
  if (!str) return undefined;
  return str.split(",") as AuthenticatorTransportFuture[];
}

// Helper to convert base64url string to Uint8Array
function base64URLToUint8Array(base64url: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64url, "base64url"));
}

export const passkeyRouter = createTRPCRouter({
  // List user's registered passkeys
  list: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        passkeys: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            deviceType: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return profile?.passkeys ?? [];
  }),

  // Check if user has any passkeys registered
  hasPasskeys: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        passkeys: {
          select: { id: true },
          take: 1,
        },
      },
    });

    return (profile?.passkeys?.length ?? 0) > 0;
  }),

  // Generate registration options for adding a new passkey
  generateRegistrationOptions: protectedProcedure.mutation(async ({ ctx }) => {
    // Get or create profile
    let profile = await ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        passkeys: {
          select: {
            id: true,
            transports: true,
          },
        },
      },
    });

    profile ??= await ctx.db.userProfile.create({
      data: {
        userId: ctx.session.user.id,
        checkInFrequencyHours: 24,
        timezone: "UTC",
        isActive: true,
      },
      include: {
        passkeys: {
          select: {
            id: true,
            transports: true,
          },
        },
      },
    });

    // Generate a new WebAuthn user ID for each registration
    const webAuthnUserID = generateWebAuthnUserID();

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: ctx.session.user.email ?? ctx.session.user.name ?? "User",
      userDisplayName: ctx.session.user.name ?? "User",
      userID: webAuthnUserID,
      // Exclude already registered credentials
      // Note: SimpleWebAuthn accepts base64url strings for credential IDs internally
      excludeCredentials: profile.passkeys.map((passkey) => ({
        id: base64URLToUint8Array(passkey.id),
        type: "public-key" as const,
        transports: stringToTransports(passkey.transports),
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
      attestationType: "none",
    });

    // Store challenge for verification
    storeChallenge(options.challenge, profile.id);

    // Return options with webAuthnUserID for client to pass back during verification
    return {
      ...options,
      _webAuthnUserID: webAuthnUserID,
    };
  }),

  // Verify registration response and save passkey
  verifyRegistration: protectedProcedure
    .input(
      z.object({
        response: z.any(), // RegistrationResponseJSON
        webAuthnUserID: z.string(),
        name: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const response = input.response as RegistrationResponseJSON;

      // Find the stored challenge for this user
      let foundChallenge: StoredChallenge | undefined;
      for (const [, stored] of challengeStore.entries()) {
        if (stored.userProfileId === profile.id) {
          foundChallenge = stored;
          challengeStore.delete(stored.challenge);
          break;
        }
      }

      if (!foundChallenge) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Challenge expired or not found. Please try again.",
        });
      }

      let verification;
      try {
        verification = await verifyRegistrationResponse({
          response,
          expectedChallenge: foundChallenge.challenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Verification failed",
        });
      }

      if (!verification.verified || !verification.registrationInfo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Registration verification failed",
        });
      }

      const {
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp,
      } = verification.registrationInfo;

      // Convert Uint8Array credentialID to base64url string for storage
      const credentialIDString =
        Buffer.from(credentialID).toString("base64url");

      // Save the passkey to the database
      await ctx.db.passkey.create({
        data: {
          id: credentialIDString,
          userProfileId: profile.id,
          publicKey: Buffer.from(credentialPublicKey),
          webAuthnUserID: input.webAuthnUserID,
          counter: BigInt(counter),
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: transportsToString(response.response.transports),
          name: input.name ?? null,
        },
      });

      return { success: true };
    }),

  // Generate authentication options for biometric check-in
  generateAuthenticationOptions: protectedProcedure.mutation(
    async ({ ctx }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          passkeys: {
            select: {
              id: true,
              transports: true,
            },
          },
        },
      });

      if (!profile || profile.passkeys.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No passkeys registered. Please register a passkey first.",
        });
      }

      const options = await generateAuthenticationOptions({
        rpID,
        // Allow credentials
        allowCredentials: profile.passkeys.map((passkey) => ({
          id: base64URLToUint8Array(passkey.id),
          type: "public-key" as const,
          transports: stringToTransports(passkey.transports),
        })),
        userVerification: "preferred",
      });

      // Store challenge for verification
      storeChallenge(options.challenge, profile.id);

      return options;
    },
  ),

  // Verify authentication response and record biometric check-in
  verifyAuthentication: protectedProcedure
    .input(
      z.object({
        response: z.any(), // AuthenticationResponseJSON
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          passkeys: true,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const response = input.response as AuthenticationResponseJSON;

      // Find the passkey being used
      const passkey = profile.passkeys.find((p) => p.id === response.id);

      if (!passkey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Passkey not found",
        });
      }

      // Find the stored challenge for this user
      let foundChallenge: StoredChallenge | undefined;
      for (const [, stored] of challengeStore.entries()) {
        if (stored.userProfileId === profile.id) {
          foundChallenge = stored;
          challengeStore.delete(stored.challenge);
          break;
        }
      }

      if (!foundChallenge) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Challenge expired or not found. Please try again.",
        });
      }

      let verification;
      try {
        verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge: foundChallenge.challenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          // Authenticator expects Uint8Array for credentialID and publicKey
          authenticator: {
            credentialID: base64URLToUint8Array(passkey.id),
            credentialPublicKey: new Uint8Array(passkey.publicKey),
            counter: Number(passkey.counter),
            transports: stringToTransports(passkey.transports),
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Authentication verification failed",
        });
      }

      if (!verification.verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication verification failed",
        });
      }

      const now = new Date();

      // Update passkey counter and record check-in in a transaction
      const [, checkIn] = await ctx.db.$transaction([
        // Update the counter to prevent replay attacks
        ctx.db.passkey.update({
          where: { id: passkey.id },
          data: {
            counter: BigInt(verification.authenticationInfo.newCounter),
          },
        }),
        // Create the check-in record
        ctx.db.checkIn.create({
          data: {
            userProfileId: profile.id,
            method: "BIOMETRIC",
            performedAt: now,
          },
        }),
        // Update last check-in time
        ctx.db.userProfile.update({
          where: { id: profile.id },
          data: { lastCheckInAt: now },
        }),
      ]);

      return checkIn;
    }),

  // Delete a passkey
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Verify the passkey belongs to this user
      const passkey = await ctx.db.passkey.findFirst({
        where: {
          id: input.id,
          userProfileId: profile.id,
        },
      });

      if (!passkey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Passkey not found or not owned by user",
        });
      }

      await ctx.db.passkey.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
