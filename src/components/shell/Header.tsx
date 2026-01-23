"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { LogOut, Settings, ChevronDown } from "lucide-react"
import { HeartIcon } from "~/components/ui/heart"
import { cn } from "~/lib/utils"

export function Header() {
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? session?.user?.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <HeartIcon size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">ALVIN</h1>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          )}

          {status === "unauthenticated" && (
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
          )}

          {status === "authenticated" && session?.user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors",
                  dropdownOpen ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <span className="text-sm font-semibold text-white">{userInitial}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-white/60 transition-transform duration-200",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="rounded-xl bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                      <p className="text-sm font-medium text-white truncate">
                        {session.user.name ?? "User"}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
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
  )
}
