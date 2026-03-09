"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MediaCard } from "@/components/feature/media-card";
import { useAppStore } from "@/state/store";
import { yogaPoseCatalog } from "@/lib/workout-yoga-catalog";

const categoryOrder = ["beginner", "intermediate", "advanced", "digestion", "relaxation"] as const;

const labels: Record<(typeof categoryOrder)[number], string> = {
  beginner: "Foundation Poses",
  intermediate: "Flow & Stability",
  advanced: "Advanced Balances & Inversions",
  digestion: "Digestive Support",
  relaxation: "Restorative & Relaxation",
};

export default function AllYogaPage() {
  const yogaList = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category === "yoga");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [duration, setDuration] = useState("all");
  const [bestTime, setBestTime] = useState("all");
  const [benefit, setBenefit] = useState("");

  const poseMap = useMemo(() => new Map(yogaPoseCatalog.map((pose) => [pose.name, pose])), []);

  const getDurationBucket = (minutes: number) => {
    if (minutes <= 5) return "short";
    if (minutes <= 10) return "medium";
    return "long";
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const normalizedBenefit = benefit.trim().toLowerCase();

    return yogaList.filter((exercise) => {
      const pose = poseMap.get(exercise.name);
      const category = pose?.category ?? "beginner";
      const poseBestTime = pose?.bestTime?.toLowerCase() ?? "";
      const poseBenefits = Array.isArray(pose?.benefits) ? pose.benefits.join(" ").toLowerCase() : "";
      const matchesSearch =
        !normalized ||
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.description.toLowerCase().includes(normalized) ||
        category.includes(normalized);
      const matchesDifficulty = difficulty === "all" || exercise.difficulty === difficulty;
      const matchesDuration = duration === "all" || getDurationBucket(exercise.duration) === duration;
      const matchesBestTime = bestTime === "all" || poseBestTime.includes(bestTime);
      const matchesBenefit =
        !normalizedBenefit ||
        poseBenefits.includes(normalizedBenefit) ||
        exercise.description.toLowerCase().includes(normalizedBenefit);

      return matchesSearch && matchesDifficulty && matchesDuration && matchesBestTime && matchesBenefit;
    });
  }, [bestTime, benefit, difficulty, duration, poseMap, query, yogaList]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    categoryOrder.forEach((category) => map.set(category, []));

    filtered.forEach((exercise) => {
      const category = poseMap.get(exercise.name)?.category ?? "beginner";
      const bucket = map.get(category);
      if (bucket) bucket.push(exercise);
    });

    return map;
  }, [filtered, poseMap]);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>All Yoga Poses</CardTitle>
        <CardDescription className="mt-1">
          Complete categorized yoga list ({filtered.length} poses)
        </CardDescription>
        <input
          className="mt-3 h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Search by pose name or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="all">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="all">All Duration</option>
            <option value="short">Short (≤ 5 min)</option>
            <option value="medium">Medium (6-10 min)</option>
            <option value="long">Long (&gt; 10 min)</option>
          </select>
          <select className="h-10 rounded-lg border border-zinc-300 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" value={bestTime} onChange={(event) => setBestTime(event.target.value)}>
            <option value="all">All Best Time</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="anytime">Anytime</option>
          </select>
          <input
            className="h-10 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Benefit (e.g. digestion, relaxation)"
            value={benefit}
            onChange={(event) => setBenefit(event.target.value)}
          />
          <Button
            className="col-span-2"
            variant="outline"
            onClick={() => {
              setQuery("");
              setDifficulty("all");
              setDuration("all");
              setBestTime("all");
              setBenefit("");
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
            <CardDescription className="mt-1">{list.length} poses</CardDescription>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((pose) => (
                <MediaCard
                  key={pose.id}
                  compact
                  title={pose.name}
                  subtitle={`${pose.difficulty} • ${pose.duration} min`}
                  metaLeft="Mobility"
                  metaRight="Yoga"
                  imageUrl={pose.imageUrl}
                  ctaLabel="Start Pose"
                  ctaTo={`/yoga/practice?id=${pose.id}`}
                />
              ))}
            </div>
          </Card>
        );
      })}

      {filtered.length === 0 ? (
        <Card>
          <CardDescription>No yoga poses match current filters. Try adjusting or resetting filters.</CardDescription>
        </Card>
      ) : null}
    </div>
  );
}
