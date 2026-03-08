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
  const [category, setCategory] = useState("all");

  const yogaCatalogMap = new Map(yogaPoseCatalog.map((pose) => [pose.name, pose]));
  const filtered = useMemo(() => {
    return yogaList.filter((item) => {
      if (category === "all") return true;
      const pose = yogaCatalogMap.get(item.name);
      return pose?.category === category;
    });
  }, [category, yogaList]);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Yoga Library</CardTitle>
        <CardDescription className="mt-1">Guided breathing, pose timer, and flexibility progression</CardDescription>
        <div className="mt-3">
          <select
            className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
    </div>
  );
}
