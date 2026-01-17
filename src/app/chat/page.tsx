import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "~/components/chat/ChatInterface";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <ChatInterface />
    </main>
  );
}
