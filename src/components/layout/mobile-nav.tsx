"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bell, Activity, MessageCircle } from "lucide-react";
import { cn } from "~/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  // Hide navigation on auth pages, full-screen chat, and onboarding
  if (
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/chat") ||
    pathname?.startsWith("/onboarding")
  ) {
    return null;
  }

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/check-in",
      label: "Check In",
      icon: Activity,
    },
    {
      href: "/chat",
      label: "ALVIN",
      icon: MessageCircle,
      isCenter: true,
    },
    {
      href: "/contacts",
      label: "Contacts",
      icon: Users,
    },
    {
      href: "/alerts",
      label: "Alerts",
      icon: Bell,
    },
  ];

  return (
    <div className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 flex h-20 items-center justify-around border-t border-white/10 px-4 pb-2 backdrop-blur-xl md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        if (link.isCenter) {
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 transition-all duration-300"
            >
              <div
                className={cn(
                  "bg-primary text-primary-foreground -mt-7 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-primary/40 transition-all",
                  isActive
                    ? "scale-110 ring-primary/50 ring-2 ring-offset-2 ring-offset-background"
                    : "hover:scale-105 hover:shadow-primary/60",
                )}
              >
                <Icon className={cn("h-7 w-7", isActive && "animate-pulse-glow")} />
              </div>
              <span className={cn("text-[10px] font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
                {link.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all duration-300",
              isActive
                ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
                isActive ? "bg-primary/10" : "bg-transparent",
              )}
            >
              <Icon
                className={cn("h-6 w-6", isActive && "animate-pulse-glow")}
              />
            </div>
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
