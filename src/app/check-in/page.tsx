import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { CheckInButton } from "./check-in-button";
import { CheckInHistory } from "./check-in-history";

export default async function CheckInPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch check-in history and passkey status for SSR
  void api.checkIn.list.prefetch();
  void api.passkey.hasPasskeys.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-bold">Check In</h1>
          <p className="text-lg text-white/70">
            Let us know you&apos;re okay with a quick check-in
          </p>
          <CheckInButton />
          <div className="mt-8 w-full max-w-md">
            <CheckInHistory />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
