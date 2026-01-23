"use client";

import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  /** Whether to show the default gradient background. Set to false for pages with custom backgrounds. */
  showBackground?: boolean;
}

export function AppShell({ children, showBackground = false }: AppShellProps) {
  return (
    <div
      className={`min-h-screen text-white ${showBackground ? "bg-gradient-to-b from-[#2e026d] to-[#15162c]" : ""}`}
    >
      <Header />
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
