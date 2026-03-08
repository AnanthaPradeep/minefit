"use client";

import { NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function BottomNav({ items, hidden = false }: { items: BottomNavItem[]; hidden?: boolean }) {
  const { pathname } = useLocation();

  if (items.length === 0 || hidden) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex w-full border-t border-zinc-200/90 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur dark:border-zinc-800/90 dark:bg-zinc-950/95 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "group flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors duration-200",
              active ? "text-emerald-600" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
            )}
          >
            <Icon className={cn("h-5 w-5 transition-transform duration-200", active ? "scale-105" : "group-hover:scale-105")} />
            <span className="tracking-wide">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
