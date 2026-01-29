"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { AlvinCrayonChat } from "~/components/chat/AlvinCrayonChat";

export default function ChatPage() {
  return (
    <>
      <Link
        href="/"
        aria-label="Back to home"
        className="fixed bottom-24 right-4 z-[100] flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white/5 text-white/50 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white/80"
      >
        <Home className="h-8 w-8" />
      </Link>
      <AlvinCrayonChat />
    </>
  );
}
