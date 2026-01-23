"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Heart,
  Loader2,
  Bot,
  User,
  Check,
} from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isUser,
  showCheckIn,
}: {
  message: {
    id: string;
    content: string;
    role: string;
    createdAt: Date;
  };
  isUser: boolean;
  showCheckIn?: boolean;
}) {
  return (
    <div
      className={cn(
        "animate-reveal flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl",
          isUser
            ? "bg-violet-500/30"
            : "bg-gradient-to-br from-blue-500/30 to-violet-500/30",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-violet-300" />
        ) : (
          <Bot className="h-4 w-4 text-blue-300" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "border border-violet-500/20 bg-violet-500/20"
            : "border border-white/[0.05] bg-white/[0.05]",
        )}
      >
        <p
          className={cn(
            "text-sm",
            isUser ? "text-violet-100" : "text-white/90",
          )}
        >
          {message.content}
        </p>

        {/* Check-in badge */}
        {showCheckIn && (
          <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30">
              <Check className="h-3 w-3 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400">Check-in recorded</span>
          </div>
        )}

        {/* Timestamp */}
        <p className="mt-1 text-xs text-white/30">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing Indicator
// ─────────────────────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="animate-reveal flex gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30">
        <Bot className="h-4 w-4 text-blue-300" />
      </div>
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.05] px-4 py-3">
        <div className="flex gap-1">
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-white/40"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-white/40"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-white/40"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Conversation Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const { data: conversation, isLoading } = api.conversation.getById.useQuery({
    id: conversationId,
  });

  const sendMessage = api.conversation.saveMessages.useMutation({
    onSuccess: () => {
      setInput("");
      void utils.conversation.getById.invalidate({ id: conversationId });
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    sendMessage.mutate({
      conversationId,
      messages: [{ role: "user", content: input.trim() }],
    });
  };

  const handleQuickReply = (text: string) => {
    sendMessage.mutate({
      conversationId,
      messages: [{ role: "user", content: text }],
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute -right-40 bottom-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen flex-col">
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-40 border-b border-white/5 bg-black/20 px-4 py-3 backdrop-blur-xl transition-all duration-500",
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          )}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-4">
            <button
              onClick={() => router.push("/chat")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">ALVIN</h1>
                <p className="text-xs text-white/50">Your wellness companion</p>
              </div>
            </div>
            {conversation?.checkInId && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                <Heart className="h-3 w-3" fill="currentColor" />
                Check-in
              </span>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                {/* Welcome message if no messages yet */}
                {(!conversation?.messages ||
                  conversation.messages.length === 0) && (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-white">
                      Start chatting with ALVIN
                    </h2>
                    <p className="mx-auto mb-6 max-w-sm text-sm text-white/60">
                      Share how you&apos;re feeling, ask for support, or just
                      have a friendly conversation
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "Hi ALVIN!",
                        "I'm feeling good today",
                        "I'm okay",
                        "Tell me something positive",
                      ].map((text) => (
                        <button
                          key={text}
                          onClick={() => handleQuickReply(text)}
                          disabled={sendMessage.isPending}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message list */}
                {conversation?.messages?.map(
                  (
                    message: {
                      id: string;
                      content: string;
                      role: string;
                      createdAt: Date;
                    },
                    i: number,
                  ) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isUser={message.role === "user"}
                      showCheckIn={
                        conversation.checkInId !== null &&
                        message.role === "assistant" &&
                        i === conversation.messages.length - 1
                      }
                    />
                  ),
                )}

                {/* Typing indicator */}
                {sendMessage.isPending && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <div
          className={cn(
            "sticky bottom-0 border-t border-white/5 bg-black/40 px-4 py-4 backdrop-blur-xl transition-all duration-500",
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessage.isPending}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || sendMessage.isPending}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                  "bg-gradient-to-r from-blue-500 to-violet-600",
                  "text-white shadow-lg shadow-blue-500/30",
                  "hover:scale-105 hover:shadow-blue-500/50",
                  "disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
