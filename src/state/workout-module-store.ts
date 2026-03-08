"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import type { WorkoutPlan, YogaRoutine } from "@/lib/types";
import { sampleWorkoutPlans, sampleYogaRoutines } from "@/lib/workout-yoga-catalog";

interface WorkoutModuleState {
  workoutPlans: WorkoutPlan[];
  yogaRoutines: YogaRoutine[];
  createWorkoutPlan: (title: string, planType: WorkoutPlan["planType"], exerciseIds: string[]) => void;
  createYogaRoutine: (title: string, focus: YogaRoutine["focus"], poseIds: string[]) => void;
}

export const useWorkoutModuleStore = create<WorkoutModuleState>()(
  persist(
    (set) => ({
      workoutPlans: sampleWorkoutPlans,
      yogaRoutines: sampleYogaRoutines,
      createWorkoutPlan: (title, planType, exerciseIds) => {
        const plan: WorkoutPlan = {
          id: uid("plan"),
          title,
          planType,
          exerciseIds,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ workoutPlans: [plan, ...state.workoutPlans] }));
      },
      createYogaRoutine: (title, focus, poseIds) => {
        const routine: YogaRoutine = {
          id: uid("routine"),
          title,
          focus,
          poseIds,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ yogaRoutines: [routine, ...state.yogaRoutines] }));
      },
    }),
    {
      name: "minefit-workout-module",
    },
  ),
);
