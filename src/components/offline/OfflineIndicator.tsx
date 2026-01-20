"use client";

import { useEffect, useState } from "react";

/**
 * Displays a banner at the top of the screen when the user is offline.
 * Uses navigator.onLine and online/offline events for real-time detection.
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial status (must be in useEffect for SSR safety)
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render when online
  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
      <span>You&apos;re offline — viewing cached data</span>
    </div>
  );
}
