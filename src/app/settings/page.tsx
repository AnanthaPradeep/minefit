"use client";

import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { calculateBmi, convertCmToUnits, convertKgToUnits, getBmiInsight, getBmiRiskToneClass } from "@/lib/bmi";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AppExportPayload } from "@/lib/types";
import { useAppStore } from "@/state/store";

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const user = useAppStore((state) => state.currentUser);
  const recentWeight = useAppStore((state) => state.progressEntries[0]?.weight);
  const darkMode = useAppStore((state) => state.ui.darkMode);
  const settings = useAppStore((state) => state.settings);
  const setDarkMode = useAppStore((state) => state.setDarkMode);
  const setBmiThresholdProfile = useAppStore((state) => state.setBmiThresholdProfile);
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
  const units = settings?.units ?? "metric";
  const bmiProfile = settings?.bmiThresholdProfile ?? "standard";
  const bmiWeightKg = recentWeight ?? user?.weight ?? 0;
  const bmi = user ? calculateBmi(user.height, bmiWeightKg) : null;
  const bmiInsight = getBmiInsight({ age: user?.age ?? 25, bmi, profile: bmiProfile });
  const userHeight = user ? convertCmToUnits(user.height, units) : null;
  const userWeight = user ? convertKgToUnits(user.weight, units) : null;

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
          {user
            ? `${user.name} • ${user.age} yrs • ${userHeight} ${units === "imperial" ? "in" : "cm"} • ${userWeight} ${units === "imperial" ? "lb" : "kg"}`
            : "No profile setup yet"}
        </CardDescription>
        {user ? (
          <CardDescription className="mt-1">
            BMI: {bmi ?? "--"} • {bmiInsight.label} ({bmiInsight.range}) • <span className={getBmiRiskToneClass(bmiInsight.risk)}>Risk: {bmiInsight.risk}</span>
          </CardDescription>
        ) : null}
        {user && recentWeight ? <CardDescription className="mt-1">Based on latest progress weight entry.</CardDescription> : null}
        <Link to="/settings/profile" className="mt-3 block">
          <Button className="w-full" variant="outline">
            Edit Profile
          </Button>
        </Link>
      </Card>

      <Card>
        <CardTitle>BMI Settings</CardTitle>
        <CardDescription className="mt-1">BMI is a screening metric, not a medical diagnosis.</CardDescription>
        <div className="mt-3 space-y-2">
          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={bmiProfile}
            onChange={(event) => {
              void setBmiThresholdProfile(event.target.value as "standard" | "asian");
            }}
          >
            <option value="standard">Global standard thresholds</option>
            <option value="asian">Asian-adjusted thresholds</option>
          </select>
          {user && user.age < 20 ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">Teen mode: use BMI-for-age percentile charts for interpretation.</p>
          ) : null}
        </div>
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
