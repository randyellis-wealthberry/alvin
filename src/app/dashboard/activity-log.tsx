"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

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

function _getActivityIcon(type: string): string {
  switch (type) {
    case "check-in":
      return "checkmark"; // Will render as text icon
    case "alert":
      return "warning";
    case "conversation":
      return "chat";
    default:
      return "dot";
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case "check-in":
      return "bg-green-600";
    case "alert":
      return "bg-orange-600";
    case "conversation":
      return "bg-blue-600";
    default:
      return "bg-muted";
  }
}

function ActivityIcon({ type }: { type: string }) {
  const bgColor = getActivityColor(type);

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor}`}
    >
      {type === "check-in" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {type === "alert" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )}
      {type === "conversation" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )}
    </div>
  );
}

// Try to import Convex API - may not exist if not generated yet
let convexApi: { activities: { getRecentActivities: unknown } } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  convexApi = require("~/convex/_generated/api").api;
} catch {
  // Convex API not generated yet - will fallback to tRPC
}

// Check if Convex is configured via environment variable
const isConvexConfigured =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_CONVEX_URL;

export function ActivityLog() {
  const { data: session } = useSession();

  // Convex real-time subscription (if configured and API available)
  const convexActivities = useConvexQuery(
    convexApi?.activities?.getRecentActivities as unknown as never,
    isConvexConfigured && convexApi && session?.user?.id
      ? ({ userId: session.user.id, limit: 20 } as never)
      : "skip"
  );

  // tRPC fallback (used when Convex not configured)
  const { data: trpcActivities, isLoading: trpcLoading } =
    api.dashboard.getActivityLog.useQuery(
      { limit: 20 },
      { enabled: !isConvexConfigured || !convexApi }
    );

  // Map Convex data format to UI format (timestamps are numbers in Convex)
  const mappedConvexActivities = convexActivities
    ? (
        convexActivities as Array<{
          _id: string;
          type: string;
          description: string;
          timestamp: number;
        }>
      ).map((activity) => ({
        id: activity._id,
        type: activity.type,
        description: activity.description,
        timestamp: new Date(activity.timestamp),
      }))
    : null;

  // Use Convex data if available, else tRPC
  const activities = mappedConvexActivities ?? trpcActivities;
  const isLoading =
    isConvexConfigured && convexApi
      ? convexActivities === undefined
      : trpcLoading;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="w-full max-w-md">
        <h2 className="mb-4 text-2xl font-bold">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No activity yet. Start by checking in!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-2xl font-bold">Recent Activity</h2>

      {/* Activity Timeline */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1">
                  <p>{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeTime(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View All Links */}
      <div className="mt-6 flex justify-center gap-4">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/check-in">All Check-ins</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/alerts">All Alerts</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/chat">All Chats</Link>
        </Button>
      </div>
    </div>
  );
}
