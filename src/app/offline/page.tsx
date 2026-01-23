"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Offline icon */}
        <Card className="rounded-full p-6">
          <svg
            className="text-muted-foreground h-16 w-16"
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
        </Card>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight">
          You&apos;re Offline
        </h1>

        {/* Message */}
        <p className="text-muted-foreground max-w-md text-lg">
          ALVIN needs an internet connection to check in and monitor your
          wellness. Please reconnect to continue.
        </p>

        {/* Retry button */}
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          size="lg"
        >
          Try Again
        </Button>

        {/* Tip */}
        <p className="text-muted-foreground/70 mt-8 text-sm">
          Tip: Your check-in history is cached for offline viewing
        </p>
      </div>
    </main>
  );
}
