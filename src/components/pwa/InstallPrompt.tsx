"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl bg-white/10 p-4 backdrop-blur-lg">
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
