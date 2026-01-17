import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { ContactList } from "./contact-list";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch contacts data for SSR
  void api.contact.list.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-bold">Trusted Contacts</h1>
          <p className="text-lg text-white/70">
            Manage the people who will be notified during alert escalation
          </p>
          <ContactList />
        </div>
      </main>
    </HydrateClient>
  );
}
