"use client";

import type { UIMessage } from "ai";
import { C1Component } from "@thesysai/genui-sdk";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p className="text-lg">Hi! I&apos;m ALVIN.</p>
          <p className="mt-2 text-sm">How are you doing today?</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "user" ? (
            <div className="max-w-[80%] rounded-lg bg-blue-500 p-3 text-white">
              {message.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          ) : (
            <div className="max-w-[80%] rounded-lg bg-gray-100 p-3 text-gray-900">
              <C1Component
                c1Response={message.parts
                  .filter(
                    (p): p is { type: "text"; text: string } => p.type === "text",
                  )
                  .map((p) => p.text)
                  .join("")}
                isStreaming={isLoading && index === messages.length - 1}
              />
            </div>
          )}
        </div>
      ))}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex justify-start">
          <div className="rounded-lg bg-gray-100 p-3 text-gray-500">
            ALVIN is thinking...
          </div>
        </div>
      )}
    </div>
  );
}
