import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { OfflineIndicator } from "~/components/offline";
import { StatusWidget } from "./status-widget";
import { ActivityLog } from "./activity-log";
import { PushPromptWrapper } from "./push-prompt-wrapper";
import { LiveIndicator } from "./live-indicator";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch dashboard data for SSR
  void api.dashboard.getStatus.prefetch();
  void api.dashboard.getActivityLog.prefetch({ limit: 20 });

  return (
    <HydrateClient>
      <OfflineIndicator />
      <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
        <div className="container flex flex-col items-center gap-8 px-4 py-16">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <LiveIndicator />
          </div>
          <p className="text-lg text-muted-foreground">
            Your ALVIN status at a glance
          </p>

          <div className="flex w-full max-w-2xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
            <StatusWidget />
            <ActivityLog />
          </div>

          {/* Push notification prompt - positioned after main content */}
          <PushPromptWrapper />
        </div>
      </main>
    </HydrateClient>
  );
}
