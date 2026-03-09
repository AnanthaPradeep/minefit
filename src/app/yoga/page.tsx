"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MediaCard } from "@/components/feature/media-card";
import { useAppStore } from "@/state/store";
import { yogaPoseCatalog } from "@/lib/workout-yoga-catalog";

export default function YogaPage() {
  const yogaList = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category === "yoga");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [duration, setDuration] = useState("all");
  const [bestTime, setBestTime] = useState("all");
  const [benefit, setBenefit] = useState("");

  const yogaCatalogMap = useMemo(() => new Map(yogaPoseCatalog.map((pose) => [pose.name, pose])), []);

  const getDurationBucket = (minutes: number) => {
    if (minutes <= 5) return "short";
    if (minutes <= 10) return "medium";
    return "long";
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedBenefit = benefit.trim().toLowerCase();

    return yogaList.filter((item) => {
      const pose = yogaCatalogMap.get(item.name);
      const poseCategory = pose?.category ?? "beginner";
      const poseBestTime = pose?.bestTime?.toLowerCase() ?? "";
      const poseBenefits = Array.isArray(pose?.benefits) ? pose.benefits.join(" ").toLowerCase() : "";

      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        poseCategory.includes(normalizedQuery);
      const matchesCategory = category === "all" || poseCategory === category;
      const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
      const matchesDuration = duration === "all" || getDurationBucket(item.duration) === duration;
      const matchesBestTime = bestTime === "all" || poseBestTime.includes(bestTime);
      const matchesBenefit =
        !normalizedBenefit ||
        poseBenefits.includes(normalizedBenefit) ||
        item.description.toLowerCase().includes(normalizedBenefit);

      return matchesQuery && matchesCategory && matchesDifficulty && matchesDuration && matchesBestTime && matchesBenefit;
    });
  }, [bestTime, benefit, category, difficulty, duration, query, yogaCatalogMap, yogaList]);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Yoga Library</CardTitle>
        <CardDescription className="mt-1">Guided breathing, pose timer, and flexibility progression</CardDescription>
        <div className="mt-3 space-y-2">
          <input
            className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Search by pose, description, or category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-10 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="relaxation">Relaxation</option>
              <option value="digestion">Digestion (After Meal)</option>
            </select>
            <select
              className="h-10 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="all">All Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              className="h-10 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="all">All Duration</option>
              <option value="short">Short (≤ 5 min)</option>
              <option value="medium">Medium (6-10 min)</option>
              <option value="long">Long (&gt; 10 min)</option>
            </select>
            <select
              className="h-10 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={bestTime}
              onChange={(event) => setBestTime(event.target.value)}
            >
              <option value="all">All Best Time</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="anytime">Anytime</option>
            </select>
            <input
              className="h-10 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Benefit (e.g. digestion, flexibility)"
              value={benefit}
              onChange={(event) => setBenefit(event.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setDifficulty("all");
                setDuration("all");
                setBestTime("all");
                setBenefit("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        <Link to="/yoga/all" className="mt-3 block">
          <Button className="w-full" variant="secondary">View All Yoga Poses</Button>
        </Link>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((exercise) => (
          <MediaCard
            key={exercise.id}
            title={exercise.name}
            subtitle={`${exercise.difficulty} • ${exercise.duration} min`}
            metaLeft="Mind-Body"
            metaRight={exercise.workoutTiming}
            description={exercise.description}
            imageUrl={exercise.imageUrl}
            ctaLabel="Start Yoga Practice"
            ctaTo={`/yoga/practice?id=${exercise.id}`}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardDescription>No yoga poses match current filters. Try adjusting or resetting filters.</CardDescription>
        </Card>
      ) : null}
    </div>
  );
}
