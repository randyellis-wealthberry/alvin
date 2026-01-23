"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function PasskeySetup() {
  const [passkeys] = api.passkey.list.useSuspenseQuery();
  const [passkeyName, setPasskeyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const utils = api.useUtils();

  const generateRegOptions =
    api.passkey.generateRegistrationOptions.useMutation();
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
      <Card>
        <CardHeader>
          <CardTitle>Add New Passkey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passkey-name">Passkey Name (optional)</Label>
            <Input
              id="passkey-name"
              type="text"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              placeholder="e.g., MacBook TouchID"
              disabled={isRegistering}
            />
          </div>
          <Button
            onClick={handleAddPasskey}
            disabled={
              isRegistering ||
              generateRegOptions.isPending ||
              verifyRegistration.isPending
            }
            className="w-full"
          >
            {isRegistering ? "Registering..." : "Add Passkey"}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback Messages */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Registered Passkeys List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Passkeys</CardTitle>
        </CardHeader>
        <CardContent>
          {passkeys.length === 0 ? (
            <p className="text-muted-foreground">
              No passkeys registered yet. Add one above to enable biometric
              check-ins.
            </p>
          ) : (
            <ul className="space-y-3">
              {passkeys.map((passkey) => (
                <li
                  key={passkey.id}
                  className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {passkey.name ?? "Unnamed Passkey"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDeviceType(passkey.deviceType)} &bull;{" "}
                      {formatDate(passkey.createdAt)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeletePasskey(passkey.id)}
                    disabled={deletePasskey.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
