"use client";

import { Heart, CheckCircle } from "lucide-react";

interface WellnessCheckInCardProps {
  message?: string;
  timestamp?: string;
}

export function WellnessCheckInCard({
  message = "You're doing great! Your check-in has been recorded.",
  timestamp,
}: WellnessCheckInCardProps) {
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
          <Heart className="h-5 w-5 text-emerald-400" fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-emerald-300">
              Wellness Check-In
            </h4>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-sm text-emerald-200/80">{message}</p>
          {timestamp && (
            <p className="mt-1 text-xs text-emerald-400/60">{timestamp}</p>
          )}
        </div>
      </div>
    </div>
  );
}
