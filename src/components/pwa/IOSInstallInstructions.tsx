"use client";

import { useEffect, useState } from "react";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function IOSInstallInstructions() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari when not already installed
    if (isIOS() && !isInStandaloneMode()) {
      // Check if user dismissed before (localStorage)
      const dismissed = localStorage.getItem("ios-install-dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ios-install-dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-xl bg-white/10 p-4 backdrop-blur-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-white">Install ALVIN</p>
          <p className="mt-1 text-sm text-white/70">
            Tap{" "}
            <span className="inline-flex items-center">
              <svg
                className="mx-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </span>{" "}
            then &quot;Add to Home Screen&quot;
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
