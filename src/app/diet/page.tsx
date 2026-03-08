"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MediaCard } from "@/components/feature/media-card";
import { Input } from "@/components/ui/input";
import { suggestMeals } from "@/lib/meal-suggestion";
import { foodCatalogByRegion } from "@/lib/seed";
import { todayISO } from "@/lib/utils";
import type { DietRegion, MealLogMode, MealType } from "@/lib/types";
import { useAppStore } from "@/state/store";

const mealTypes: { key: MealType; label: string }[] = [
  { key: "morning", label: "Morning (Breakfast)" },
  { key: "afternoon", label: "Afternoon (Lunch)" },
  { key: "evening", label: "Evening Snacks" },
  { key: "night", label: "Night (Dinner)" },
];

export default function DietPage() {
  const addMeal = useAppStore((state) => state.addMeal);
  const saveMealTemplate = useAppStore((state) => state.saveMealTemplate);
  const addHydrationEntry = useAppStore((state) => state.addHydrationEntry);
  const upsertNutritionGoal = useAppStore((state) => state.upsertNutritionGoal);
  const setDietRegion = useAppStore((state) => state.setDietRegion);
  const getTodayDietSummary = useAppStore((state) => state.getTodayDietSummary);
  const allMeals = useAppStore((state) => state.meals);
  const nutritionGoal = useAppStore((state) => state.nutritionGoals[0]);
  const templates = useAppStore((state) => state.mealTemplates);
  const selectedRegion = useAppStore((state) => state.dietRegion);
  const user = useAppStore((state) => state.currentUser);

  const [mealInput, setMealInput] = useState<Record<MealType, string>>({
    morning: "",
    afternoon: "",
    evening: "",
    night: "",
  });
  const [mealNotes, setMealNotes] = useState<Record<MealType, string>>({
    morning: "",
    afternoon: "",
    evening: "",
    night: "",
  });
  const [hydrationMl, setHydrationMl] = useState("250");
  const [templateName, setTemplateName] = useState("");
  const [templateMealType, setTemplateMealType] = useState<MealType>("morning");
  const [loggingMode, setLoggingMode] = useState<MealLogMode>("quick");
  const [goalForm, setGoalForm] = useState({
    calorieTarget: nutritionGoal?.calorieTarget ?? 2100,
    proteinTarget: nutritionGoal?.proteinTarget ?? 95,
    carbsTarget: nutritionGoal?.carbsTarget ?? 240,
    fatTarget: nutritionGoal?.fatTarget ?? 70,
    fiberTarget: nutritionGoal?.fiberTarget ?? 30,
    waterTargetMl: nutritionGoal?.waterTargetMl ?? 2800,
  });

  const todayMeals = useMemo(
    () => allMeals.filter((meal) => meal.date === todayISO()),
    [allMeals],
  );

  const suggestions = useMemo(() => {
    if (!user) return null;
    const recentNames = allMeals
      .slice(0, 8)
      .flatMap((meal) => meal.foodItems.map((item) => item.name));
    return suggestMeals(user.fitnessGoal, foodCatalogByRegion[selectedRegion], recentNames);
  }, [allMeals, selectedRegion, user]);

  const todaySummary = getTodayDietSummary();

  const regionOptions: { value: DietRegion; label: string }[] = [
    { value: "south_indian", label: "South Indian" },
    { value: "north_indian", label: "North Indian" },
    { value: "balanced_indian", label: "Balanced Indian" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Diet Planner 2.0</CardTitle>
        <CardDescription className="mt-1">Region-aware planning with quick or detailed local logging</CardDescription>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={selectedRegion}
            onChange={(event) => setDietRegion(event.target.value as DietRegion)}
          >
            {regionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={loggingMode}
            onChange={(event) => setLoggingMode(event.target.value as MealLogMode)}
          >
            <option value="quick">Quick log</option>
            <option value="detailed">Detailed log</option>
          </select>
        </div>
        <Link to="/diet/weekly" className="mt-3 block">
          <Button className="w-full" variant="outline">
            Open Weekly Diet Planner
          </Button>
        </Link>
      </Card>

      <Card>
        <CardTitle>Daily Targets</CardTitle>
        <CardDescription className="mt-1">Update calories, macros, fiber, and water targets</CardDescription>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          <Input
            type="number"
            placeholder="Calories"
            value={goalForm.calorieTarget}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, calorieTarget: Number(event.target.value) || 0 }))}
          />
          <Input
            type="number"
            placeholder="Protein (g)"
            value={goalForm.proteinTarget}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, proteinTarget: Number(event.target.value) || 0 }))}
          />
          <Input
            type="number"
            placeholder="Carbs (g)"
            value={goalForm.carbsTarget}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, carbsTarget: Number(event.target.value) || 0 }))}
          />
          <Input
            type="number"
            placeholder="Fat (g)"
            value={goalForm.fatTarget}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, fatTarget: Number(event.target.value) || 0 }))}
          />
          <Input
            type="number"
            placeholder="Fiber (g)"
            value={goalForm.fiberTarget}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, fiberTarget: Number(event.target.value) || 0 }))}
          />
          <Input
            type="number"
            placeholder="Water (ml)"
            value={goalForm.waterTargetMl}
            onChange={(event) => setGoalForm((prev) => ({ ...prev, waterTargetMl: Number(event.target.value) || 0 }))}
          />
        </div>
        <Button className="mt-3 w-full" variant="outline" onClick={() => upsertNutritionGoal(goalForm)}>
          Save Nutrition Targets
        </Button>
      </Card>

      <Card>
        <CardTitle>Hydration</CardTitle>
        <CardDescription className="mt-1">Log water quickly and track today against target</CardDescription>
        <div className="mt-3 flex gap-2">
          <Input
            type="number"
            placeholder="Water ml"
            value={hydrationMl}
            onChange={(event) => setHydrationMl(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={async () => {
              await addHydrationEntry(Number(hydrationMl) || 0, todayISO());
            }}
          >
            Add
          </Button>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Today: {todaySummary.hydrationMl} / {todaySummary.waterTargetMl} ml
        </p>
      </Card>

      {mealTypes.map((mealType) => (
        <Card key={mealType.key}>
          <CardTitle>{mealType.label}</CardTitle>
          <CardDescription className="mt-1 text-xs">
            Suggestions: {foodCatalogByRegion[selectedRegion][mealType.key].map((item) => item.name).join(", ")}
          </CardDescription>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add items (comma separated)"
              value={mealInput[mealType.key]}
              onChange={(event) =>
                setMealInput((prev) => ({
                  ...prev,
                  [mealType.key]: event.target.value,
                }))
              }
            />
            <Button
              onClick={async () => {
                const names = mealInput[mealType.key]
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean);
                await addMeal(mealType.key, names, todayISO(), {
                  region: selectedRegion,
                  mode: loggingMode,
                  notes: mealNotes[mealType.key],
                });
                setMealInput((prev) => ({ ...prev, [mealType.key]: "" }));
                setMealNotes((prev) => ({ ...prev, [mealType.key]: "" }));
              }}
            >
              Save
            </Button>
          </div>
          {loggingMode === "detailed" ? (
            <Input
              className="mt-2"
              placeholder="Optional note (portion, timing, hunger)"
              value={mealNotes[mealType.key]}
              onChange={(event) =>
                setMealNotes((prev) => ({
                  ...prev,
                  [mealType.key]: event.target.value,
                }))
              }
            />
          ) : null}
        </Card>
      ))}

      <Card>
        <CardTitle>Meal Template</CardTitle>
        <CardDescription className="mt-1">Save frequently used meal combos for faster planning</CardDescription>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Template name"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
          />
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={templateMealType}
            onChange={(event) => setTemplateMealType(event.target.value as MealType)}
          >
            {mealTypes.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={async () => {
              const names = mealInput[templateMealType]
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean);
              await saveMealTemplate(templateName, templateMealType, names, selectedRegion, mealNotes[templateMealType]);
              setTemplateName("");
            }}
          >
            Save Template
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {templates.slice(0, 4).map((template) => (
            <MediaCard
              key={template.id}
              compact
              showImage={false}
              title={`${template.name} • ${template.mealType}`}
              subtitle={template.foodItems.map((item) => item.name).join(", ")}
              metaLeft={template.region.replace("_", " ")}
              metaRight="Template"
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Today&apos;s Nutrition</CardTitle>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-zinc-100 p-2 dark:bg-zinc-800">Calories: {todaySummary.calories}/{todaySummary.calorieTarget}</div>
          <div className="rounded-xl bg-zinc-100 p-2 dark:bg-zinc-800">Protein: {todaySummary.protein}g/{todaySummary.proteinTarget}g</div>
          <div className="rounded-xl bg-zinc-100 p-2 dark:bg-zinc-800">Carbs: {todaySummary.carbs}g/{todaySummary.carbsTarget}g</div>
          <div className="rounded-xl bg-zinc-100 p-2 dark:bg-zinc-800">Fat: {todaySummary.fat}g/{todaySummary.fatTarget}g</div>
        </div>
      </Card>

      <Card>
        <CardTitle>Today&apos;s Saved Meals</CardTitle>
        <div className="mt-3 space-y-2 text-sm">
          {todayMeals.length === 0 ? <p className="text-zinc-500 dark:text-zinc-400">No meals yet today.</p> : null}
          {todayMeals.map((meal) => (
            <MediaCard
              key={meal.id}
              compact
              showImage={false}
              title={meal.mealType}
              subtitle={meal.foodItems.map((item) => item.name).join(", ")}
              description={meal.notes}
              metaLeft={`${meal.calories} kcal`}
              metaRight={`${meal.protein}g protein • ${meal.region ?? "-"}`}
            />
          ))}
        </div>
      </Card>

      {suggestions ? (
        <Card>
          <CardTitle>Balanced Combination Suggestion</CardTitle>
          <CardDescription className="mt-2">
            Total estimate: {suggestions.totalCalories} kcal
          </CardDescription>
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-300">
            <li>Morning: {suggestions.morning.name}</li>
            <li>Afternoon: {suggestions.afternoon.name}</li>
            <li>Evening: {suggestions.evening.name}</li>
            <li>Night: {suggestions.night.name}</li>
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
