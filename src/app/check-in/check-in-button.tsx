"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export function CheckInButton() {
  const [showSuccess, setShowSuccess] = useState(false);
  const utils = api.useUtils();

  const recordCheckIn = api.checkIn.record.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      void utils.checkIn.list.invalidate();
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => recordCheckIn.mutate()}
        disabled={recordCheckIn.isPending || showSuccess}
        className="flex h-32 w-32 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {recordCheckIn.isPending ? (
          <span className="animate-pulse">...</span>
        ) : showSuccess ? (
          <span className="text-2xl">&#10003;</span>
        ) : (
          "I'm OK"
        )}
      </button>
      {showSuccess && (
        <p className="text-lg font-semibold text-green-400">Checked in!</p>
      )}
      {recordCheckIn.isError && (
        <p className="text-red-400">
          Error: {recordCheckIn.error.message}
        </p>
      )}
    </div>
  );
}
