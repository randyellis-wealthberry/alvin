"use client";

import { Sparkles } from "lucide-react";

interface ThinkItem {
  title: string;
  content: string;
  ephemeral: boolean;
}

interface ThinkStateProps {
  thinkItems: ThinkItem[];
  thinkingInProgress: boolean;
}

export function AlvinThinkComponent({
  thinkItems,
  thinkingInProgress,
}: ThinkStateProps) {
  return (
    <div className="flex items-start gap-3 px-2 py-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30">
        <Sparkles
          className={`h-4 w-4 text-cyan-400 ${thinkingInProgress ? "animate-pulse" : ""}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        {thinkingInProgress && thinkItems.length === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-cyan-300/80">
              ALVIN is thinking
            </span>
            <span className="flex gap-1">
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/60"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/60"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/60"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        )}
        {thinkItems.map((item, i) => (
          <div
            key={i}
            className="mb-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <p className="text-xs font-medium text-cyan-300/70">
              {item.title}
            </p>
            {item.content && (
              <p className="mt-0.5 text-xs text-white/40">{item.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
