"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const [manualMinutes, setManualMinutes] = useState(String(defaults.workout / 60));

  const applyManualDuration = () => {
    const parsedMinutes = Number(manualMinutes);
    if (!Number.isFinite(parsedMinutes) || parsedMinutes < 1) return;
    const clampedMinutes = Math.min(180, Math.floor(parsedMinutes));
    setRunning(false);
    setSeconds(clampedMinutes * 60);
    setManualMinutes(String(clampedMinutes));
  };

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
      <CardDescription className="mt-1">Workout, interval, yoga hold, and custom timer</CardDescription>

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
              setManualMinutes(String(defaults[item] / 60));
            }}
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="mt-3 flex w-full items-center justify-end gap-2">
        <Input
          type="number"
          min={1}
          max={180}
          step={1}
          value={manualMinutes}
          onChange={(event) => setManualMinutes(event.target.value)}
          className="h-10 w-28 text-right"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={applyManualDuration}
          className="h-10 w-10 shrink-0 px-0"
          aria-label="Apply manual timer"
          title="Apply manual timer"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </Button>
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
            setManualMinutes(String(defaults[mode] / 60));
          }}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
}
