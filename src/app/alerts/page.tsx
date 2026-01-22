import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { AlertList } from "./alert-list";

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch alerts data for SSR
  void api.alert.list.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-bold">Alert History</h1>
          <p className="text-lg text-muted-foreground">
            View and manage your check-in alerts
          </p>
          <AlertList />
        </div>
      </main>
    </HydrateClient>
  );
}
