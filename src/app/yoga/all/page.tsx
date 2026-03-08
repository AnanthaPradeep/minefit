"use client";

import { useMemo, useState } from "react";
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

  const poseCategory = useMemo(() => new Map(yogaPoseCatalog.map((pose) => [pose.name, pose.category])), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return yogaList;
    return yogaList.filter((exercise) => {
      const category = poseCategory.get(exercise.name) ?? "";
      return (
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.description.toLowerCase().includes(normalized) ||
        category.includes(normalized)
      );
    });
  }, [poseCategory, query, yogaList]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    categoryOrder.forEach((category) => map.set(category, []));

    filtered.forEach((exercise) => {
      const category = poseCategory.get(exercise.name) ?? "beginner";
      const bucket = map.get(category);
      if (bucket) bucket.push(exercise);
    });

    return map;
  }, [filtered, poseCategory]);

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
    </div>
  );
}
