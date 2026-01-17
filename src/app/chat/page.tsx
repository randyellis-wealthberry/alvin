import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { ConversationList } from "~/components/chat/ConversationList";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch conversations
  void api.conversation.list.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <ConversationList />
      </main>
    </HydrateClient>
  );
}
