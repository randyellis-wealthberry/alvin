"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Sparkles,
  Heart,
  Loader2,
  Bot,
  User,
  Check,
} from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isUser,
  showCheckIn,
}: {
  message: {
    id: string
    content: string
    role: string
    createdAt: Date
  }
  isUser: boolean
  showCheckIn?: boolean
}) {
  return (
    <div
      className={cn(
        "flex gap-3 animate-reveal",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
          isUser
            ? "bg-violet-500/30"
            : "bg-gradient-to-br from-blue-500/30 to-violet-500/30"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-violet-300" />
        ) : (
          <Bot className="w-4 h-4 text-blue-300" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-violet-500/20 border border-violet-500/20"
            : "bg-white/[0.05] border border-white/[0.05]"
        )}
      >
        <p className={cn("text-sm", isUser ? "text-violet-100" : "text-white/90")}>
          {message.content}
        </p>

        {/* Check-in badge */}
        {showCheckIn && (
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400">Check-in recorded</span>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-white/30 mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing Indicator
// ─────────────────────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-reveal">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center">
        <Bot className="w-4 h-4 text-blue-300" />
      </div>
      <div className="bg-white/[0.05] border border-white/[0.05] rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Conversation Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string

  const [input, setInput] = useState("")
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const utils = api.useUtils()

  const { data: conversation, isLoading } = api.conversation.getById.useQuery({
    id: conversationId,
  })

  const sendMessage = api.conversation.saveMessages.useMutation({
    onSuccess: () => {
      setInput("")
      void utils.conversation.getById.invalidate({ id: conversationId })
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMessage.isPending) return

    sendMessage.mutate({
      conversationId,
      messages: [{ role: "user", content: input.trim() }],
    })
  }

  const handleQuickReply = (text: string) => {
    sendMessage.mutate({
      conversationId,
      messages: [{ role: "user", content: text }],
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header
          className={cn(
            "sticky top-0 z-40 px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-xl transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => router.push("/chat")}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">ALVIN</h1>
                <p className="text-xs text-white/50">Your wellness companion</p>
              </div>
            </div>
            {conversation?.checkInId && (
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <Heart className="w-3 h-3" fill="currentColor" />
                Check-in
              </span>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* Welcome message if no messages yet */}
                {(!conversation?.messages || conversation.messages.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Start chatting with ALVIN
                    </h2>
                    <p className="text-white/60 text-sm max-w-sm mx-auto mb-6">
                      Share how you&apos;re feeling, ask for support, or just have a friendly conversation
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
                          className="px-4 py-2 rounded-full bg-white/5 text-white/70 text-sm border border-white/10 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message list */}
                {conversation?.messages?.map((message: { id: string; content: string; role: string; createdAt: Date }, i: number) => (
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
                ))}

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
            "sticky bottom-0 px-4 py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessage.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || sendMessage.isPending}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  "bg-gradient-to-r from-blue-500 to-violet-600",
                  "text-white shadow-lg shadow-blue-500/30",
                  "hover:shadow-blue-500/50 hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                )}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
