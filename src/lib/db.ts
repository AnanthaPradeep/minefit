import Dexie, { type Table } from "dexie";
import type {
  AdherenceSnapshot,
  AppSettings,
  Exercise,
  HydrationEntry,
  MeasurementEntry,
  MealEntry,
  MealTemplate,
  NutritionGoal,
  ProgressGoal,
  ProgressMilestone,
  ProgressPhoto,
  ProgressEntry,
  ReminderLog,
  Reminder,
  UserProfile,
  WeeklyPlan,
  WorkoutLog,
} from "@/lib/types";

class MineFitDB extends Dexie {
  users!: Table<UserProfile, string>;
  meals!: Table<MealEntry, string>;
  weeklyPlans!: Table<WeeklyPlan, string>;
  workouts!: Table<WorkoutLog, string>;
  exerciseLibrary!: Table<Exercise, string>;
  progress!: Table<ProgressEntry, string>;
  measurements!: Table<MeasurementEntry, string>;
  goals!: Table<ProgressGoal, string>;
  photos!: Table<ProgressPhoto, string>;
  adherenceSnapshots!: Table<AdherenceSnapshot, string>;
  milestones!: Table<ProgressMilestone, string>;
  nutritionGoals!: Table<NutritionGoal, string>;
  hydrationEntries!: Table<HydrationEntry, string>;
  mealTemplates!: Table<MealTemplate, string>;
  reminders!: Table<Reminder, string>;
  reminderLogs!: Table<ReminderLog, string>;
  settings!: Table<AppSettings, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("minefit-db");
    this.version(1).stores({
      users: "id, name, fitnessGoal, updatedAt",
      meals: "id, userId, mealType, date",
      weeklyPlans: "id, userId, weekStartDate",
      workouts: "id, userId, category, date, completed",
      exerciseLibrary: "id, category, difficulty",
      progress: "id, userId, date",
      reminders: "id, userId, type, scheduleType, enabled",
      settings: "id, userId",
      meta: "key",
    });

    this.version(2).stores({
      users: "id, name, fitnessGoal, updatedAt",
      meals: "id, userId, mealType, date",
      weeklyPlans: "id, userId, weekStartDate",
      workouts: "id, userId, category, date, completed",
      exerciseLibrary: "id, category, difficulty",
      progress: "id, userId, date",
      measurements: "id, userId, date",
      goals: "id, userId, updatedAt",
      photos: "id, userId, date",
      adherenceSnapshots: "id, userId, weekStartDate, createdAt",
      milestones: "id, userId, type, date",
      reminders: "id, userId, type, scheduleType, enabled",
      settings: "id, userId",
      meta: "key",
    });

    this.version(3).stores({
      users: "id, name, fitnessGoal, updatedAt",
      meals: "id, userId, mealType, date",
      weeklyPlans: "id, userId, weekStartDate",
      workouts: "id, userId, category, date, completed",
      exerciseLibrary: "id, category, difficulty",
      progress: "id, userId, date",
      measurements: "id, userId, date",
      goals: "id, userId, updatedAt",
      photos: "id, userId, date",
      adherenceSnapshots: "id, userId, weekStartDate, createdAt",
      milestones: "id, userId, type, date",
      nutritionGoals: "id, userId, updatedAt",
      hydrationEntries: "id, userId, date",
      mealTemplates: "id, userId, mealType, region",
      reminders: "id, userId, type, scheduleType, enabled",
      settings: "id, userId",
      meta: "key",
    });

    this.version(4).stores({
      users: "id, name, fitnessGoal, updatedAt",
      meals: "id, userId, mealType, date",
      weeklyPlans: "id, userId, weekStartDate",
      workouts: "id, userId, category, date, completed",
      exerciseLibrary: "id, category, difficulty",
      progress: "id, userId, date",
      measurements: "id, userId, date",
      goals: "id, userId, updatedAt",
      photos: "id, userId, date",
      adherenceSnapshots: "id, userId, weekStartDate, createdAt",
      milestones: "id, userId, type, date",
      nutritionGoals: "id, userId, updatedAt",
      hydrationEntries: "id, userId, date",
      mealTemplates: "id, userId, mealType, region",
      reminders: "id, userId, type, scheduleType, enabled, time, priority",
      reminderLogs: "id, userId, reminderId, action, at",
      settings: "id, userId",
      meta: "key",
    });
  }
}

export const db = new MineFitDB();
