"use client";

import { useState, useEffect } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import Link from "next/link";
import { api } from "~/trpc/react";

export function CheckInButton() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const utils = api.useUtils();

  // Check if user has passkeys registered
  const { data: hasPasskeys } = api.passkey.hasPasskeys.useQuery();

  // Manual check-in mutation
  const recordCheckIn = api.checkIn.record.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      void utils.checkIn.list.invalidate();
    },
  });

  // Biometric check-in mutations
  const generateAuthOptions = api.passkey.generateAuthenticationOptions.useMutation();
  const verifyAuth = api.passkey.verifyAuthentication.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      void utils.checkIn.list.invalidate();
      void utils.passkey.hasPasskeys.invalidate();
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleBiometricCheckIn = async () => {
    setBiometricError(null);
    setIsBiometricLoading(true);

    try {
      // Step 1: Get authentication options from server
      const options = await generateAuthOptions.mutateAsync();

      // Step 2: Start authentication in browser (triggers WebAuthn prompt)
      let authResponse;
      try {
        authResponse = await startAuthentication(options);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setBiometricError("Authentication cancelled. Please try again.");
            return;
          }
          setBiometricError(err.message);
          return;
        }
        setBiometricError("Authentication failed. Please try again.");
        return;
      }

      // Step 3: Verify authentication with server and record check-in
      await verifyAuth.mutateAsync({ response: authResponse });
    } catch (err) {
      setBiometricError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const isPending = recordCheckIn.isPending || isBiometricLoading;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Check-in Buttons */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Manual Check-in Button */}
        <button
          onClick={() => recordCheckIn.mutate()}
          disabled={isPending || showSuccess}
          className="flex h-32 w-32 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {recordCheckIn.isPending ? (
            <span className="animate-pulse">...</span>
          ) : showSuccess ? (
            <span className="text-2xl">&#10003;</span>
          ) : (
            "I'm OK"
          )}
        </button>

        {/* Biometric Check-in Button (only shown if passkeys registered) */}
        {hasPasskeys && (
          <button
            onClick={handleBiometricCheckIn}
            disabled={isPending || showSuccess}
            className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBiometricLoading ? (
              <span className="animate-pulse text-xl">...</span>
            ) : showSuccess ? (
              <span className="text-2xl">&#10003;</span>
            ) : (
              <>
                {/* Fingerprint Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                  <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
                  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                  <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                  <path d="M2 16h.01" />
                  <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                  <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
                </svg>
                <span className="text-sm font-semibold">Biometric</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <p className="text-lg font-semibold text-green-400">Checked in!</p>
      )}

      {/* Error Messages */}
      {recordCheckIn.isError && (
        <p className="text-red-400">Error: {recordCheckIn.error.message}</p>
      )}
      {biometricError && <p className="text-red-400">Error: {biometricError}</p>}

      {/* Setup Biometric Link (only shown if no passkeys) */}
      {hasPasskeys === false && (
        <Link
          href="/profile/passkeys"
          className="text-sm text-white/70 hover:text-white hover:underline"
        >
          Set up biometric check-in &rarr;
        </Link>
      )}
    </div>
  );
}
