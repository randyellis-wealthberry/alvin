"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-white">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Offline icon */}
        <div className="rounded-full bg-white/10 p-6">
          <svg
            className="h-16 w-16 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-1.414-3.536m1.414 3.536l-2.829 2.829M3 3l18 18"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight">
          You&apos;re Offline
        </h1>

        {/* Message */}
        <p className="max-w-md text-lg text-white/70">
          ALVIN needs an internet connection to check in and monitor your
          wellness. Please reconnect to continue.
        </p>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-[#a855f7] px-8 py-3 font-semibold text-white transition hover:bg-[#9333ea]"
        >
          Try Again
        </button>

        {/* Tip */}
        <p className="mt-8 text-sm text-white/50">
          Tip: Your check-in history is cached for offline viewing
        </p>
      </div>
    </main>
  );
}
