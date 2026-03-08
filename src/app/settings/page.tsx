"use client";

import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AppExportPayload } from "@/lib/types";
import { useAppStore } from "@/state/store";

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const user = useAppStore((state) => state.currentUser);
  const darkMode = useAppStore((state) => state.ui.darkMode);
  const setDarkMode = useAppStore((state) => state.setDarkMode);
  const exportData = useAppStore((state) => state.exportData);
  const importData = useAppStore((state) => state.importData);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (window.location.hash !== "#privacy-controls") return;
    const element = document.getElementById("privacy-controls");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const profileUpdated = searchParams.get("updated") === "profile";

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Settings</CardTitle>
        <CardDescription className="mt-1">Edit profile, export local data, clear data, and dark mode</CardDescription>
      </Card>

      <Card>
        <CardTitle>Profile</CardTitle>
        {profileUpdated ? <CardDescription className="mt-1 text-emerald-700 dark:text-emerald-300">Profile updated successfully.</CardDescription> : null}
        <CardDescription className="mt-2">
          {user ? `${user.name} • ${user.age} yrs • ${user.height} cm • ${user.weight} kg` : "No profile setup yet"}
        </CardDescription>
        <Link to="/settings/profile" className="mt-3 block">
          <Button className="w-full" variant="outline">
            Edit Profile
          </Button>
        </Link>
      </Card>

      <Card id="privacy-controls">
        <CardTitle>Privacy Controls</CardTitle>
        <div className="mt-3 grid gap-2">
          <Button onClick={() => exportData()}>Export Data (JSON)</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const parsed = JSON.parse(text) as AppExportPayload;
              await importData(parsed);
              event.currentTarget.value = "";
            }}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Import / Restore Data
          </Button>
          <Button variant="secondary" onClick={() => setDarkMode(!darkMode)}>
            Dark Mode: {darkMode ? "On" : "Off"}
          </Button>
          <Button variant="outline" onClick={() => clearAllData()}>
            Clear Local Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
