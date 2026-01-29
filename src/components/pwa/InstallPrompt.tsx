"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALLED_KEY = "alvin-pwa-installed";
const DISMISSED_KEY = "install-prompt-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Already running as installed PWA — never show
    if (isStandalone()) {
      localStorage.setItem(INSTALLED_KEY, "true");
      return;
    }

    // Was installed before but no longer standalone — user uninstalled
    if (localStorage.getItem(INSTALLED_KEY)) {
      localStorage.removeItem(INSTALLED_KEY);
    }

    // User clicked "Later" this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "true");
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-xl bg-white/10 p-4 backdrop-blur-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-white">Install ALVIN</p>
          <p className="text-sm text-white/70">
            Add to your home screen for quick access
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-[#a855f7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9333ea]"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
