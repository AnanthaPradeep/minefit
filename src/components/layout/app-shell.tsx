"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Activity, Bell, Dumbbell, House, Menu, Salad, Settings, Waves, X } from "lucide-react";
import { calculateBmi, getBmiInsight } from "@/lib/bmi";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/store";

const hideNavExact = ["/", "/onboarding"];
const hideNavPrefix = ["/setup"];

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: House, mobileTab: true },
  { to: "/diet", label: "Diet Planner", icon: Salad, mobileTab: true },
  { to: "/workouts", label: "Workouts", icon: Dumbbell, mobileTab: true },
  { to: "/yoga", label: "Yoga", icon: Waves, mobileTab: true },
  { to: "/progress", label: "Progress", icon: Activity, mobileTab: true },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

const footerLinks = [
  { to: "/dashboard", label: "Home" },
  { to: "/settings", label: "Settings" },
  { to: "/privacy", label: "Privacy" },
  { to: "/settings#privacy-controls", label: "Data Export" },
  { to: "/terms", label: "Terms" },
  { to: "/support", label: "Support" },
];

const HEADER_LOGO = `${import.meta.env.BASE_URL}assets/images/logo.png`;
const SIDEBAR_LOGO = `${import.meta.env.BASE_URL}assets/images/logo1.png`;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useAppStore((state) => state.currentUser);
  const bmiProfile = useAppStore((state) => state.settings?.bmiThresholdProfile ?? "standard");
  const recentWeight = useAppStore((state) => state.progressEntries[0]?.weight);
  const showNav =
    !hideNavExact.includes(pathname) &&
    !hideNavPrefix.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  const mobileTabs = navItems.filter((item) => item.mobileTab);
  const activeItem = useMemo(
    () => navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)),
    [pathname],
  );
  const bmi = user ? calculateBmi(user.height, recentWeight ?? user.weight) : null;
  const bmiInsight = getBmiInsight({ age: user?.age ?? 25, bmi, profile: bmiProfile });

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!showNav) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <main className="mx-auto w-full max-w-md px-4 py-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <Link
          to="/dashboard"
          className="mb-7 flex items-center justify-center gap-3 rounded-2xl px-3 py-2.5 text-white transition-transform duration-200 hover:scale-[1.01]"
        >
          <img
            src={SIDEBAR_LOGO}
            alt="MineFit brand"
            className="h-auto w-auto object-contain"
            loading="eager"
          />
        </Link>

        {user ? (
          <div className="mb-4 rounded-xl bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
            <p className="font-semibold text-zinc-700 dark:text-zinc-200">BMI {bmi ?? "--"}</p>
            <p className="text-zinc-500 dark:text-zinc-400">{bmiInsight.label} • Risk: {bmiInsight.risk}</p>
          </div>
        ) : null}

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                    isActive
                      ? "bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                  )
                }
              >
                <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/90 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800/90 dark:bg-zinc-900/95 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-xl border border-zinc-200 p-2 text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={HEADER_LOGO}
              alt="MineFit logo"
              className="h-12 w-15 rounded-md object-contain"
              loading="eager"
            />
            <p className="text-sm font-semibold tracking-tight">{activeItem?.label ?? "MineFit"}</p>
          </div>
          <Link
            to="/settings"
            className="rounded-xl border border-zinc-200 p-2 text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <header className="hidden items-center justify-between border-b border-zinc-200/90 bg-white/95 px-6 py-4 backdrop-blur dark:border-zinc-800/90 dark:bg-zinc-900/95 lg:flex">
          <div className="flex items-center gap-3">
            <img
              src={HEADER_LOGO}
              alt="MineFit logo"
              className="h-12 w-15 rounded-md object-contain"
              loading="eager"
            />
            <h1 className="text-xl font-semibold tracking-tight">{activeItem?.label ?? "MineFit"}</h1>
          </div>
          <Link
            to="/settings"
            className="rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            App Settings
          </Link>
        </header>

        <main className={cn("mx-auto w-full max-w-3xl flex-1 px-4 pt-3 lg:max-w-5xl lg:px-6 lg:pt-5 xl:max-w-6xl", showNav ? "pb-20 lg:pb-6" : "pb-4")}>{children}</main>

        <footer className="border-t border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 lg:px-6 lg:py-4" role="contentinfo">
          <div className="mx-auto w-full max-w-6xl space-y-2 lg:space-y-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <p className="font-medium tracking-wide">MineFit • Private & Local • On-device by default</p>
              <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5" aria-label="Footer links">
                {footerLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="transition-colors duration-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:hover:text-zinc-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Not medical advice. For wellness guidance only.</p>
          </div>
        </footer>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-zinc-950/45"
            aria-label="Close navigation"
          />
          <aside className="relative h-full w-72 border-r border-zinc-200 bg-white px-4 py-5 shadow-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold tracking-tight text-white transition-transform duration-200 hover:scale-[1.01]"
              >
                <img
                  src={SIDEBAR_LOGO}
                  alt="MineFit brand"
                  className="h-auto w-auto object-contain"
                  loading="eager"
                />
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl border border-zinc-200 p-2 text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {user ? (
              <div className="mb-4 rounded-xl bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
                <p className="font-semibold text-zinc-700 dark:text-zinc-200">BMI {bmi ?? "--"}</p>
                <p className="text-zinc-500 dark:text-zinc-400">{bmiInsight.label} • Risk: {bmiInsight.risk}</p>
              </div>
            ) : null}

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                        isActive
                          ? "bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                      )
                    }
                  >
                    <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}

      <BottomNav items={mobileTabs} hidden={drawerOpen} />
    </div>
  );
}
