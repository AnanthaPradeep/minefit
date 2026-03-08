"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { todayISO } from "@/lib/utils";
import { useAppStore } from "@/state/store";

export function PlayerClient({ id }: { id?: string }) {
  const exercises = useAppStore((state) => state.exerciseLibrary);
  const user = useAppStore((state) => state.currentUser);
  const addWorkoutLog = useAppStore((state) => state.addWorkoutLog);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(60);
  const [restSeconds, setRestSeconds] = useState(30);
  const [running, setRunning] = useState(false);
  const [resting, setResting] = useState(false);

  const exercise = useMemo(() => exercises.find((item) => item.id === id), [exercises, id]);

  useEffect(() => {
    if (!exercise) return;
    setActiveSeconds(exercise.duration * 60);
    setRestSeconds(exercise.restTime);
    setStepIndex(0);
    setRunning(false);
    setResting(false);
  }, [exercise]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (resting) {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setResting(false);
            return exercise?.restTime ?? 30;
          }
          return prev - 1;
        });
        return;
      }

      setActiveSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exercise?.restTime, resting, running]);

  if (!exercise) {
    return (
      <Card>
        <CardTitle>Workout Player</CardTitle>
        <CardDescription className="mt-2">Select an exercise from library first.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{exercise.name}</CardTitle>
        <CardDescription className="mt-1">
          {exercise.difficulty} • {exercise.targetMuscles.join(", ")}
        </CardDescription>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{exercise.description}</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          {exercise.steps.map((step, index) => (
            <li
              key={`${exercise.id}-${index}`}
              className={index === stepIndex ? "font-semibold text-emerald-600" : ""}
            >
              {step}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
          >
            Prev Step
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setStepIndex((prev) => Math.min(exercise.steps.length - 1, prev + 1))
            }
          >
            Next Step
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>YouTube Demo</CardTitle>
        <div className="mt-3 aspect-video overflow-hidden rounded-xl">
          {exercise.youtubeUrl ? (
            <iframe className="h-full w-full" src={exercise.youtubeUrl} title={exercise.name} allowFullScreen />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">No video available offline</div>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Guided Workout Mode</CardTitle>
        <p className="mt-2 text-center text-4xl font-bold">
          {Math.floor(activeSeconds / 60)
            .toString()
            .padStart(2, "0")}
          :{(activeSeconds % 60).toString().padStart(2, "0")}
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {resting ? `Rest: ${restSeconds}s` : "Active"}
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Button onClick={() => setRunning(true)}>Start</Button>
        <Button variant="secondary" onClick={() => setRunning(false)}>Pause</Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false);
            setResting(false);
            setActiveSeconds(exercise.duration * 60);
            setRestSeconds(exercise.restTime);
          }}
        >
          Reset
        </Button>
      </div>

      <Button variant="outline" onClick={() => setResting(true)}>
        Start Rest Timer
      </Button>

      <Button
        className="w-full"
        onClick={async () => {
          if (!user) return;
          await addWorkoutLog({
            userId: user.id,
            exerciseName: exercise.name,
            category: exercise.category,
            duration: exercise.duration,
            completed: true,
            date: todayISO(),
            caloriesBurned: Math.max(40, exercise.duration * 6),
          });
        }}
      >
        Mark Completed
      </Button>
    </div>
  );
}
