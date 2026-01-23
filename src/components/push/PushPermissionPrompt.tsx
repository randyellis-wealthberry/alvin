"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "~/trpc/react";

type PermissionState = "loading" | "prompt" | "denied" | "enabled" | "error";

/**
 * Convert a base64-encoded VAPID public key to a Uint8Array
 * Required for PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPermissionPrompt() {
  const [permissionState, setPermissionState] =
    useState<PermissionState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const utils = api.useUtils();

  // Query current push status
  const { data: pushStatus, isLoading: isLoadingStatus } =
    api.push.getStatus.useQuery();

  // Mutations
  const subscribeMutation = api.push.subscribe.useMutation({
    onSuccess: () => {
      void utils.push.getStatus.invalidate();
    },
  });

  const unsubscribeMutation = api.push.unsubscribe.useMutation({
    onSuccess: () => {
      void utils.push.getStatus.invalidate();
    },
  });

  // Check permission state and subscription status on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionState("error");
      setErrorMessage("Push notifications are not supported in this browser.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setPermissionState("error");
      setErrorMessage("Service Worker is not supported in this browser.");
      return;
    }

    // Check browser permission state
    const browserPermission = Notification.permission;

    if (browserPermission === "denied") {
      setPermissionState("denied");
      return;
    }

    if (browserPermission === "granted" && pushStatus?.enabled) {
      setPermissionState("enabled");
      return;
    }

    if (!isLoadingStatus) {
      if (pushStatus?.enabled) {
        setPermissionState("enabled");
      } else {
        setPermissionState("prompt");
      }
    }
  }, [pushStatus, isLoadingStatus]);

  // Handle enabling push notifications (two-step flow)
  const handleEnable = useCallback(async () => {
    setIsSubscribing(true);
    setErrorMessage(null);

    try {
      // Step 1: Request browser permission
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        setPermissionState("denied");
        setIsSubscribing(false);
        return;
      }

      if (permission !== "granted") {
        // User dismissed the prompt
        setIsSubscribing(false);
        return;
      }

      // Step 2: Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Step 3: Subscribe to push
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error("VAPID public key not configured");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Step 4: Send subscription to server
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Invalid subscription data");
      }

      await subscribeMutation.mutateAsync({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        userAgent: navigator.userAgent,
      });

      setPermissionState("enabled");
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      setPermissionState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to enable notifications",
      );
    } finally {
      setIsSubscribing(false);
    }
  }, [subscribeMutation]);

  // Handle disabling push notifications
  const handleDisable = useCallback(async () => {
    setIsUnsubscribing(true);
    setErrorMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;

        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await unsubscribeMutation.mutateAsync({ endpoint });
      }

      setPermissionState("prompt");
    } catch (error) {
      console.error("Failed to disable push notifications:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to disable notifications",
      );
    } finally {
      setIsUnsubscribing(false);
    }
  }, [unsubscribeMutation]);

  // Loading state
  if (permissionState === "loading" || isLoadingStatus) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-lg">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-white/70">Checking notification status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (permissionState === "error") {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">
                Unable to Enable Notifications
              </p>
              <p className="text-sm text-white/70">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setPermissionState("prompt")}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Denied state (browser blocked notifications)
  if (permissionState === "denied") {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Notifications Blocked</p>
              <p className="text-sm text-white/70">
                You previously blocked notifications. To enable them:
              </p>
            </div>
          </div>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-white/70">
            <li>Click the lock icon in your browser address bar</li>
            <li>Find &quot;Notifications&quot; in the permissions</li>
            <li>Change to &quot;Allow&quot;</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </div>
    );
  }

  // Enabled state (can disable)
  if (permissionState === "enabled") {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a855f7]/20">
              <svg
                className="h-5 w-5 text-[#a855f7]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Notifications Enabled</p>
              <p className="text-sm text-white/70">
                You&apos;ll receive check-in reminders and alerts
              </p>
            </div>
          </div>
          <button
            onClick={handleDisable}
            disabled={isUnsubscribing}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            {isUnsubscribing ? "Disabling..." : "Disable"}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Prompt state (initial, not yet asked)
  return (
    <div className="w-full max-w-md rounded-xl bg-white/10 p-6 backdrop-blur-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a855f7]/20">
            <svg
              className="h-5 w-5 text-[#a855f7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">
              Stay Connected with ALVIN
            </p>
            <p className="text-sm text-white/70">
              Get notified about check-in reminders and important alerts. Push
              notifications ensure you never miss a check-in.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleEnable}
            disabled={isSubscribing}
            className="rounded-lg bg-[#a855f7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9333ea] disabled:opacity-50"
          >
            {isSubscribing ? "Enabling..." : "Enable Notifications"}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
