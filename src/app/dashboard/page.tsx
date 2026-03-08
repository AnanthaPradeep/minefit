"use client";

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Timer, Utensils } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/feature/media-card";
import { ExerciseTimer } from "@/components/feature/exercise-timer";
import { useAppStore, getWeeklyActiveMinutes, getWeeklyWorkoutCount, getWorkoutStreak } from "@/state/store";
import { todayISO } from "@/lib/utils";

export default function DashboardPage() {
  const allMeals = useAppStore((state) => state.meals);
  const logs = useAppStore((state) => state.workoutLogs);
  const getGoalSuggestions = useAppStore((state) => state.getGoalSuggestions);
  const getTodayDietSummary = useAppStore((state) => state.getTodayDietSummary);
  const adherence = useAppStore((state) => state.adherenceSnapshots[0]);
  const latestMilestone = useAppStore((state) => state.milestones[0]);

  const meals = useMemo(() => {
    const today = todayISO();
    return allMeals.filter((meal) => meal.date === today);
  }, [allMeals]);

  const suggestions = getGoalSuggestions();
  const dietSummary = getTodayDietSummary();

  const streak = getWorkoutStreak(logs);
  const weeklyCount = getWeeklyWorkoutCount(logs);
  const weeklyMinutes = getWeeklyActiveMinutes(logs);
  const calories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Today&apos;s Meals</CardTitle>
        <CardDescription className="mt-1">Morning, afternoon, evening snack, and night</CardDescription>
        <div className="mt-3 space-y-2 text-sm">
          {meals.length === 0 ? <p className="text-zinc-500 dark:text-zinc-400">No meals added today.</p> : null}
          {meals.map((meal) => (
            <MediaCard
              key={meal.id}
              compact
              showImage={false}
              title={meal.mealType}
              subtitle={meal.foodItems.map((item) => item.name).join(", ")}
              metaLeft={`${meal.calories} kcal`}
              metaRight={`${meal.protein}g protein`}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Today&apos;s Workout</CardTitle>
        <CardDescription className="mt-1">Exercise list and quick start</CardDescription>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/workouts">
            <Button className="w-full">Start Workout</Button>
          </Link>
          <Link to="/yoga">
            <Button variant="secondary" className="w-full">
              Start Yoga
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <CardTitle>Quick Actions</CardTitle>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to="/diet">
            <Button className="w-full" variant="outline">
              <Utensils className="mr-2 h-4 w-4" /> Add Meal
            </Button>
          </Link>
          <Link to="/workouts">
            <Button className="w-full" variant="outline">
              <Flame className="mr-2 h-4 w-4" /> Start Workout
            </Button>
          </Link>
          <Link to="/yoga">
            <Button className="w-full" variant="outline">
              Start Yoga
            </Button>
          </Link>
          <Link to="/dashboard#timer">
            <Button className="w-full" variant="outline">
              <Timer className="mr-2 h-4 w-4" /> Start Timer
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <CardTitle>Progress Summary</CardTitle>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Streak</p>
            <p className="text-lg font-bold">{streak}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Weekly</p>
            <p className="text-lg font-bold">{weeklyCount}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Minutes</p>
            <p className="text-lg font-bold">{weeklyMinutes}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Adherence</p>
            <p className="text-lg font-bold">{adherence?.completionRate ?? 0}%</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Calories</p>
            <p className="text-lg font-bold">{calories}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Water</p>
            <p className="text-lg font-bold">{dietSummary.hydrationMl} ml</p>
          </div>
        </div>
      </Card>

      {latestMilestone ? (
        <MediaCard
          compact
          showImage={false}
          title="Latest Milestone"
          subtitle={latestMilestone.title}
          description={latestMilestone.detail}
          metaLeft={latestMilestone.type}
          metaRight={latestMilestone.date}
        />
      ) : null}

      {suggestions ? (
        <Card>
          <CardTitle>Goal-based Meal Suggestion</CardTitle>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(["morning", "afternoon", "evening", "night"] as const).map((key) => (
              <MediaCard
                key={key}
                compact
                showImage={false}
                title={key}
                subtitle={suggestions[key].name}
                metaLeft={`${suggestions[key].calories} kcal`}
                metaRight="Suggestion"
              />
            ))}
          </div>
        </Card>
      ) : null}

      <div id="timer">
        <ExerciseTimer />
      </div>
    </div>
  );
}
