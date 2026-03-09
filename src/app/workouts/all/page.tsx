"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [timing, setTiming] = useState("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return all.filter((exercise) => {
      const muscles = Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles.join(" ") : "";
      const matchesSearch =
        !normalized ||
        exercise.name.toLowerCase().includes(normalized) ||
        muscles.toLowerCase().includes(normalized) ||
        exercise.category.toLowerCase().includes(normalized);
      const matchesCategory = category === "all" || exercise.category === category;
      const matchesDifficulty = difficulty === "all" || exercise.difficulty === difficulty;
      const matchesEquipment = equipment === "all" || exercise.equipment === equipment;
      const matchesTiming = timing === "all" || exercise.workoutTiming === timing;
      return matchesSearch && matchesCategory && matchesDifficulty && matchesEquipment && matchesTiming;
    });
  }, [all, category, difficulty, equipment, query, timing]);

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
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All Categories</option>
            <option value="pre_meal">Pre-Meal</option>
            <option value="post_meal">Post-Meal</option>
            <option value="free_hand">Free Hand</option>
            <option value="dumbbell">Dumbbell</option>
            <option value="resistance_band">Resistance Band</option>
            <option value="kettlebell">Kettlebell</option>
            <option value="gym_barbell">Gym Barbell</option>
            <option value="gym_machine">Gym Machine</option>
            <option value="cardio">Cardio</option>
          </select>
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="all">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={equipment} onChange={(event) => setEquipment(event.target.value)}>
            <option value="all">All Equipment</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="dumbbell">Dumbbell</option>
            <option value="resistance-band">Resistance Band</option>
            <option value="barbell">Barbell</option>
            <option value="machine">Machine</option>
          </select>
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={timing} onChange={(event) => setTiming(event.target.value)}>
            <option value="all">All Workout Timing</option>
            <option value="pre-meal">Pre-Meal</option>
            <option value="post-meal">Post-Meal</option>
            <option value="anytime">Anytime</option>
          </select>
          <Button
            className="col-span-2"
            variant="outline"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setDifficulty("all");
              setEquipment("all");
              setTiming("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
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

      {filtered.length === 0 ? (
        <Card>
          <CardDescription>No exercises match current filters. Try adjusting or resetting filters.</CardDescription>
        </Card>
      ) : null}
    </div>
  );
}
