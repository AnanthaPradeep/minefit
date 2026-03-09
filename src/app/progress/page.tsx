"use client";

import { useMemo, useState } from "react";
import { calculateBmi, convertKgToUnits, convertUnitsToKg, getBmiInsight, getBmiRiskToneClass } from "@/lib/bmi";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ActivityMinutesChart,
  AdherenceChart,
  BmiChart,
  WeightChart,
  WeeklyWorkoutChart,
} from "@/components/feature/progress-charts";
import { MediaCard } from "@/components/feature/media-card";
import { todayISO } from "@/lib/utils";
import { getWeeklyActiveMinutes } from "@/state/store";
import { useAppStore } from "@/state/store";

export default function ProgressPage() {
  const user = useAppStore((state) => state.currentUser);
  const units = useAppStore((state) => state.settings?.units ?? "metric");
  const bmiProfile = useAppStore((state) => state.settings?.bmiThresholdProfile ?? "standard");
  const [weightInput, setWeightInput] = useState("68");
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [waist, setWaist] = useState(0);
  const [chest, setChest] = useState(0);
  const [hips, setHips] = useState(0);
  const [targetWeight, setTargetWeight] = useState(65);
  const [targetDate, setTargetDate] = useState("");
  const [weeklyTargetMinutes, setWeeklyTargetMinutes] = useState(150);
  const [weeklyTargetSessions, setWeeklyTargetSessions] = useState(4);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoNote, setPhotoNote] = useState("");

  const addProgressEntry = useAppStore((state) => state.addProgressEntry);
  const addMeasurementEntry = useAppStore((state) => state.addMeasurementEntry);
  const upsertProgressGoal = useAppStore((state) => state.upsertProgressGoal);
  const addProgressPhoto = useAppStore((state) => state.addProgressPhoto);
  const progress = useAppStore((state) => state.progressEntries);
  const measurements = useAppStore((state) => state.measurements);
  const goals = useAppStore((state) => state.goals);
  const photos = useAppStore((state) => state.progressPhotos);
  const adherenceSnapshots = useAppStore((state) => state.adherenceSnapshots);
  const milestones = useAppStore((state) => state.milestones);
  const logs = useAppStore((state) => state.workoutLogs);

  const first = progress[progress.length - 1]?.weight;
  const latest = progress[0]?.weight;
  const delta = first !== undefined && latest !== undefined ? latest - first : 0;
  const displayDelta = convertKgToUnits(delta, units);
  const latestWeightKg = latest ?? user?.weight ?? 0;
  const currentBmi = user ? calculateBmi(user.height, latestWeightKg) : null;
  const bmiInsight = getBmiInsight({ age: user?.age ?? 25, bmi: currentBmi, profile: bmiProfile });
  const currentGoal = goals[0];

  const currentAdherence = adherenceSnapshots[0];
  const adherenceCompleted = currentAdherence?.completedSessions ?? 0;
  const adherenceTarget = currentAdherence?.targetSessions ?? (currentGoal?.weeklyTargetSessions ?? 4);
  const weeklyMinutes = getWeeklyActiveMinutes(logs);
  const minutesGap = (currentGoal?.weeklyTargetMinutes ?? 150) - weeklyMinutes;

  const latestMeasurement = measurements[0];
  const measurementCards = useMemo(
    () => [
      { label: "Waist", value: latestMeasurement?.waist },
      { label: "Chest", value: latestMeasurement?.chest },
      { label: "Hips", value: latestMeasurement?.hips },
    ],
    [latestMeasurement],
  );

  const weightLabel = units === "imperial" ? "Weight (lb)" : "Weight (kg)";

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Progress Tracker</CardTitle>
        <CardDescription className="mt-1">Weight, measurements, adherence, goals, milestones, and photo timeline</CardDescription>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardTitle>Add Weight Entry</CardTitle>
          <div className="mt-3 flex gap-2">
            <Input
              type="number"
              value={weightInput}
              placeholder={weightLabel}
              onChange={(event) => setWeightInput(event.target.value)}
            />
            <Button
              onClick={() => {
                const parsed = Number(weightInput);
                if (!Number.isFinite(parsed) || parsed <= 0) return;
                const weightKg = convertUnitsToKg(parsed, units);
                addProgressEntry(weightKg, todayISO());
              }}
            >
              Save
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Current change: {displayDelta >= 0 ? "+" : ""}
            {displayDelta.toFixed(1)} {units === "imperial" ? "lb" : "kg"}
          </p>
        </Card>

        <Card>
          <CardTitle>Current BMI</CardTitle>
          <p className="mt-2 text-3xl font-bold">{currentBmi ?? "--"}</p>
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{bmiInsight.label} ({bmiInsight.range})</p>
          <p className={`text-xs font-medium ${getBmiRiskToneClass(bmiInsight.risk)}`}>Risk: {bmiInsight.risk}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{bmiInsight.detail}</p>
        </Card>

        <Card>
          <CardTitle>Weekly Minutes</CardTitle>
          <p className="mt-2 text-3xl font-bold">{weeklyMinutes}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {minutesGap <= 0 ? "Target reached" : `${minutesGap} min to target`}
          </p>
        </Card>

        <Card>
          <CardTitle>Adherence</CardTitle>
          <div className="mt-3 flex flex-col items-center text-center">
            <div className="rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
              <p className="text-3xl font-bold">{currentAdherence?.completionRate ?? 0}%</p>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Sessions this week: {adherenceCompleted}/{adherenceTarget}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Goal Settings</CardTitle>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Input type="number" value={targetWeight} onChange={(event) => setTargetWeight(Number(event.target.value))} placeholder="Target Weight (kg)" />
            <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
            <Input type="number" value={weeklyTargetMinutes} onChange={(event) => setWeeklyTargetMinutes(Number(event.target.value))} placeholder="Weekly Minutes" />
            <Input type="number" value={weeklyTargetSessions} onChange={(event) => setWeeklyTargetSessions(Number(event.target.value))} placeholder="Weekly Sessions" />
          </div>
          <Button
            className="mt-3 w-full md:w-auto"
            onClick={() =>
              upsertProgressGoal({
                targetWeight,
                targetDate: targetDate || undefined,
                weeklyTargetMinutes,
                weeklyTargetSessions,
              })
            }
          >
            Save Goal
          </Button>
          {currentGoal ? (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Active goal: {currentGoal.targetWeight ?? "-"} kg by {currentGoal.targetDate ?? "No date"} • {currentGoal.weeklyTargetMinutes} min/week • {currentGoal.weeklyTargetSessions} sessions/week
            </p>
          ) : null}
        </Card>

        <Card>
          <CardTitle>Body Measurements</CardTitle>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
            <Input type="number" value={waist} onChange={(event) => setWaist(Number(event.target.value))} placeholder="Waist (cm)" />
            <Input type="number" value={chest} onChange={(event) => setChest(Number(event.target.value))} placeholder="Chest (cm)" />
            <Input type="number" value={hips} onChange={(event) => setHips(Number(event.target.value))} placeholder="Hips (cm)" />
            <Button onClick={() => addMeasurementEntry({ waist, chest, hips, date: todayISO() })}>Save Measurements</Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            {measurementCards.map((item) => (
              <MediaCard
                key={item.label}
                compact
                showImage={false}
                title={item.label}
                subtitle={item.value ? `${item.value} cm` : "No data"}
                metaLeft="Latest"
                metaRight={latestMeasurement?.date ?? "-"}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Weight Chart</CardTitle>
          <div className="mt-2 flex gap-2">
            {[7, 30, 90].map((value) => (
              <Button key={value} size="sm" variant={range === value ? "default" : "outline"} onClick={() => setRange(value as 7 | 30 | 90)}>
                {value}d
              </Button>
            ))}
          </div>
          <WeightChart data={progress} range={range} />
        </Card>

        <Card>
          <CardTitle>BMI Trend</CardTitle>
          <CardDescription className="mt-1">Calculated from your saved weight entries and profile height</CardDescription>
          <BmiChart data={progress} heightCm={user?.height ?? 165} range={range} />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">BMI is a screening metric, not a diagnosis.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Weekly Workout Graph</CardTitle>
          <WeeklyWorkoutChart logs={logs} />
        </Card>

        <Card>
          <CardTitle>Adherence Trend</CardTitle>
          <AdherenceChart data={adherenceSnapshots} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Activity vs Target</CardTitle>
          <ActivityMinutesChart logs={logs} targetMinutes={currentGoal?.weeklyTargetMinutes ?? 150} />
        </Card>

        <Card>
          <CardTitle>Milestones</CardTitle>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {milestones.length === 0 ? <p className="text-sm text-zinc-500 dark:text-zinc-400">No milestones yet.</p> : null}
            {milestones.slice(0, 6).map((milestone) => (
              <MediaCard
                key={milestone.id}
                compact
                showImage={false}
                title={milestone.title}
                subtitle={milestone.detail}
                metaLeft={milestone.type.replace("_", " ")}
                metaRight={milestone.date}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Progress Photos</CardTitle>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setPhotoPreview(String(reader.result ?? ""));
              reader.readAsDataURL(file);
            }}
          />
          <Input placeholder="Note (optional)" value={photoNote} onChange={(event) => setPhotoNote(event.target.value)} />
          <Button
            onClick={() => {
              if (!photoPreview) return;
              addProgressPhoto(photoPreview, todayISO(), photoNote || undefined);
              setPhotoPreview("");
              setPhotoNote("");
            }}
          >
            Add Photo
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {photos.length === 0 ? <p className="text-sm text-zinc-500 dark:text-zinc-400">No photo entries yet.</p> : null}
          {photos.slice(0, 8).map((photo) => (
            <MediaCard
              key={photo.id}
              compact
              title={photo.note || "Progress Photo"}
              subtitle={photo.date}
              imageUrl={photo.imageUrl}
              metaLeft="Timeline"
              metaRight="Local"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
