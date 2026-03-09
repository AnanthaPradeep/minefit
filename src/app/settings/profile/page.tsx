"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateBmi, getBmiInsight } from "@/lib/bmi";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AppSettings, FitnessGoal, UserProfile } from "@/lib/types";
import { useAppStore } from "@/state/store";

const goals: { label: string; value: FitnessGoal }[] = [
  { label: "Weight loss", value: "weight_loss" },
  { label: "Weight gain", value: "weight_gain" },
  { label: "Maintain health", value: "maintain_health" },
  { label: "Improve fitness", value: "improve_fitness" },
  { label: "Yoga & flexibility", value: "yoga_flexibility" },
];

type Units = AppSettings["units"];

type ProfileForm = {
  name: string;
  avatarUrl: string;
  age: string;
  height: string;
  weight: string;
  gender: UserProfile["gender"];
  fitnessGoal: FitnessGoal;
  units: Units;
};

const CM_TO_IN = 0.3937008;
const KG_TO_LB = 2.2046226;

function fromProfile(user: UserProfile, units: Units): ProfileForm {
  const height = units === "imperial" ? (user.height * CM_TO_IN).toFixed(1) : String(user.height);
  const weight = units === "imperial" ? (user.weight * KG_TO_LB).toFixed(1) : String(user.weight);
  return {
    name: user.name,
    avatarUrl: user.avatarUrl ?? "",
    age: String(user.age),
    height,
    weight,
    gender: user.gender,
    fitnessGoal: user.fitnessGoal,
    units,
  };
}

function toMetricHeight(heightInput: number, units: Units) {
  return units === "imperial" ? Math.round(heightInput / CM_TO_IN) : Math.round(heightInput);
}

function toMetricWeight(weightInput: number, units: Units) {
  return units === "imperial" ? Number((weightInput / KG_TO_LB).toFixed(1)) : Number(weightInput.toFixed(1));
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.currentUser);
  const settingsUnits = useAppStore((state) => state.settings?.units ?? "metric");
  const bmiProfile = useAppStore((state) => state.settings?.bmiThresholdProfile ?? "standard");
  const createOrUpdateProfile = useAppStore((state) => state.createOrUpdateProfile);
  const setUnits = useAppStore((state) => state.setUnits);

  const [form, setForm] = useState<ProfileForm | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const initialSnapshot = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    const next = fromProfile(user, settingsUnits);
    setForm(next);
    initialSnapshot.current = JSON.stringify(next);
  }, [user, settingsUnits]);

  const isDirty = useMemo(() => {
    if (!form) return false;
    return JSON.stringify(form) !== initialSnapshot.current;
  }, [form]);

  const confirmLeaveIfDirty = () => {
    if (!isDirty) return true;
    return window.confirm("You have unsaved changes. Leave without saving?");
  };

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  if (!user || !form) {
    return null;
  }

  const heightLabel = form.units === "imperial" ? "Height (in)" : "Height (cm)";
  const weightLabel = form.units === "imperial" ? "Weight (lb)" : "Weight (kg)";
  const previewBmi = calculateBmi(toMetricHeight(Number(form.height), form.units), toMetricWeight(Number(form.weight), form.units));
  const previewBmiInsight = getBmiInsight({ age: Number(form.age), bmi: previewBmi, profile: bmiProfile });

  const validate = (candidate: ProfileForm) => {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};
    const age = Number(candidate.age);
    const height = Number(candidate.height);
    const weight = Number(candidate.weight);

    if (!candidate.name.trim() || candidate.name.trim().length < 2) {
      nextErrors.name = "Enter a valid name (at least 2 characters).";
    }

    if (!Number.isFinite(age) || age < 13 || age > 90) {
      nextErrors.age = "Age should be between 13 and 90.";
    }

    const minHeight = candidate.units === "imperial" ? 47 : 120;
    const maxHeight = candidate.units === "imperial" ? 91 : 230;
    if (!Number.isFinite(height) || height < minHeight || height > maxHeight) {
      nextErrors.height = `Height should be between ${minHeight} and ${maxHeight}.`;
    }

    const minWeight = candidate.units === "imperial" ? 66 : 30;
    const maxWeight = candidate.units === "imperial" ? 550 : 250;
    if (!Number.isFinite(weight) || weight < minWeight || weight > maxWeight) {
      nextErrors.weight = `Weight should be between ${minWeight} and ${maxWeight}.`;
    }

    if (candidate.avatarUrl.trim()) {
      try {
        const url = new URL(candidate.avatarUrl.trim());
        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors.avatarUrl = "Avatar URL must start with http or https.";
        }
      } catch {
        nextErrors.avatarUrl = "Enter a valid avatar URL.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription className="mt-1">Update personal details used for plans and recommendations.</CardDescription>
      </Card>

      <Card>
        <div className="mb-3 rounded-xl bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
          <p className="font-semibold">BMI Preview: {previewBmi ?? "--"} • {previewBmiInsight.label}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Risk: {previewBmiInsight.risk}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{previewBmiInsight.detail}</p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-lg font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            {form.avatarUrl.trim() ? (
              <img src={form.avatarUrl.trim()} alt="Profile avatar" className="h-full w-full object-cover" />
            ) : (
              <span>{form.name.trim().charAt(0).toUpperCase() || "U"}</span>
            )}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Avatar is optional. Use a direct image URL.</p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
          />
          {errors.name ? <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{errors.name}</p> : null}

          <Input
            placeholder="Avatar URL (optional)"
            value={form.avatarUrl}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, avatarUrl: event.target.value } : prev))}
          />
          {errors.avatarUrl ? <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{errors.avatarUrl}</p> : null}

          <Input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, age: event.target.value } : prev))}
          />
          {errors.age ? <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{errors.age}</p> : null}

          <Input
            type="number"
            step="0.1"
            placeholder={heightLabel}
            value={form.height}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, height: event.target.value } : prev))}
          />
          {errors.height ? <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{errors.height}</p> : null}

          <Input
            type="number"
            step="0.1"
            placeholder={weightLabel}
            value={form.weight}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, weight: event.target.value } : prev))}
          />
          {errors.weight ? <p className="-mt-2 text-xs text-red-600 dark:text-red-400">{errors.weight}</p> : null}

          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={form.gender}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      gender: event.target.value as UserProfile["gender"],
                    }
                  : prev,
              )
            }
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={form.fitnessGoal}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      fitnessGoal: event.target.value as FitnessGoal,
                    }
                  : prev,
              )
            }
          >
            {goals.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>

          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={form.units}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      units: event.target.value as Units,
                    }
                  : prev,
              )
            }
          >
            <option value="metric">Metric (cm, kg)</option>
            <option value="imperial">Imperial (in, lb)</option>
          </select>

          {status ? <p className="text-xs text-emerald-700 dark:text-emerald-300">{status}</p> : null}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (!confirmLeaveIfDirty()) return;
                navigate("/settings");
              }}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              disabled={saving}
              onClick={async () => {
                setStatus(null);
                if (!validate(form)) return;

                setSaving(true);
                await setUnits(form.units);
                await createOrUpdateProfile({
                  name: form.name.trim(),
                  avatarUrl: form.avatarUrl.trim() || undefined,
                  age: Number(form.age),
                  height: toMetricHeight(Number(form.height), form.units),
                  weight: toMetricWeight(Number(form.weight), form.units),
                  gender: form.gender,
                  fitnessGoal: form.fitnessGoal,
                });
                setSaving(false);
                setStatus("Profile saved successfully.");
                initialSnapshot.current = JSON.stringify(form);
                navigate("/settings?updated=profile", { replace: true });
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
