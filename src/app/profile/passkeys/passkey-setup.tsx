"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { api } from "~/trpc/react";

export function PasskeySetup() {
  const [passkeys] = api.passkey.list.useSuspenseQuery();
  const [passkeyName, setPasskeyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const utils = api.useUtils();

  const generateRegOptions = api.passkey.generateRegistrationOptions.useMutation();
  const verifyRegistration = api.passkey.verifyRegistration.useMutation();
  const deletePasskey = api.passkey.delete.useMutation({
    onSuccess: () => {
      void utils.passkey.list.invalidate();
      void utils.passkey.hasPasskeys.invalidate();
      setSuccess("Passkey deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleAddPasskey = async () => {
    setError(null);
    setSuccess(null);
    setIsRegistering(true);

    try {
      // Step 1: Get registration options from server
      const options = await generateRegOptions.mutateAsync();

      // Step 2: Start registration in browser (triggers WebAuthn prompt)
      let registrationResponse;
      try {
        registrationResponse = await startRegistration(options);
      } catch (err) {
        // Handle user cancellation or other browser errors
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError("Registration cancelled. Please try again.");
            return;
          }
          if (err.name === "InvalidStateError") {
            setError("This authenticator is already registered.");
            return;
          }
          setError(err.message);
          return;
        }
        setError("Registration failed. Please try again.");
        return;
      }

      // Step 3: Verify registration with server and save passkey
      await verifyRegistration.mutateAsync({
        response: registrationResponse,
        webAuthnUserID: options._webAuthnUserID,
        name: passkeyName.trim() || undefined,
      });

      // Success
      setSuccess("Passkey registered successfully!");
      setPasskeyName("");
      void utils.passkey.list.invalidate();
      void utils.passkey.hasPasskeys.invalidate();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeletePasskey = (id: string) => {
    if (!confirm("Are you sure you want to delete this passkey?")) {
      return;
    }
    setError(null);
    setSuccess(null);
    deletePasskey.mutate({ id });
  };

  // Format device type for display
  const formatDeviceType = (type: string) => {
    if (type === "singleDevice") return "Single Device";
    if (type === "multiDevice") return "Synced";
    return type;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Add Passkey Form */}
      <div className="rounded-xl bg-white/10 p-6">
        <h2 className="mb-4 text-xl font-semibold">Add New Passkey</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="passkey-name" className="block text-sm font-medium text-white/70">
              Passkey Name (optional)
            </label>
            <input
              id="passkey-name"
              type="text"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              placeholder="e.g., MacBook TouchID"
              className="mt-1 w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
              disabled={isRegistering}
            />
          </div>
          <button
            onClick={handleAddPasskey}
            disabled={isRegistering || generateRegOptions.isPending || verifyRegistration.isPending}
            className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRegistering ? "Registering..." : "Add Passkey"}
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/20 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      {/* Registered Passkeys List */}
      <div className="rounded-xl bg-white/10 p-6">
        <h2 className="mb-4 text-xl font-semibold">Registered Passkeys</h2>
        {passkeys.length === 0 ? (
          <p className="text-white/50">
            No passkeys registered yet. Add one above to enable biometric check-ins.
          </p>
        ) : (
          <ul className="space-y-3">
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {passkey.name ?? "Unnamed Passkey"}
                  </p>
                  <p className="text-sm text-white/50">
                    {formatDeviceType(passkey.deviceType)} &bull;{" "}
                    {formatDate(passkey.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePasskey(passkey.id)}
                  disabled={deletePasskey.isPending}
                  className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
