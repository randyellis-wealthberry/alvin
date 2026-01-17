"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";
import Link from "next/link";
import { CheckInBanner } from "./CheckInBanner";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>;
}

export function ChatInterface({
  conversationId,
  initialMessages = [],
}: ChatInterfaceProps) {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId },
    }),
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text" as const, text: m.content }],
      createdAt: new Date(),
    })),
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col">
        <header className="flex items-center gap-4 border-b p-4">
          <Link href="/chat" className="text-blue-500 hover:underline">
            &larr; Back
          </Link>
          <div>
            <h1 className="text-xl font-semibold">ALVIN</h1>
            <p className="text-sm text-gray-500">Your wellness companion</p>
          </div>
        </header>

        <CheckInBanner conversationId={conversationId} />

        <MessageList messages={messages} isLoading={isLoading} />

        {error && (
          <div className="border-t border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error.message}
          </div>
        )}

        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </ThemeProvider>
  );
}
