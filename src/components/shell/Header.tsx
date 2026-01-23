"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { HeartIcon } from "~/components/ui/heart";
import { cn } from "~/lib/utils";

export function Header() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial =
    session?.user?.name?.charAt(0).toUpperCase() ??
    session?.user?.email?.charAt(0).toUpperCase() ??
    "U";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
            <HeartIcon size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            ALVIN
          </h1>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          )}

          {status === "unauthenticated" && (
            <Link
              href="/auth/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign In
            </Link>
          )}

          {status === "authenticated" && session?.user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                  dropdownOpen ? "bg-white/10" : "hover:bg-white/5",
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/20">
                  <span className="text-sm font-semibold text-white">
                    {userInitial}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/60 transition-transform duration-200",
                    dropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 mt-2 w-56 duration-200">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e]/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
                    {/* User Info */}
                    <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3">
                      <p className="truncate text-sm font-medium text-white">
                        {session.user.name ?? "User"}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
