"use client";

import { useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MediaCard } from "@/components/feature/media-card";
import { useAppStore } from "@/state/store";
import type { ExerciseCategory } from "@/lib/types";

const categoryOrder: ExerciseCategory[] = [
  "pre_meal",
  "post_meal",
  "free_hand",
  "dumbbell",
  "resistance_band",
  "kettlebell",
  "gym_barbell",
  "gym_machine",
  "cardio",
];

const labels: Record<ExerciseCategory, string> = {
  pre_meal: "Pre-Meal Activation",
  post_meal: "Post-Meal Recovery",
  free_hand: "Bodyweight Training",
  dumbbell: "Dumbbell Strength",
  resistance_band: "Resistance Band Training",
  kettlebell: "Kettlebell Power",
  gym_barbell: "Barbell Compound Lifts",
  gym_machine: "Machine-Based Strength",
  cardio: "Cardio Conditioning",
  yoga: "Yoga",
};

export default function AllExercisesPage() {
  const all = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category !== "yoga");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return all;
    return all.filter((exercise) => {
      const muscles = Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles.join(" ") : "";
      return (
        exercise.name.toLowerCase().includes(normalized) ||
        muscles.toLowerCase().includes(normalized) ||
        exercise.category.toLowerCase().includes(normalized)
      );
    });
  }, [all, query]);

  const grouped = useMemo(() => {
    const map = new Map<ExerciseCategory, typeof filtered>();
    categoryOrder.forEach((category) => map.set(category, []));
    filtered.forEach((exercise) => {
      const bucket = map.get(exercise.category);
      if (bucket) bucket.push(exercise);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>All Exercises</CardTitle>
        <CardDescription className="mt-1">
          Complete categorized workout list ({filtered.length} exercises)
        </CardDescription>
        <input
          className="mt-3 h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Search by exercise, muscle, or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Card>

      {categoryOrder.map((category) => {
        const list = grouped.get(category) ?? [];
        if (list.length === 0) return null;

        return (
          <Card key={category}>
            <CardTitle>{labels[category]}</CardTitle>
            <CardDescription className="mt-1">{list.length} exercises</CardDescription>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((exercise) => {
                const muscles = Array.isArray(exercise.targetMuscles)
                  ? exercise.targetMuscles.join(", ")
                  : "Full Body";
                return (
                  <MediaCard
                    key={exercise.id}
                    compact
                    title={exercise.name}
                    subtitle={`${exercise.difficulty} • ${exercise.duration} min`}
                    metaLeft={muscles}
                    metaRight={exercise.equipment}
                    imageUrl={exercise.imageUrl}
                    ctaLabel="Start"
                    ctaTo={`/workouts/player?id=${exercise.id}&mode=workout`}
                  />
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
