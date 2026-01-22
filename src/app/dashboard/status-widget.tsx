"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

// Try to import Convex API - may not exist if not generated yet
let convexApi: { alerts: { getUserStatus: unknown } } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  convexApi = require("~/convex/_generated/api").api;
} catch {
  // Convex API not generated yet - will fallback to tRPC
}

// Check if Convex is configured via environment variable
const isConvexConfigured =
  typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_CONVEX_URL;

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
  if (daysUntilDue === null) return "text-muted-foreground";
  if (daysUntilDue < 0) return "text-red-500"; // Overdue
  if (daysUntilDue < 1) return "text-yellow-500"; // Less than 24 hours
  return "text-green-500"; // More than 24 hours
}

function getAlertLevelBadgeStyle(level: string): string {
  switch (level) {
    case "LEVEL_1":
      return "bg-yellow-600 text-white border-transparent";
    case "LEVEL_2":
      return "bg-orange-600 text-white border-transparent";
    case "LEVEL_3":
      return "bg-red-600 text-white border-transparent";
    case "LEVEL_4":
      return "bg-red-800 text-white border-transparent";
    default:
      return "";
  }
}

export function StatusWidget() {
  const { data: session } = useSession();

  // Convex real-time subscription (if configured and API available)
  const convexStatus = useConvexQuery(
    convexApi?.alerts?.getUserStatus as unknown as never,
    isConvexConfigured && convexApi && session?.user?.id
      ? ({ userId: session.user.id } as never)
      : "skip"
  );

  // tRPC fallback (used when Convex not configured)
  const { data: trpcStatus, isLoading: trpcLoading } =
    api.dashboard.getStatus.useQuery(undefined, {
      enabled: !isConvexConfigured || !convexApi,
    });

  // Map Convex data format to UI format (timestamps are numbers in Convex)
  // Convex provides: lastCheckIn, nextDue, alertLevel, alertTriggeredAt
  const mappedConvexStatus = convexStatus
    ? {
        lastCheckIn: (convexStatus as { lastCheckIn?: number }).lastCheckIn
          ? new Date((convexStatus as { lastCheckIn: number }).lastCheckIn)
          : null,
        nextDue: (convexStatus as { nextDue?: number }).nextDue
          ? new Date((convexStatus as { nextDue: number }).nextDue)
          : null,
        alertLevel: (convexStatus as { alertLevel?: string | null }).alertLevel,
        alertTriggeredAt: (convexStatus as { alertTriggeredAt?: number })
          .alertTriggeredAt
          ? new Date(
              (convexStatus as { alertTriggeredAt: number }).alertTriggeredAt
            )
          : null,
        // Compute derived fields to match tRPC status shape
        activeAlert: (convexStatus as { alertLevel?: string | null }).alertLevel
          ? {
              triggeredAt: (convexStatus as { alertTriggeredAt?: number })
                .alertTriggeredAt
                ? new Date(
                    (convexStatus as { alertTriggeredAt: number })
                      .alertTriggeredAt
                  )
                : new Date(),
            }
          : null,
        daysUntilDue: (convexStatus as { nextDue?: number }).nextDue
          ? Math.floor(
              ((convexStatus as { nextDue: number }).nextDue - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      }
    : null;

  // Use Convex data if available, else tRPC
  const status = mappedConvexStatus ?? trpcStatus;
  const isLoading =
    isConvexConfigured && convexApi ? convexStatus === undefined : trpcLoading;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No profile found. Please set up your profile first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const showCheckInPrompt = status.daysUntilDue !== null && status.daysUntilDue < 1;

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Your Status</h2>

      {/* Last Check-in Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Last Check-in
          </h3>
          {status.lastCheckIn ? (
            <div>
              <p className="text-xl font-semibold">
                {formatRelativeTime(new Date(status.lastCheckIn))}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(status.lastCheckIn).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No check-ins yet</p>
          )}
        </CardContent>
      </Card>

      {/* Next Check-in Due Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Next Check-in Due
          </h3>
          {status.nextDue ? (
            <div>
              <p
                className={`text-xl font-semibold ${getDueStatusColor(status.daysUntilDue)}`}
              >
                {formatFutureRelativeTime(new Date(status.nextDue))}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(status.nextDue).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Not scheduled</p>
          )}
        </CardContent>
      </Card>

      {/* Active Alert Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Alert Status
          </h3>
          {status.activeAlert ? (
            <div className="flex items-center gap-3">
              <Badge className={getAlertLevelBadgeStyle(status.alertLevel ?? "")}>
                {status.alertLevel?.replace("_", " ")}
              </Badge>
              <span className="text-muted-foreground">
                Since {formatRelativeTime(new Date(status.activeAlert.triggeredAt))}
              </span>
            </div>
          ) : (
            <p className="text-green-500">No active alerts</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Action */}
      {showCheckInPrompt && (
        <Button asChild className="w-full rounded-full" size="lg">
          <Link href="/check-in">Check In Now</Link>
        </Button>
      )}
    </div>
  );
}
