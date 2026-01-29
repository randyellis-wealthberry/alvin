"use client";

import { useCallback, useRef, useState } from "react";
import {
  useThreadListManager,
  type UserMessage,
  type Thread,
} from "@crayonai/react-core";
import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk";
import type { Theme } from "@crayonai/react-ui";
import "@crayonai/react-ui/styles/index.css";
import { api } from "~/trpc/react";
import { AlvinThinkComponent } from "./AlvinThinkComponent";
import { AlvinResponseFooter } from "./AlvinResponseFooter";
import { WellnessCheckInCard } from "./WellnessCheckInCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Deep Cosmos Theme — matches project branding
// ─────────────────────────────────────────────────────────────────────────────

const deepCosmosTheme: Theme = {
  // Backgrounds
  backgroundFills: "transparent",
  containerFills: "rgba(255, 255, 255, 0.03)",
  containerHoverFills: "rgba(255, 255, 255, 0.06)",
  overlayFills: "rgba(0, 0, 0, 0.6)",
  sunkFills: "rgba(255, 255, 255, 0.02)",
  elevatedFills: "rgba(255, 255, 255, 0.05)",

  // Brand / interactive fills
  brandElFills: "#0ea5e9",
  brandElHoverFills: "#38bdf8",
  dangerFills: "#ef4444",
  successFills: "#10b981",
  infoFills: "#6366f1",

  // Strokes
  strokeDefault: "rgba(255, 255, 255, 0.08)",
  strokeInteractiveEl: "#0ea5e9",
  strokeInteractiveElHover: "#38bdf8",
  strokeInteractiveElSelected: "#7c3aed",

  // Text
  brandText: "#0ea5e9",
  brandSecondaryText: "#a78bfa",
  primaryText: "#f0f9ff",
  secondaryText: "rgba(255, 255, 255, 0.5)",
  disabledText: "rgba(255, 255, 255, 0.25)",
  dangerText: "#f87171",
  successText: "#34d399",
  linkText: "#38bdf8",
  infoText: "#818cf8",

  // Chat-specific
  chatContainerBg: "transparent",
  chatAssistantResponseBg: "rgba(255, 255, 255, 0.04)",
  chatAssistantResponseText: "rgba(255, 255, 255, 0.9)",
  chatUserResponseBg: "rgba(139, 92, 246, 0.15)",
  chatUserResponseText: "#ede9fe",

  // Typography
  fontPrimary: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",

  // Layout
  roundedClickable: "0.75rem",
  roundedM: "0.75rem",
  roundedL: "1rem",
  roundedXl: "1.25rem",

  // Effects
  shadowM: "0 4px 12px rgba(14, 165, 233, 0.1)",
  shadowL: "0 8px 24px rgba(14, 165, 233, 0.15)",
};

// ─────────────────────────────────────────────────────────────────────────────
// AlvinCrayonChat Component
// ─────────────────────────────────────────────────────────────────────────────

export function AlvinCrayonChat() {
  const utils = api.useUtils();
  const createConversation = api.conversation.create.useMutation();
  const deleteConversation = api.conversation.delete.useMutation();

  // Delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const deleteResolverRef = useRef<{
    resolve: () => void;
    reject: () => void;
  } | null>(null);

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteConversation.mutateAsync({ id: pendingDeleteId });
      deleteResolverRef.current?.resolve();
    }
    setPendingDeleteId(null);
    deleteResolverRef.current = null;
  };

  const handleCancelDelete = () => {
    deleteResolverRef.current?.reject();
    setPendingDeleteId(null);
    deleteResolverRef.current = null;
  };

  // Thread list management — connected to tRPC for persistence
  const threadListManager = useThreadListManager({
    fetchThreadList: useCallback(async (): Promise<Thread[]> => {
      const conversations = await utils.conversation.list.fetch();
      return (conversations ?? []).map((c) => ({
        threadId: c.id,
        title: c.messages[0]?.content?.slice(0, 50) ?? "New Conversation",
        createdAt: new Date(c.createdAt),
        isRunning: false,
      }));
    }, [utils.conversation.list]),

    createThread: useCallback(
      async (_firstMessage: UserMessage): Promise<Thread> => {
        const conversation = await createConversation.mutateAsync();
        return {
          threadId: conversation.id,
          title: _firstMessage.message?.slice(0, 50) ?? "New Conversation",
          createdAt: new Date(conversation.createdAt),
        };
      },
      [createConversation],
    ),

    deleteThread: useCallback(
      async (threadId: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          setPendingDeleteId(threadId);
          deleteResolverRef.current = { resolve, reject };
        });
      },
      [],
    ),

    updateThread: useCallback(
      async (updated: Thread): Promise<Thread> => updated,
      [],
    ),

    onSwitchToNew: useCallback(() => {
      return;
    }, []),

    onSelectThread: useCallback((_threadId: string) => {
      return;
    }, []),
  });

  return (
    <>
      <ThemeProvider mode="dark" darkTheme={deepCosmosTheme}>
        <C1Chat
          apiUrl="/api/crayon-chat"
          threadListManager={threadListManager}
          agentName="ALVIN"
          formFactor="full-page"
          scrollVariant="user-message-anchor"
          customizeC1={{
            thinkComponent: AlvinThinkComponent,
            responseFooterComponent: AlvinResponseFooter,
            customComponents: { WellnessCheckInCard },
          }}
        />
      </ThemeProvider>

      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
      >
        <AlertDialogContent className="border-white/10 bg-[#1a1a2e] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              This will permanently delete this conversation and all its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteConversation.isPending}
            >
              {deleteConversation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
