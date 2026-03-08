"use client";

import { useEffect } from "react";
import { useAppStore } from "@/state/store";

export function AppBootstrap() {
  const darkMode = useAppStore((state) => state.ui.darkMode);

  useEffect(() => {
    useAppStore.getState().bootstrap();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

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
