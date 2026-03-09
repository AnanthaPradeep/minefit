"use client";

import { useEffect } from "react";
import { notifyReminder, startReminderScheduler } from "@/lib/notifications";
import { useAppStore } from "@/state/store";

export function AppBootstrap() {
  const darkMode = useAppStore((state) => state.ui.darkMode);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    useAppStore.getState().bootstrap();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    if (!hydrated) return;

    const stop = startReminderScheduler({
      getReminders: () => useAppStore.getState().reminders,
      onDueReminder: async (reminder) => {
        const now = new Date().toISOString();
        await useAppStore.getState().markReminderTriggered(reminder.id, now);
        notifyReminder(reminder);
      },
      intervalMs: 30000,
    });

    return () => stop();
  }, [hydrated]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => {});
      });
    });

    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key).catch(() => {});
        });
      });
    }
  }, []);

  return null;
}
