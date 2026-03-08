"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { weekStartISO } from "@/lib/utils";
import type { DietRegion, MealType } from "@/lib/types";
import { useAppStore } from "@/state/store";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes: MealType[] = ["morning", "afternoon", "evening", "night"];

export default function WeeklyDietPlannerPage() {
  const saveWeeklyPlan = useAppStore((state) => state.saveWeeklyPlan);
  const templates = useAppStore((state) => state.mealTemplates);
  const selectedRegion = useAppStore((state) => state.dietRegion);

  const [region, setRegion] = useState<DietRegion>(selectedRegion);
  const [strategy, setStrategy] = useState("balanced");
  const [templateId, setTemplateId] = useState("");
  const [planInput, setPlanInput] = useState<Record<string, Record<MealType, string>>>(
    Object.fromEntries(
      days.map((day) => [
        day,
        { morning: "", afternoon: "", evening: "", night: "" },
      ]),
    ) as Record<string, Record<MealType, string>>,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Weekly Diet Planner</CardTitle>
        <CardDescription className="mt-1">Save a structured week plan with region and strategy locally</CardDescription>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={region}
            onChange={(event) => setRegion(event.target.value as DietRegion)}
          >
            <option value="south_indian">South Indian</option>
            <option value="north_indian">North Indian</option>
            <option value="balanced_indian">Balanced Indian</option>
          </select>
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={strategy}
            onChange={(event) => setStrategy(event.target.value)}
          >
            <option value="balanced">Balanced</option>
            <option value="high_protein">High protein</option>
            <option value="low_calorie">Low calorie</option>
          </select>
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
          >
            <option value="">No template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.mealType})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {days.map((day) => (
        <Card key={day}>
          <CardTitle>{day}</CardTitle>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {mealTypes.map((mealType) => (
              <Input
                key={`${day}-${mealType}`}
                placeholder={`${mealType}: items (comma separated)`}
                value={planInput[day][mealType]}
                onChange={(event) =>
                  setPlanInput((prev) => ({
                    ...prev,
                    [day]: {
                      ...prev[day],
                      [mealType]: event.target.value,
                    },
                  }))
                }
              />
            ))}
          </div>
        </Card>
      ))}

      <Button
        className="w-full"
        onClick={async () => {
          const structuredDays = days.map((day) => ({
            day,
            morning: planInput[day].morning,
            afternoon: planInput[day].afternoon,
            evening: planInput[day].evening,
            night: planInput[day].night,
          }));

          await saveWeeklyPlan(
            weekStartISO(),
            {
              days: structuredDays,
              notes: structuredDays.map((item) => ({
                day: item.day,
                meals: `${item.morning} | ${item.afternoon} | ${item.evening} | ${item.night}`,
              })),
            },
            {
              region,
              strategy,
              templateId: templateId || undefined,
            },
          );
        }}
      >
        Save Weekly Plan
      </Button>
    </div>
  );
}
