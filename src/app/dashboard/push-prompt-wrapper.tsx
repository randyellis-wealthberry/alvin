"use client";

import { useEffect, useState } from "react";
import { PushPermissionPrompt } from "~/components/push";

/**
 * Client-side wrapper that only renders PushPermissionPrompt
 * when service worker is available
 */
export function PushPromptWrapper() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if service worker and notifications are supported
    if ("serviceWorker" in navigator && "Notification" in window) {
      setIsSupported(true);
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  return <PushPermissionPrompt />;
}
