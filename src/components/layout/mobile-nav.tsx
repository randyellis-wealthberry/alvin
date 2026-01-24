"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Users, Bell, Activity } from "lucide-react";
import { cn } from "~/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  // Hide navigation on auth pages
  if (pathname?.startsWith("/auth")) {
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
      href: "/",
      label: "Home",
      icon: Home,
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
    <div className="bg-[#15162c]/85 fixed right-0 bottom-0 left-0 z-50 flex h-20 items-center justify-around border-t border-white/10 px-4 pb-2 backdrop-blur-xl md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all duration-300",
              isActive
                ? "text-primary scale-110"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
                isActive ? "bg-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-transparent",
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
