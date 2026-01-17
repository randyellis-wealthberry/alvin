import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { PasskeySetup } from "./passkey-setup";

export default async function PasskeysPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch passkey data for SSR
  void api.passkey.list.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-white/70 hover:text-white"
            >
              &larr; Back to Settings
            </Link>
          </div>
          <h1 className="text-4xl font-bold">Passkey Management</h1>
          <p className="max-w-md text-center text-lg text-white/70">
            Set up passkeys to enable biometric check-ins using TouchID, FaceID,
            Windows Hello, or other device authenticators.
          </p>
          <PasskeySetup />
        </div>
      </main>
    </HydrateClient>
  );
}
