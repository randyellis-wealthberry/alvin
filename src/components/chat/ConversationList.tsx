"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function ConversationList() {
  const router = useRouter();
  const { data: conversations, isLoading } = api.conversation.list.useQuery();
  const createMutation = api.conversation.create.useMutation({
    onSuccess: (conversation) => {
      router.push(`/chat/${conversation.id}`);
    },
  });

  const handleNewConversation = () => {
    createMutation.mutate();
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-semibold">ALVIN</h1>
          <p className="text-sm text-gray-500">Your wellness companion</p>
        </div>
        <button
          onClick={handleNewConversation}
          disabled={createMutation.isPending}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          New Chat
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && <p className="text-gray-500">Loading...</p>}

        {conversations?.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p>No conversations yet.</p>
            <p className="mt-2 text-sm">Start a new chat with ALVIN!</p>
          </div>
        )}

        <div className="space-y-2">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => router.push(`/chat/${conv.id}`)}
              className="w-full rounded-lg border p-4 text-left hover:bg-gray-50"
            >
              <p className="font-medium">
                {conv.messages[0]?.content.slice(0, 50) ?? "New conversation"}
                {(conv.messages[0]?.content?.length ?? 0) > 50 ? "..." : ""}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
