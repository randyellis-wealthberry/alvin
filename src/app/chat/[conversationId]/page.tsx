import { auth } from "~/server/auth";
import { redirect, notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { ChatInterface } from "~/components/chat/ChatInterface";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const conversation = await api.conversation.getById({ id: conversationId });
  if (!conversation) {
    notFound();
  }

  // Convert DB messages to initial messages format
  const initialMessages = conversation.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return (
    <main className="flex min-h-screen flex-col">
      <ChatInterface
        conversationId={conversationId}
        initialMessages={initialMessages}
      />
    </main>
  );
}
