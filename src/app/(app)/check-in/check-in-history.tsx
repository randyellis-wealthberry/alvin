"use client"

import { CheckCircle2 } from "lucide-react"
import { api } from "~/trpc/react"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return "just now"
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  } else {
    return date.toLocaleDateString()
  }
}

function getMethodBadgeStyles(method: string): string {
  switch (method) {
    case "MANUAL":
      return "bg-blue-500/30 text-blue-200 hover:bg-blue-500/40"
    case "BIOMETRIC":
      return "bg-purple-500/30 text-purple-200 hover:bg-purple-500/40"
    case "CONVERSATION":
      return "bg-green-500/30 text-green-200 hover:bg-green-500/40"
    default:
      return "bg-gray-500/30 text-gray-200 hover:bg-gray-500/40"
  }
}

function formatMethodLabel(method: string): string {
  switch (method) {
    case "MANUAL":
      return "Manual"
    case "BIOMETRIC":
      return "Biometric"
    case "CONVERSATION":
      return "Chat"
    default:
      return method
  }
}

export function CheckInHistory() {
  const { data: checkIns, isLoading } = api.checkIn.list.useQuery()

  if (isLoading) {
    return (
      <div className="text-center text-white/50">Loading history...</div>
    )
  }

  if (!checkIns || checkIns.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-white/30" />
        <p className="text-white/70">No check-ins yet</p>
        <p className="mt-1 text-sm text-white/50">
          Press the button above to record your first check-in
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {checkIns.slice(0, 10).map((checkIn) => {
        const performedAt = new Date(checkIn.performedAt)
        return (
          <div
            key={checkIn.id}
            className={cn(
              "flex items-center justify-between rounded-xl p-4",
              "bg-white/10 transition-colors hover:bg-white/[0.12]"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium text-white">
                {formatRelativeTime(performedAt)}
              </span>
              <span
                className="text-sm text-white/50"
                title={performedAt.toLocaleString()}
              >
                {performedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <Badge className={getMethodBadgeStyles(checkIn.method)}>
              {formatMethodLabel(checkIn.method)}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}
