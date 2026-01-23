"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
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

export function ActivityLog() {
  // Use tRPC for activity data
  const { data: activities, isLoading } = api.dashboard.getActivityLog.useQuery(
    {
      limit: 20,
    },
  );

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Loading activity...
          </p>
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
            <p className="text-muted-foreground text-center">
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
                className="bg-muted/50 flex items-start gap-3 rounded-lg p-3"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1">
                  <p>{activity.description}</p>
                  <p className="text-muted-foreground text-sm">
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
