"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MediaCard } from "@/components/feature/media-card";
import { useAppStore } from "@/state/store";
import { getSmartWorkoutSuggestions } from "@/lib/workout-yoga-catalog";

export default function WorkoutsPage() {
  const exercises = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category !== "yoga");
  const user = useAppStore((state) => state.currentUser);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [timing, setTiming] = useState("all");

  const filtered = useMemo(() => {
    return exercises.filter((exercise) => {
      const muscleText = Array.isArray(exercise.targetMuscles)
        ? exercise.targetMuscles.join(" ")
        : "full body";
      const matchQuery =
        exercise.name.toLowerCase().includes(query.toLowerCase()) ||
        muscleText.toLowerCase().includes(query.toLowerCase());
      const matchDifficulty = difficulty === "all" || exercise.difficulty === difficulty;
      const matchEquipment = equipment === "all" || exercise.equipment === equipment;
      const matchTiming = timing === "all" || exercise.workoutTiming === timing;
      return matchQuery && matchDifficulty && matchEquipment && matchTiming;
    });
  }, [difficulty, equipment, exercises, query, timing]);

  const smart = useMemo(() => {
    if (!user) return [];
    return getSmartWorkoutSuggestions({
      level: "beginner",
      equipment: equipment === "all" ? ["all"] : [equipment],
      goal: user.fitnessGoal,
      minutesAvailable: 20,
    }).slice(0, 4);
  }, [equipment, user]);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Workout Dashboard</CardTitle>
        <CardDescription className="mt-1">Search, filter, build custom plans, and start guided workout</CardDescription>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/workouts/builder">
            <Button className="w-full" variant="outline">Open Workout Builder</Button>
          </Link>
          <Link to="/workouts/active">
            <Button className="w-full">Start Active Workout</Button>
          </Link>
          <Link to="/workouts/all" className="col-span-2">
            <Button className="w-full" variant="secondary">View All Exercises</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <CardTitle>Exercise Library</CardTitle>
        <div className="mt-3 space-y-2">
          <input
            className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Search by exercise or muscle"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
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
            <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 col-span-2" value={timing} onChange={(event) => setTiming(event.target.value)}>
              <option value="all">All Workout Timing</option>
              <option value="pre-meal">Pre-Meal</option>
              <option value="post-meal">Post-Meal</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>
        </div>
      </Card>

      {smart.length > 0 ? (
        <Card>
          <CardTitle>Smart Suggestions</CardTitle>
          <CardDescription className="mt-1">Based on your goal and available equipment</CardDescription>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {smart.map((exercise) => (
              <MediaCard
                key={exercise.id}
                compact
                title={exercise.name}
                subtitle={`${exercise.duration} min • ${exercise.category.replace("_", " ")}`}
                imageUrl={exercise.imageUrl}
                ctaLabel="Start"
                ctaTo={`/workouts/player?id=${exercise.id}&mode=workout`}
              />
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((exercise) => (
          <MediaCard
            key={exercise.id}
            title={exercise.name}
            subtitle={`${exercise.difficulty} • ${exercise.duration} min`}
            metaLeft={Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles.slice(0, 2).join(", ") : "Full Body"}
            metaRight={exercise.equipment}
            description={exercise.description}
            imageUrl={exercise.imageUrl}
            ctaLabel="Start Guided Workout"
            ctaTo={`/workouts/player?id=${exercise.id}&mode=workout`}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardDescription>No exercises match current filters.</CardDescription>
        </Card>
      ) : null}
    </div>
  );
}
