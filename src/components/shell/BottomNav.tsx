"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Heart, Users, User, Home } from "lucide-react";
import { cn } from "~/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof MessageCircle;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/check-in", label: "Check In", icon: Heart },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
      {/* Gradient glow effect */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto flex h-[72px] max-w-lg items-center justify-around px-4 pb-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href === "/" && pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-300",
                isActive ? "text-white" : "text-white/40 hover:text-white/70",
              )}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
              )}

              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                  isActive ? "bg-white/10" : "bg-transparent",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
