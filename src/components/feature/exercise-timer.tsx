"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type TimerMode = "workout" | "interval" | "yoga";

const defaults: Record<TimerMode, number> = {
  workout: 20 * 60,
  interval: 5 * 60,
  yoga: 2 * 60,
};

export function ExerciseTimer() {
  const [mode, setMode] = useState<TimerMode>("workout");
  const [seconds, setSeconds] = useState(defaults.workout);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          if (typeof window !== "undefined") {
            new Audio("/alarm.mp3").play().catch(() => {});
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Card>
      <CardTitle>Exercise Timer</CardTitle>
      <CardDescription className="mt-1">Workout, interval, and yoga hold timer</CardDescription>

      <div className="mt-3 flex gap-2">
        {(["workout", "interval", "yoga"] as TimerMode[]).map((item) => (
          <Button
            key={item}
            variant={mode === item ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode(item);
              setSeconds(defaults[item]);
              setRunning(false);
            }}
          >
            {item}
          </Button>
        ))}
      </div>

      <p className="mt-4 text-center text-4xl font-bold">
        {mm}:{ss}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button onClick={() => setRunning(true)}>Start</Button>
        <Button variant="secondary" onClick={() => setRunning(false)}>
          Pause
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false);
            setSeconds(defaults[mode]);
          }}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
}
