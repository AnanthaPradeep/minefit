"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "../../../state/store";
import type { YogaPose } from "@/lib/types";
import { yogaPoseCatalog } from "@/lib/workout-yoga-catalog";

export default function YogaPracticePage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const exercises = useAppStore((state) => state.exerciseLibrary).filter((item) => item.category === "yoga");
  const [seconds, setSeconds] = useState(180);
  const [running, setRunning] = useState(false);

  const current = useMemo(() => exercises.find((item) => item.id === id) ?? exercises[0], [exercises, id]);
  const poseInfo = yogaPoseCatalog.find((pose: YogaPose) => pose.name === current?.name);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  if (!current) {
    return (
      <Card>
        <CardTitle>Yoga Practice</CardTitle>
        <CardDescription className="mt-1">No yoga pose available.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{current.name}</CardTitle>
        <CardDescription className="mt-1">Calm guided yoga mode with breathing support</CardDescription>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">Best time: {poseInfo?.bestTime ?? "anytime"} • Duration: {current.duration} min</p>
      </Card>

      <Card>
        <CardTitle>Breathing Technique</CardTitle>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{poseInfo?.breathingTechnique ?? "Inhale slowly through nose and exhale longer."}</p>
      </Card>

      <Card>
        <CardTitle>YouTube Demo</CardTitle>
        <div className="mt-3 aspect-video overflow-hidden rounded-xl">
          {current.youtubeUrl || poseInfo?.youtubeUrl ? (
            <iframe
              className="h-full w-full"
              src={current.youtubeUrl ?? poseInfo?.youtubeUrl}
              title={current.name}
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">No video available offline</div>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Pose Steps</CardTitle>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          {current.steps.map((step, idx) => (
            <li key={`${current.id}-${idx}`}>{step}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Pose Timer</CardTitle>
        <p className="mt-3 text-center text-4xl font-bold">{Math.floor(seconds / 60).toString().padStart(2, "0")}:{(seconds % 60).toString().padStart(2, "0")}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button onClick={() => setRunning(true)}>Start</Button>
          <Button variant="secondary" onClick={() => setRunning(false)}>Pause</Button>
          <Button variant="outline" onClick={() => { setRunning(false); setSeconds((poseInfo?.duration ?? 3) * 60); }}>Reset</Button>
        </div>
      </Card>
    </div>
  );
}
