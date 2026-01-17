"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function formatFutureRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    // Overdue
    return "overdue";
  } else if (diffMins < 60) {
    return `in ${diffMins} minute${diffMins === 1 ? "" : "s"}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  } else {
    return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }
}

function getDueStatusColor(daysUntilDue: number | null): string {
  if (daysUntilDue === null) return "text-white/70";
  if (daysUntilDue < 0) return "text-red-400"; // Overdue
  if (daysUntilDue < 1) return "text-yellow-400"; // Less than 24 hours
  return "text-green-400"; // More than 24 hours
}

function getAlertLevelBadgeColor(level: string): string {
  switch (level) {
    case "LEVEL_1":
      return "bg-yellow-600";
    case "LEVEL_2":
      return "bg-orange-600";
    case "LEVEL_3":
      return "bg-red-600";
    case "LEVEL_4":
      return "bg-red-800";
    default:
      return "bg-gray-600";
  }
}

export function StatusWidget() {
  const { data: status, isLoading } = api.dashboard.getStatus.useQuery();

  if (isLoading) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6">
        <p className="text-center text-white/70">Loading status...</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6">
        <p className="text-center text-white/70">
          No profile found. Please set up your profile first.
        </p>
      </div>
    );
  }

  const showCheckInPrompt = status.daysUntilDue !== null && status.daysUntilDue < 1;

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Your Status</h2>

      {/* Last Check-in Card */}
      <div className="rounded-xl bg-white/10 p-4">
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-white/60">
          Last Check-in
        </h3>
        {status.lastCheckIn ? (
          <div>
            <p className="text-xl font-semibold">
              {formatRelativeTime(new Date(status.lastCheckIn))}
            </p>
            <p className="text-sm text-white/60">
              {new Date(status.lastCheckIn).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-white/70">No check-ins yet</p>
        )}
      </div>

      {/* Next Check-in Due Card */}
      <div className="rounded-xl bg-white/10 p-4">
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-white/60">
          Next Check-in Due
        </h3>
        {status.nextDue ? (
          <div>
            <p
              className={`text-xl font-semibold ${getDueStatusColor(status.daysUntilDue)}`}
            >
              {formatFutureRelativeTime(new Date(status.nextDue))}
            </p>
            <p className="text-sm text-white/60">
              {new Date(status.nextDue).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-white/70">Not scheduled</p>
        )}
      </div>

      {/* Active Alert Card */}
      <div className="rounded-xl bg-white/10 p-4">
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-white/60">
          Alert Status
        </h3>
        {status.activeAlert ? (
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium text-white ${getAlertLevelBadgeColor(status.alertLevel ?? "")}`}
            >
              {status.alertLevel?.replace("_", " ")}
            </span>
            <span className="text-white/60">
              Since {formatRelativeTime(new Date(status.activeAlert.triggeredAt))}
            </span>
          </div>
        ) : (
          <p className="text-green-400">No active alerts</p>
        )}
      </div>

      {/* Quick Action */}
      {showCheckInPrompt && (
        <Link
          href="/check-in"
          className="block w-full rounded-full bg-purple-600 py-3 text-center font-semibold transition hover:bg-purple-700"
        >
          Check In Now
        </Link>
      )}
    </div>
  );
}
