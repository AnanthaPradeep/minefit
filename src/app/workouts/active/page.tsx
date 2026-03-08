"use client";

import { Link } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/feature/media-card";
import { useWorkoutModuleStore } from "@/state/workout-module-store";
import { useAppStore } from "../../../state/store";

export default function ActiveWorkoutPage() {
  const plans = useWorkoutModuleStore((state) => state.workoutPlans);
  const exercises = useAppStore((state) => state.exerciseLibrary);

  const recommendedPlan = plans[0];
  const planExercises = exercises.filter((item) => recommendedPlan?.exerciseIds.includes(item.id));

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Active Workout Screen</CardTitle>
        <CardDescription className="mt-1">Guided mode with step timer and rest timer</CardDescription>
      </Card>

      {recommendedPlan ? (
        <Card>
          <CardTitle>{recommendedPlan.title}</CardTitle>
          <CardDescription className="mt-1">{recommendedPlan.planType} • {planExercises.length} exercises</CardDescription>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {planExercises.slice(0, 8).map((exercise) => (
              <MediaCard
                key={exercise.id}
                compact
                title={exercise.name}
                subtitle={`${exercise.duration} min`}
                metaLeft={exercise.difficulty}
                metaRight={exercise.category.replace("_", " ")}
                imageUrl={exercise.imageUrl}
                ctaLabel="Start"
                ctaTo={`/workouts/player?id=${exercise.id}&mode=workout`}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <CardDescription>No plan found. Create one in Workout Builder.</CardDescription>
          <Link to="/workouts/builder" className="mt-3 block">
            <Button className="w-full">Go to Builder</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
