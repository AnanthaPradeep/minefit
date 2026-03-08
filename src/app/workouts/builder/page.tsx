"use client";

import { useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/feature/media-card";
import { useAppStore } from "../../../state/store";
import { useWorkoutModuleStore } from "@/state/workout-module-store";

export default function WorkoutBuilderPage() {
  const exercises = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category !== "yoga");
  const workoutPlans = useWorkoutModuleStore((state) => state.workoutPlans);
  const createWorkoutPlan = useWorkoutModuleStore((state) => state.createWorkoutPlan);

  const [title, setTitle] = useState("Custom Plan");
  const [planType, setPlanType] = useState<"custom" | "weekly" | "home" | "gym">("custom");
  const [selected, setSelected] = useState<string[]>([]);

  const selectedExercises = useMemo(
    () => exercises.filter((item) => selected.includes(item.id)),
    [exercises, selected],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Workout Builder</CardTitle>
        <CardDescription className="mt-1">Create custom workout plans, weekly plans, home/gym routines</CardDescription>
        <div className="mt-3 space-y-2">
          <input className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={title} onChange={(event) => setTitle(event.target.value)} />
          <select className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={planType} onChange={(event) => setPlanType(event.target.value as "custom" | "weekly" | "home" | "gym")}>
            <option value="custom">Custom Plan</option>
            <option value="weekly">Weekly Plan</option>
            <option value="home">Home Workout</option>
            <option value="gym">Gym Workout</option>
          </select>
          <Button
            className="w-full"
            onClick={() => {
              if (!title.trim() || selected.length === 0) return;
              createWorkoutPlan(title, planType, selected);
              setSelected([]);
            }}
          >
            Save Plan
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Select Exercises</CardTitle>
        <div className="mt-3 max-h-96 space-y-3 overflow-y-auto pr-1">
          {exercises.slice(0, 80).map((exercise) => {
            const active = selected.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                className={active ? "rounded-2xl border border-emerald-500 bg-emerald-50/30 p-1 dark:bg-emerald-900/20" : "rounded-2xl p-1"}
              >
                <MediaCard
                  compact
                  title={exercise.name}
                  subtitle={`${exercise.category.replace("_", " ")} • ${exercise.duration} min`}
                  metaLeft={exercise.difficulty}
                  metaRight={exercise.equipment}
                  imageUrl={exercise.imageUrl}
                  ctaLabel={active ? "Remove" : "Select"}
                  onCta={() => {
                    setSelected((prev) =>
                      prev.includes(exercise.id)
                        ? prev.filter((id) => id !== exercise.id)
                        : [...prev, exercise.id],
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Selected Plan Preview</CardTitle>
        <div className="mt-3 space-y-2 text-sm">
          {selectedExercises.length === 0 ? <p className="text-zinc-500">No exercise selected yet.</p> : null}
          {selectedExercises.map((exercise) => (
            <p key={exercise.id} className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">{exercise.name}</p>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Saved Plans</CardTitle>
        <div className="mt-3 space-y-2 text-sm">
          {workoutPlans.map((plan) => (
            <p key={plan.id} className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              {plan.title} • {plan.planType} • {plan.exerciseIds.length} exercises
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
