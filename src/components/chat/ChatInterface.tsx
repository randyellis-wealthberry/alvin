"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export function ChatInterface() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-xl font-semibold">ALVIN</h1>
        <p className="text-sm text-gray-500">Your wellness companion</p>
      </header>

      <MessageList messages={messages} isLoading={isLoading} />

      {error && (
        <div className="border-t border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </div>
      )}

      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
