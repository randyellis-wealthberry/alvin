"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Error boundary caught:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-gray-300">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-white/10 px-6 py-3 font-semibold transition hover:bg-white/20"
      >
        Try again
      </button>
    </div>
  );
}
