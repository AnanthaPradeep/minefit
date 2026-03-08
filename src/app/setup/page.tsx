"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FitnessGoal } from "@/lib/types";
import { useAppStore } from "@/state/store";

const goals: { label: string; value: FitnessGoal }[] = [
  { label: "Weight loss", value: "weight_loss" },
  { label: "Weight gain", value: "weight_gain" },
  { label: "Maintain health", value: "maintain_health" },
  { label: "Improve fitness", value: "improve_fitness" },
  { label: "Yoga & flexibility", value: "yoga_flexibility" },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const createOrUpdateProfile = useAppStore((state) => state.createOrUpdateProfile);
  const [form, setForm] = useState({
    name: "",
    age: 25,
    height: 165,
    weight: 68,
    gender: "other" as "male" | "female" | "other",
    fitnessGoal: "maintain_health" as FitnessGoal,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>User Setup</CardTitle>
        <CardDescription className="mt-1">Complete once. All data stays local on device.</CardDescription>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
          />
          <Input
            type="number"
            placeholder="Height (cm)"
            value={form.height}
            onChange={(event) => setForm((prev) => ({ ...prev, height: Number(event.target.value) }))}
          />
          <Input
            type="number"
            placeholder="Weight (kg)"
            value={form.weight}
            onChange={(event) => setForm((prev) => ({ ...prev, weight: Number(event.target.value) }))}
          />

          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={form.gender}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                gender: event.target.value as "male" | "female" | "other",
              }))
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
              setForm((prev) => ({
                ...prev,
                fitnessGoal: event.target.value as FitnessGoal,
              }))
            }
          >
            {goals.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>

          <Button
            className="w-full"
            onClick={async () => {
              if (!form.name.trim()) return;
              await createOrUpdateProfile(form);
              navigate("/dashboard");
            }}
          >
            Save & Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
