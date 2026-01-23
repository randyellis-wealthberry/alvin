"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MessageCircle,
  Plus,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2,
  Heart,
  Bot,
} from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard Component
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue"
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        glow && `shadow-2xl ${glowColors[glow]}`,
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Card
// ─────────────────────────────────────────────────────────────────────────────

function ConversationCard({
  conversation,
  index,
}: {
  conversation: {
    id: string
    createdAt: Date
    updatedAt: Date
    checkInId: string | null
    messages: { id: string; content: string; createdAt: Date }[]
  }
  index: number
}) {
  const lastActivity = conversation.updatedAt ?? conversation.createdAt
  const lastMessage = conversation.messages[0]
  const title = lastMessage?.content?.slice(0, 50) ?? "New Conversation"

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className="block animate-reveal"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <GlassCard className="p-4 hover:border-white/10 hover:bg-white/[0.05] transition-all group">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-blue-300" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white truncate">
                {title}
              </h3>
              {conversation.checkInId && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                  <Heart className="w-3 h-3" fill="currentColor" />
                  Check-in
                </span>
              )}
            </div>
            <p className="text-sm text-white/50 truncate">
              Tap to continue conversation
            </p>
          </div>

          {/* Time & Arrow */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">
              {formatRelativeTime(new Date(lastActivity))}
            </span>
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Chat Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [mounted, setMounted] = useState(false)

  const { data: conversations, isLoading } = api.conversation.list.useQuery()
  const utils = api.useUtils()

  const createConversation = api.conversation.create.useMutation({
    onSuccess: async (data) => {
      await utils.conversation.invalidate()
      // Navigate to the new conversation
      window.location.href = `/chat/${data.id}`
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-4 pt-8 pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div
            className={cn(
              "mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-blue-400/80 uppercase mb-2">
                  AI Companion
                </p>
                <h1 className="text-3xl font-bold text-white">Chat with ALVIN</h1>
              </div>
              <button
                onClick={() => createConversation.mutate()}
                disabled={createConversation.isPending}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                  "bg-gradient-to-r from-blue-500 to-violet-600",
                  "text-white text-sm font-medium",
                  "shadow-lg shadow-blue-500/30",
                  "hover:shadow-blue-500/50 hover:scale-105",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {createConversation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                New Chat
              </button>
            </div>
            <p className="mt-2 text-white/50 text-sm">
              Talk about how you&apos;re feeling or just chat
            </p>
          </div>

          {/* ALVIN Introduction Card */}
          <div
            className={cn(
              "mb-6 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Hi, I&apos;m ALVIN
                  </h3>
                  <p className="text-sm text-white/60">
                    Your wellness companion. I&apos;m here to listen, support, and help
                    you check in when you&apos;re ready. Just say &quot;I&apos;m okay&quot; anytime to
                    record a check-in.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Loading */}
          {isLoading && (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                <p className="text-white/60">Loading conversations...</p>
              </div>
            </GlassCard>
          )}

          {/* Empty State */}
          {!isLoading && (!conversations || conversations.length === 0) && (
            <div
              className={cn(
                "transition-all duration-700 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <GlassCard className="p-10 text-center" glow="violet">
                <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No conversations yet
                </h3>
                <p className="text-white/60 mb-6 max-w-sm mx-auto">
                  Start a chat with ALVIN to share how you&apos;re feeling or just have a friendly conversation
                </p>
                <button
                  onClick={() => createConversation.mutate()}
                  disabled={createConversation.isPending}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
                    "bg-gradient-to-r from-blue-500 to-violet-600",
                    "text-white font-medium",
                    "shadow-lg shadow-violet-500/30",
                    "hover:shadow-violet-500/50",
                    "transition-all duration-300",
                    "disabled:opacity-50"
                  )}
                >
                  {createConversation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Start Your First Chat
                </button>
              </GlassCard>
            </div>
          )}

          {/* Conversation List */}
          {!isLoading && conversations && conversations.length > 0 && (
            <div
              className={cn(
                "space-y-3 transition-all duration-700 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-white/60" />
                <h2 className="text-lg font-semibold text-white">Recent Chats</h2>
              </div>
              {conversations.map((conversation, index) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Quick Tips */}
          <div
            className={cn(
              "mt-8 transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <GlassCard className="p-5">
              <h3 className="font-medium text-white mb-3">Try saying:</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "I'm feeling great today",
                  "I'm okay",
                  "I need someone to talk to",
                  "How can you help me?",
                ].map((prompt) => (
                  <span
                    key={prompt}
                    className="px-3 py-1.5 rounded-full bg-white/5 text-white/60 text-sm border border-white/10"
                  >
                    &quot;{prompt}&quot;
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
