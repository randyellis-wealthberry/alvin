"use client";

import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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

function getMethodBadgeColor(method: string): string {
  switch (method) {
    case "MANUAL":
      return "bg-blue-600 text-white";
    case "BIOMETRIC":
      return "bg-purple-600 text-white";
    case "CONVERSATION":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

function formatMethodLabel(method: string): string {
  switch (method) {
    case "MANUAL":
      return "Manual";
    case "BIOMETRIC":
      return "Biometric";
    case "CONVERSATION":
      return "Conversation";
    default:
      return method;
  }
}

export function CheckInHistory() {
  const { data: checkIns, isLoading } = api.checkIn.list.useQuery();

  if (isLoading) {
    return (
      <div className="w-full max-w-md text-center text-muted-foreground">
        Loading history...
      </div>
    );
  }

  if (!checkIns || checkIns.length === 0) {
    return (
      <div className="w-full max-w-md text-center text-muted-foreground">
        No check-ins yet. Press the button above to check in!
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-semibold">Recent Check-ins</h2>
      <ul className="space-y-3">
        {checkIns.map((checkIn) => {
          const performedAt = new Date(checkIn.performedAt);
          return (
            <li
              key={checkIn.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
            >
              <div className="flex flex-col">
                <span className="text-foreground">
                  {formatRelativeTime(performedAt)}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  title={performedAt.toLocaleString()}
                >
                  {performedAt.toLocaleString()}
                </span>
              </div>
              <Badge className={getMethodBadgeColor(checkIn.method)}>
                {formatMethodLabel(checkIn.method)}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
