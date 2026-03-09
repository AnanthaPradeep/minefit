"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "@/lib/db";
import { suggestMeals } from "@/lib/meal-suggestion";
import { isReminderDueNow } from "@/lib/notifications";
import { foodCatalogByRegion, seedLibraryIfNeeded } from "@/lib/seed";
import { downloadJson, todayISO, uid, weekStartISO } from "@/lib/utils";
import type {
  AdherenceSnapshot,
  AppExportPayload,
  AppSettings,
  BmiThresholdProfile,
  DietRegion,
  Exercise,
  FitnessGoal,
  HydrationEntry,
  MeasurementEntry,
  MealEntry,
  MealLogMode,
  MealTemplate,
  MealType,
  NutritionGoal,
  ProgressEntry,
  ProgressGoal,
  ProgressMilestone,
  ProgressPhoto,
  ReminderLog,
  ReminderPriority,
  Reminder,
  ReminderScheduleType,
  ReminderType,
  OnboardingState,
  UserProfile,
  WeeklyPlan,
  WorkoutLog,
} from "@/lib/types";

function toISODate(input: Date) {
  return input.toISOString().split("T")[0];
}

function isReminderScheduledForDate(reminder: Reminder, date: Date) {
  if (reminder.scheduleType === "daily") return true;

  if (reminder.scheduleType === "weekly") {
    return reminder.daysOfWeek.includes(date.getDay());
  }

  if (reminder.scheduleType === "monthly") {
    return date.getDate() === 1;
  }

  if (reminder.daysOfWeek.length > 0) {
    return reminder.daysOfWeek.includes(date.getDay());
  }

  return true;
}

function normalizeReminder(reminder: Reminder): Reminder {
  const createdAt = reminder.createdAt ?? new Date().toISOString();
  return {
    ...reminder,
    note: reminder.note,
    daysOfWeek: Array.isArray(reminder.daysOfWeek) ? reminder.daysOfWeek : [],
    priority: reminder.priority ?? "medium",
    createdAt,
    updatedAt: reminder.updatedAt ?? createdAt,
  };
}

function normalizeExercise(exercise: Exercise & { targetMuscle?: string }) {
  const targetMuscles =
    Array.isArray(exercise.targetMuscles) && exercise.targetMuscles.length > 0
      ? exercise.targetMuscles
      : exercise.targetMuscle
        ? [exercise.targetMuscle]
        : ["Full Body"];

  return {
    ...exercise,
    targetMuscles,
    equipment: exercise.equipment ?? "bodyweight",
    workoutTiming: exercise.workoutTiming ?? "anytime",
    caloriesBurnPerMinute: exercise.caloriesBurnPerMinute ?? 6,
    description: exercise.description ?? `${exercise.name} guided exercise`,
    benefits:
      Array.isArray(exercise.benefits) && exercise.benefits.length > 0
        ? exercise.benefits
        : ["Improves fitness"],
    restTime: exercise.restTime ?? 45,
    recommendedSets: exercise.recommendedSets ?? 3,
    recommendedReps: exercise.recommendedReps ?? 12,
    mistakesToAvoid:
      Array.isArray(exercise.mistakesToAvoid) && exercise.mistakesToAvoid.length > 0
        ? exercise.mistakesToAvoid
        : ["Avoid poor form"],
  } as Exercise;
}

function roundToInt(value: number) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function buildWeeklyAdherenceSnapshot(params: {
  userId: string;
  workoutLogs: WorkoutLog[];
  goal: ProgressGoal | null;
}): AdherenceSnapshot {
  const { userId, workoutLogs, goal } = params;
  const weekStartDate = weekStartISO();
  const weeklyLogs = workoutLogs.filter((item) => item.completed && item.date >= weekStartDate);
  const completedSessions = weeklyLogs.length;
  const activeMinutes = weeklyLogs.reduce((sum, item) => sum + item.duration, 0);
  const targetSessions = Math.max(1, goal?.weeklyTargetSessions ?? 4);
  const targetMinutes = Math.max(30, goal?.weeklyTargetMinutes ?? 150);
  const completionRate = roundToInt((completedSessions / targetSessions) * 100);
  const minutesRate = roundToInt((activeMinutes / targetMinutes) * 100);

  return {
    id: uid("adherence"),
    userId,
    weekStartDate,
    completedSessions,
    targetSessions,
    completionRate,
    activeMinutes,
    targetMinutes,
    minutesRate,
    createdAt: new Date().toISOString(),
  };
}

interface UiState {
  darkMode: boolean;
}

interface AppState {
  hydrated: boolean;
  onboarding: OnboardingState;
  currentUser: UserProfile | null;
  meals: MealEntry[];
  weeklyPlans: WeeklyPlan[];
  workoutLogs: WorkoutLog[];
  exerciseLibrary: Exercise[];
  progressEntries: ProgressEntry[];
  measurements: MeasurementEntry[];
  goals: ProgressGoal[];
  progressPhotos: ProgressPhoto[];
  adherenceSnapshots: AdherenceSnapshot[];
  milestones: ProgressMilestone[];
  nutritionGoals: NutritionGoal[];
  hydrationEntries: HydrationEntry[];
  mealTemplates: MealTemplate[];
  dietRegion: DietRegion;
  reminders: Reminder[];
  reminderLogs: ReminderLog[];
  settings: AppSettings | null;
  ui: UiState;
  bootstrap: () => Promise<void>;
  createOrUpdateProfile: (data: Omit<UserProfile, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  addMeal: (
    mealType: MealType,
    foodNames: string[],
    date: string,
    options?: { region?: DietRegion; mode?: MealLogMode; notes?: string },
  ) => Promise<void>;
  saveWeeklyPlan: (
    weekStartDate: string,
    plan: Record<string, unknown>,
    options?: { region?: DietRegion; templateId?: string; strategy?: string },
  ) => Promise<void>;
  addHydrationEntry: (amountMl: number, date: string) => Promise<void>;
  upsertNutritionGoal: (
    payload: Omit<NutritionGoal, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  saveMealTemplate: (
    name: string,
    mealType: MealType,
    foodNames: string[],
    region?: DietRegion,
    notes?: string,
  ) => Promise<void>;
  setDietRegion: (region: DietRegion) => void;
  addWorkoutLog: (payload: Omit<WorkoutLog, "id">) => Promise<void>;
  addProgressEntry: (weight: number, date: string, note?: string) => Promise<void>;
  addMeasurementEntry: (payload: Omit<MeasurementEntry, "id" | "userId">) => Promise<void>;
  upsertProgressGoal: (payload: Omit<ProgressGoal, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  addProgressPhoto: (imageUrl: string, date: string, note?: string) => Promise<void>;
  addReminder: (
    title: string,
    type: ReminderType,
    scheduleType: ReminderScheduleType,
    time: string,
    options?: { daysOfWeek?: number[]; note?: string; priority?: ReminderPriority },
  ) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;
  markReminderTriggered: (id: string, triggeredAt?: string) => Promise<void>;
  markReminderDone: (id: string) => Promise<void>;
  getTodayMeals: () => MealEntry[];
  getGoalSuggestions: () => ReturnType<typeof suggestMeals> | null;
  getTodayReminderSummary: () => {
    enabledCount: number;
    dueTodayCount: number;
    dueNowCount: number;
    completedTodayCount: number;
    snoozedCount: number;
    completionRate: number;
  };
  getTodayDietSummary: () => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    hydrationMl: number;
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    waterTargetMl: number;
  };
  exportData: () => Promise<void>;
  importData: (payload: AppExportPayload) => Promise<void>;
  clearAllData: () => Promise<void>;
  setDarkMode: (enabled: boolean) => Promise<void>;
  setUnits: (units: AppSettings["units"]) => Promise<void>;
  setBmiThresholdProfile: (profile: BmiThresholdProfile) => Promise<void>;
  completeOnboarding: (payload?: { skipped?: boolean; starterGoal?: FitnessGoal }) => void;
}

const baseSettings = (userId: string): AppSettings => ({
  id: uid("settings"),
  userId,
  darkMode: false,
  soundEnabled: true,
  units: "metric",
  bmiThresholdProfile: "standard",
});

function buildDefaultNutritionGoal(user: UserProfile): Omit<NutritionGoal, "id" | "userId" | "createdAt" | "updatedAt"> {
  if (user.fitnessGoal === "weight_gain") {
    return {
      calorieTarget: 2400,
      proteinTarget: 120,
      carbsTarget: 300,
      fatTarget: 80,
      fiberTarget: 30,
      waterTargetMl: 3000,
    };
  }

  if (user.fitnessGoal === "weight_loss") {
    return {
      calorieTarget: 1800,
      proteinTarget: 110,
      carbsTarget: 180,
      fatTarget: 60,
      fiberTarget: 30,
      waterTargetMl: 2800,
    };
  }

  return {
    calorieTarget: 2100,
    proteinTarget: 95,
    carbsTarget: 240,
    fatTarget: 70,
    fiberTarget: 30,
    waterTargetMl: 2800,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarding: {
        hasSeen: false,
        skipped: false,
      },
      currentUser: null,
      meals: [],
      weeklyPlans: [],
      workoutLogs: [],
      exerciseLibrary: [],
      progressEntries: [],
      measurements: [],
      goals: [],
      progressPhotos: [],
      adherenceSnapshots: [],
      milestones: [],
      nutritionGoals: [],
      hydrationEntries: [],
      mealTemplates: [],
      dietRegion: "south_indian",
      reminders: [],
      reminderLogs: [],
      settings: null,
      ui: { darkMode: false },

      bootstrap: async () => {
        if (get().hydrated) return;

        await seedLibraryIfNeeded();
        const [user] = await db.users.toArray();
        const [settings] = await db.settings.toArray();
        const meals = await db.meals.reverse().sortBy("date");
        const weeklyPlans = await db.weeklyPlans.reverse().sortBy("weekStartDate");
        const workoutLogs = await db.workouts.reverse().sortBy("date");
        const rawExerciseLibrary = (await db.exerciseLibrary.toArray()) as Array<Exercise & { targetMuscle?: string }>;
        const exerciseLibrary = rawExerciseLibrary.map(normalizeExercise);
        await db.exerciseLibrary.bulkPut(exerciseLibrary);
        const progressEntries = await db.progress.reverse().sortBy("date");
        const measurements = await db.measurements.reverse().sortBy("date");
        const goals = await db.goals.reverse().sortBy("updatedAt");
        const progressPhotos = await db.photos.reverse().sortBy("date");
        let adherenceSnapshots = await db.adherenceSnapshots.reverse().sortBy("createdAt");
        const milestones = await db.milestones.reverse().sortBy("date");
        let nutritionGoals = await db.nutritionGoals.reverse().sortBy("updatedAt");
        const hydrationEntries = await db.hydrationEntries.reverse().sortBy("date");
        const mealTemplates = await db.mealTemplates.reverse().sortBy("createdAt");
        const rawReminders = await db.reminders.toArray();
        const reminders = rawReminders.map(normalizeReminder);
        if (reminders.length > 0) {
          await db.reminders.bulkPut(reminders);
        }
        const reminderLogs = await db.reminderLogs.reverse().sortBy("at");

        if (user) {
          const currentGoal = goals[0] ?? null;
          const snapshot = buildWeeklyAdherenceSnapshot({ userId: user.id, workoutLogs, goal: currentGoal });
          const latest = adherenceSnapshots[0];
          if (!latest || latest.weekStartDate !== snapshot.weekStartDate || latest.completedSessions !== snapshot.completedSessions || latest.activeMinutes !== snapshot.activeMinutes || latest.targetMinutes !== snapshot.targetMinutes || latest.targetSessions !== snapshot.targetSessions) {
            await db.adherenceSnapshots.add(snapshot);
            adherenceSnapshots = [snapshot, ...adherenceSnapshots];
          }

          if (nutritionGoals.length === 0) {
            const defaults = buildDefaultNutritionGoal(user);
            const now = new Date().toISOString();
            const nutritionGoal: NutritionGoal = {
              id: uid("nutrition-goal"),
              userId: user.id,
              ...defaults,
              createdAt: now,
              updatedAt: now,
            };
            await db.nutritionGoals.add(nutritionGoal);
            nutritionGoals = [nutritionGoal];
          }
        }

        const recentRegion = meals.find((item) => item.region)?.region ?? "south_indian";

        set({
          hydrated: true,
          currentUser: user ?? null,
          meals,
          weeklyPlans,
          workoutLogs,
          exerciseLibrary,
          progressEntries,
          measurements,
          goals,
          progressPhotos,
          adherenceSnapshots,
          milestones,
          nutritionGoals,
          hydrationEntries,
          mealTemplates,
          dietRegion: recentRegion,
          reminders,
          reminderLogs,
          settings: settings ? { ...settings, bmiThresholdProfile: settings.bmiThresholdProfile ?? "standard" } : null,
          ui: { darkMode: settings?.darkMode ?? false },
        });
      },

      createOrUpdateProfile: async (data) => {
        const now = new Date().toISOString();
        const existing = get().currentUser;
        const avatarUrl = data.avatarUrl?.trim();

        const user: UserProfile = existing
          ? { ...existing, ...data, avatarUrl: avatarUrl || undefined, updatedAt: now }
          : { id: uid("user"), ...data, avatarUrl: avatarUrl || undefined, createdAt: now, updatedAt: now };

        await db.users.put(user);

        let settings = get().settings;
        if (!settings) {
          settings = baseSettings(user.id);
          await db.settings.put(settings);
        }

        const currentOnboarding = get().onboarding;
        const onboarding: OnboardingState = currentOnboarding.hasSeen
          ? {
              ...currentOnboarding,
              starterGoal: currentOnboarding.starterGoal ?? data.fitnessGoal,
            }
          : {
              hasSeen: true,
              skipped: false,
              completedAt: now,
              starterGoal: data.fitnessGoal,
            };

        set({ currentUser: user, settings, ui: { darkMode: settings.darkMode }, onboarding });
      },

      addMeal: async (mealType, foodNames, date, options) => {
        const user = get().currentUser;
        if (!user) return;

        const region = options?.region ?? get().dietRegion;
        const bucket = foodCatalogByRegion[region][mealType];
        const foodItems = foodNames
          .map((name) => bucket.find((item) => item.name.toLowerCase() === name.toLowerCase()) ?? null)
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (foodItems.length === 0) return;

        const calories = foodItems.reduce((sum, item) => sum + item.calories, 0);
        const protein = foodItems.reduce((sum, item) => sum + item.protein, 0);
        const carbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
        const fat = foodItems.reduce((sum, item) => sum + item.fat, 0);

        const meal: MealEntry = {
          id: uid("meal"),
          userId: user.id,
          mealType,
          foodItems,
          calories,
          protein,
          carbs,
          fat,
          date,
          region,
          mode: options?.mode,
          notes: options?.notes,
        };

        await db.meals.add(meal);
        set((state) => ({ meals: [meal, ...state.meals] }));
      },

      saveWeeklyPlan: async (weekStartDate, plan, options) => {
        const user = get().currentUser;
        if (!user) return;
        const existing = get().weeklyPlans.find((item) => item.weekStartDate === weekStartDate);
        const weeklyPlan: WeeklyPlan = {
          id: existing?.id ?? uid("week"),
          userId: user.id,
          weekStartDate,
          plan,
          region: options?.region,
          strategy: options?.strategy,
          templateId: options?.templateId,
          updatedAt: new Date().toISOString(),
        };
        await db.weeklyPlans.put(weeklyPlan);
        set((state) => ({
          weeklyPlans: [weeklyPlan, ...state.weeklyPlans.filter((item) => item.id !== weeklyPlan.id)],
        }));
      },

      addHydrationEntry: async (amountMl, date) => {
        const user = get().currentUser;
        if (!user || amountMl <= 0) return;

        const entry: HydrationEntry = {
          id: uid("hydration"),
          userId: user.id,
          amountMl,
          date,
          createdAt: new Date().toISOString(),
        };

        await db.hydrationEntries.add(entry);
        set((state) => ({ hydrationEntries: [entry, ...state.hydrationEntries] }));
      },

      upsertNutritionGoal: async (payload) => {
        const user = get().currentUser;
        if (!user) return;
        const existing = get().nutritionGoals[0];
        const now = new Date().toISOString();

        const goal: NutritionGoal = existing
          ? { ...existing, ...payload, updatedAt: now }
          : {
              id: uid("nutrition-goal"),
              userId: user.id,
              ...payload,
              createdAt: now,
              updatedAt: now,
            };

        await db.nutritionGoals.put(goal);
        set((state) => ({
          nutritionGoals: [goal, ...state.nutritionGoals.filter((item) => item.id !== goal.id)],
        }));
      },

      saveMealTemplate: async (name, mealType, foodNames, region, notes) => {
        const user = get().currentUser;
        if (!user || !name.trim()) return;
        const selectedRegion = region ?? get().dietRegion;
        const bucket = foodCatalogByRegion[selectedRegion][mealType];
        const foodItems = foodNames
          .map((itemName) => bucket.find((item) => item.name.toLowerCase() === itemName.toLowerCase()) ?? null)
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (foodItems.length === 0) return;

        const template: MealTemplate = {
          id: uid("meal-template"),
          userId: user.id,
          name,
          mealType,
          region: selectedRegion,
          foodItems,
          notes,
          createdAt: new Date().toISOString(),
        };

        await db.mealTemplates.add(template);
        set((state) => ({ mealTemplates: [template, ...state.mealTemplates] }));
      },

      setDietRegion: (region) => {
        set({ dietRegion: region });
      },

      addWorkoutLog: async (payload) => {
        const user = get().currentUser;
        if (!user) return;

        const workout: WorkoutLog = { ...payload, id: uid("workout") };
        await db.workouts.add(workout);

        const workoutLogs = [workout, ...get().workoutLogs];
        const goal = get().goals[0] ?? null;
        const snapshot = buildWeeklyAdherenceSnapshot({ userId: user.id, workoutLogs, goal });
        await db.adherenceSnapshots.add(snapshot);

        const milestones = [...get().milestones];
        if (snapshot.minutesRate >= 100 && !milestones.some((item) => item.type === "minutes_goal" && item.date === todayISO())) {
          const milestone: ProgressMilestone = {
            id: uid("milestone"),
            userId: user.id,
            type: "minutes_goal",
            title: "Weekly minutes goal reached",
            detail: `${snapshot.activeMinutes}/${snapshot.targetMinutes} minutes`,
            date: todayISO(),
          };
          await db.milestones.add(milestone);
          milestones.unshift(milestone);
        }

        if (snapshot.completionRate >= 100 && !milestones.some((item) => item.type === "consistency" && item.date === todayISO())) {
          const milestone: ProgressMilestone = {
            id: uid("milestone"),
            userId: user.id,
            type: "consistency",
            title: "Weekly session goal reached",
            detail: `${snapshot.completedSessions}/${snapshot.targetSessions} sessions`,
            date: todayISO(),
          };
          await db.milestones.add(milestone);
          milestones.unshift(milestone);
        }

        set((state) => ({
          workoutLogs,
          adherenceSnapshots: [snapshot, ...state.adherenceSnapshots],
          milestones,
        }));
      },

      addProgressEntry: async (weight, date, note) => {
        const user = get().currentUser;
        if (!user) return;

        const entry: ProgressEntry = { id: uid("progress"), userId: user.id, weight, date, note };
        await db.progress.add(entry);

        const milestones = [...get().milestones];
        const goal = get().goals[0];
        if (
          goal?.targetWeight !== undefined &&
          Math.abs(weight - goal.targetWeight) <= 0.3 &&
          !milestones.some((item) => item.type === "weight_goal" && item.date === date)
        ) {
          const milestone: ProgressMilestone = {
            id: uid("milestone"),
            userId: user.id,
            type: "weight_goal",
            title: "Target weight reached",
            detail: `${weight} kg`,
            date,
          };
          await db.milestones.add(milestone);
          milestones.unshift(milestone);
        }

        set((state) => ({ progressEntries: [entry, ...state.progressEntries], milestones }));
      },

      addMeasurementEntry: async (payload) => {
        const user = get().currentUser;
        if (!user) return;

        const entry: MeasurementEntry = {
          id: uid("measure"),
          userId: user.id,
          ...payload,
        };
        await db.measurements.add(entry);
        set((state) => ({ measurements: [entry, ...state.measurements] }));
      },

      upsertProgressGoal: async (payload) => {
        const user = get().currentUser;
        if (!user) return;
        const now = new Date().toISOString();
        const existing = get().goals[0];

        const goal: ProgressGoal = existing
          ? { ...existing, ...payload, updatedAt: now }
          : {
              id: uid("goal"),
              userId: user.id,
              targetWeight: payload.targetWeight,
              targetDate: payload.targetDate,
              weeklyTargetMinutes: payload.weeklyTargetMinutes,
              weeklyTargetSessions: payload.weeklyTargetSessions,
              createdAt: now,
              updatedAt: now,
            };

        await db.goals.put(goal);

        const snapshot = buildWeeklyAdherenceSnapshot({
          userId: user.id,
          workoutLogs: get().workoutLogs,
          goal,
        });
        await db.adherenceSnapshots.add(snapshot);

        set((state) => ({
          goals: [goal, ...state.goals.filter((item) => item.id !== goal.id)],
          adherenceSnapshots: [snapshot, ...state.adherenceSnapshots],
        }));
      },

      addProgressPhoto: async (imageUrl, date, note) => {
        const user = get().currentUser;
        if (!user || !imageUrl.trim()) return;

        const photo: ProgressPhoto = {
          id: uid("photo"),
          userId: user.id,
          imageUrl,
          date,
          note,
        };

        await db.photos.add(photo);
        set((state) => ({ progressPhotos: [photo, ...state.progressPhotos] }));
      },

      addReminder: async (title, type, scheduleType, time, options) => {
        const user = get().currentUser;
        if (!user) return;
        const now = new Date().toISOString();
        const reminder: Reminder = {
          id: uid("reminder"),
          userId: user.id,
          title,
          note: options?.note,
          type,
          scheduleType,
          daysOfWeek: options?.daysOfWeek ?? [],
          time,
          priority: options?.priority ?? "medium",
          enabled: true,
          createdAt: now,
          updatedAt: now,
        };
        await db.reminders.add(reminder);
        set((state) => ({ reminders: [...state.reminders, reminder] }));
      },

      toggleReminder: async (id) => {
        const reminder = get().reminders.find((item) => item.id === id);
        if (!reminder) return;
        const updated = {
          ...reminder,
          enabled: !reminder.enabled,
          snoozeUntil: undefined,
          updatedAt: new Date().toISOString(),
        };
        await db.reminders.put(updated);
        set((state) => ({
          reminders: state.reminders.map((item) => (item.id === id ? updated : item)),
        }));
      },

      snoozeReminder: async (id, minutes) => {
        const reminder = get().reminders.find((item) => item.id === id);
        const user = get().currentUser;
        if (!reminder || !user || minutes <= 0) return;

        const snoozeDate = new Date();
        snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes);

        const updated: Reminder = {
          ...reminder,
          snoozeUntil: snoozeDate.toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const log: ReminderLog = {
          id: uid("reminder-log"),
          userId: user.id,
          reminderId: reminder.id,
          action: "snoozed",
          at: new Date().toISOString(),
        };

        await db.reminders.put(updated);
        await db.reminderLogs.add(log);

        set((state) => ({
          reminders: state.reminders.map((item) => (item.id === id ? updated : item)),
          reminderLogs: [log, ...state.reminderLogs],
        }));
      },

      markReminderTriggered: async (id, triggeredAt) => {
        const reminder = get().reminders.find((item) => item.id === id);
        const user = get().currentUser;
        if (!reminder || !user) return;

        const at = triggeredAt ?? new Date().toISOString();
        const updated: Reminder = {
          ...reminder,
          snoozeUntil:
            reminder.snoozeUntil && new Date(reminder.snoozeUntil).getTime() <= new Date(at).getTime()
              ? undefined
              : reminder.snoozeUntil,
          lastTriggeredAt: at,
          updatedAt: at,
        };

        const log: ReminderLog = {
          id: uid("reminder-log"),
          userId: user.id,
          reminderId: reminder.id,
          action: "triggered",
          at,
        };

        await db.reminders.put(updated);
        await db.reminderLogs.add(log);

        set((state) => ({
          reminders: state.reminders.map((item) => (item.id === id ? updated : item)),
          reminderLogs: [log, ...state.reminderLogs],
        }));
      },

      markReminderDone: async (id) => {
        const reminder = get().reminders.find((item) => item.id === id);
        const user = get().currentUser;
        if (!reminder || !user) return;

        const now = new Date().toISOString();
        const updated: Reminder = {
          ...reminder,
          snoozeUntil: undefined,
          lastTriggeredAt: now,
          updatedAt: now,
        };

        const log: ReminderLog = {
          id: uid("reminder-log"),
          userId: user.id,
          reminderId: reminder.id,
          action: "done",
          at: now,
        };

        await db.reminders.put(updated);
        await db.reminderLogs.add(log);

        set((state) => ({
          reminders: state.reminders.map((item) => (item.id === id ? updated : item)),
          reminderLogs: [log, ...state.reminderLogs],
        }));
      },

      getTodayMeals: () => {
        const today = todayISO();
        return get().meals.filter((meal) => meal.date === today);
      },

      getGoalSuggestions: () => {
        const user = get().currentUser;
        if (!user) return null;
        const region = get().dietRegion;
        const recentNames = get()
          .meals.slice(0, 8)
          .flatMap((meal) => meal.foodItems.map((item) => item.name));
        return suggestMeals(user.fitnessGoal, foodCatalogByRegion[region], recentNames);
      },

      getTodayReminderSummary: () => {
        const now = new Date();
        const today = toISODate(now);
        const reminders = get().reminders;
        const enabledReminders = reminders.filter((item) => item.enabled);
        const dueToday = enabledReminders.filter((item) => isReminderScheduledForDate(item, now));
        const dueNow = enabledReminders.filter((item) => isReminderDueNow(item, now));
        const completedToday = get().reminderLogs.filter(
          (log) => log.action === "done" && log.at.startsWith(today),
        );
        const snoozedCount = enabledReminders.filter(
          (item) => item.snoozeUntil && new Date(item.snoozeUntil) > now,
        ).length;

        const completionRate = dueToday.length > 0 ? roundToInt((completedToday.length / dueToday.length) * 100) : 0;

        return {
          enabledCount: enabledReminders.length,
          dueTodayCount: dueToday.length,
          dueNowCount: dueNow.length,
          completedTodayCount: completedToday.length,
          snoozedCount,
          completionRate,
        };
      },

      getTodayDietSummary: () => {
        const today = todayISO();
        const todayMeals = get().meals.filter((meal) => meal.date === today);
        const todayWater = get()
          .hydrationEntries.filter((entry) => entry.date === today)
          .reduce((sum, entry) => sum + entry.amountMl, 0);
        const goal = get().nutritionGoals[0];

        return {
          calories: todayMeals.reduce((sum, meal) => sum + meal.calories, 0),
          protein: todayMeals.reduce((sum, meal) => sum + meal.protein, 0),
          carbs: todayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
          fat: todayMeals.reduce((sum, meal) => sum + meal.fat, 0),
          hydrationMl: todayWater,
          calorieTarget: goal?.calorieTarget ?? 0,
          proteinTarget: goal?.proteinTarget ?? 0,
          carbsTarget: goal?.carbsTarget ?? 0,
          fatTarget: goal?.fatTarget ?? 0,
          waterTargetMl: goal?.waterTargetMl ?? 0,
        };
      },

      exportData: async () => {
        const payload: AppExportPayload = {
          user: get().currentUser,
          meals: get().meals,
          weeklyPlans: get().weeklyPlans,
          nutritionGoals: get().nutritionGoals,
          hydrationEntries: get().hydrationEntries,
          mealTemplates: get().mealTemplates,
          workouts: get().workoutLogs,
          progress: get().progressEntries,
          measurements: get().measurements,
          goals: get().goals,
          photos: get().progressPhotos,
          adherenceSnapshots: get().adherenceSnapshots,
          milestones: get().milestones,
          reminders: get().reminders,
          reminderLogs: get().reminderLogs,
          settings: get().settings,
          exportedAt: new Date().toISOString(),
        };

        downloadJson(`minefit-export-${todayISO()}.json`, payload);
      },

      importData: async (payload) => {
        const meals = Array.isArray(payload.meals) ? payload.meals : [];
        const weeklyPlans = Array.isArray(payload.weeklyPlans) ? payload.weeklyPlans : [];
        const workoutLogs = Array.isArray(payload.workouts) ? payload.workouts : [];
        const nutritionGoals = Array.isArray(payload.nutritionGoals) ? payload.nutritionGoals : [];
        const hydrationEntries = Array.isArray(payload.hydrationEntries)
          ? payload.hydrationEntries
          : [];
        const mealTemplates = Array.isArray(payload.mealTemplates) ? payload.mealTemplates : [];
        const progressEntries = Array.isArray(payload.progress) ? payload.progress : [];
        const measurements = Array.isArray(payload.measurements) ? payload.measurements : [];
        const goals = Array.isArray(payload.goals) ? payload.goals : [];
        const progressPhotos = Array.isArray(payload.photos) ? payload.photos : [];
        const adherenceSnapshots = Array.isArray(payload.adherenceSnapshots)
          ? payload.adherenceSnapshots
          : [];
        const milestones = Array.isArray(payload.milestones) ? payload.milestones : [];
        const reminders = Array.isArray(payload.reminders)
          ? payload.reminders.map((item) => normalizeReminder(item))
          : [];
        const reminderLogs = Array.isArray(payload.reminderLogs) ? payload.reminderLogs : [];

        await Promise.all([
          db.users.clear(),
          db.meals.clear(),
          db.weeklyPlans.clear(),
          db.workouts.clear(),
          db.nutritionGoals.clear(),
          db.hydrationEntries.clear(),
          db.mealTemplates.clear(),
          db.progress.clear(),
          db.measurements.clear(),
          db.goals.clear(),
          db.photos.clear(),
          db.adherenceSnapshots.clear(),
          db.milestones.clear(),
          db.reminders.clear(),
          db.reminderLogs.clear(),
          db.settings.clear(),
        ]);

        if (payload.user) await db.users.put(payload.user);
        if (payload.settings) await db.settings.put(payload.settings);
        if (meals.length > 0) await db.meals.bulkAdd(meals);
        if (weeklyPlans.length > 0) await db.weeklyPlans.bulkAdd(weeklyPlans);
        if (workoutLogs.length > 0) await db.workouts.bulkAdd(workoutLogs);
        if (nutritionGoals.length > 0) await db.nutritionGoals.bulkAdd(nutritionGoals);
        if (hydrationEntries.length > 0) await db.hydrationEntries.bulkAdd(hydrationEntries);
        if (mealTemplates.length > 0) await db.mealTemplates.bulkAdd(mealTemplates);
        if (progressEntries.length > 0) await db.progress.bulkAdd(progressEntries);
        if (measurements.length > 0) await db.measurements.bulkAdd(measurements);
        if (goals.length > 0) await db.goals.bulkAdd(goals);
        if (progressPhotos.length > 0) await db.photos.bulkAdd(progressPhotos);
        if (adherenceSnapshots.length > 0) await db.adherenceSnapshots.bulkAdd(adherenceSnapshots);
        if (milestones.length > 0) await db.milestones.bulkAdd(milestones);
        if (reminders.length > 0) await db.reminders.bulkAdd(reminders);
        if (reminderLogs.length > 0) await db.reminderLogs.bulkAdd(reminderLogs);

        set({
          currentUser: payload.user ?? null,
          meals,
          weeklyPlans,
          workoutLogs,
          nutritionGoals,
          hydrationEntries,
          mealTemplates,
          dietRegion: meals.find((item) => item.region)?.region ?? "south_indian",
          progressEntries,
          measurements,
          goals,
          progressPhotos,
          adherenceSnapshots,
          milestones,
          reminders,
          reminderLogs,
          settings: payload.settings ?? null,
          ui: { darkMode: payload.settings?.darkMode ?? false },
        });
      },

      clearAllData: async () => {
        await Promise.all([
          db.users.clear(),
          db.meals.clear(),
          db.weeklyPlans.clear(),
          db.workouts.clear(),
          db.nutritionGoals.clear(),
          db.hydrationEntries.clear(),
          db.mealTemplates.clear(),
          db.progress.clear(),
          db.measurements.clear(),
          db.goals.clear(),
          db.photos.clear(),
          db.adherenceSnapshots.clear(),
          db.milestones.clear(),
          db.reminders.clear(),
          db.reminderLogs.clear(),
          db.settings.clear(),
        ]);

        set({
          onboarding: {
            hasSeen: false,
            skipped: false,
          },
          currentUser: null,
          meals: [],
          weeklyPlans: [],
          workoutLogs: [],
          nutritionGoals: [],
          hydrationEntries: [],
          mealTemplates: [],
          dietRegion: "south_indian",
          progressEntries: [],
          measurements: [],
          goals: [],
          progressPhotos: [],
          adherenceSnapshots: [],
          milestones: [],
          reminders: [],
          reminderLogs: [],
          settings: null,
          ui: { darkMode: false },
        });
      },

      completeOnboarding: (payload) => {
        const now = new Date().toISOString();
        set((state) => ({
          onboarding: {
            hasSeen: true,
            skipped: payload?.skipped ?? state.onboarding.skipped,
            completedAt: now,
            starterGoal: payload?.starterGoal ?? state.onboarding.starterGoal,
          },
        }));
      },

      setDarkMode: async (enabled) => {
        const settings = get().settings;
        const currentUser = get().currentUser;

        if (!settings && !currentUser) {
          set({ ui: { darkMode: enabled } });
          return;
        }

        if (!settings && currentUser) {
          const created = {
            ...baseSettings(currentUser.id),
            darkMode: enabled,
          };
          await db.settings.put(created);
          set({ settings: created, ui: { darkMode: enabled } });
          return;
        }

        const updated = { ...settings!, darkMode: enabled };
        await db.settings.put(updated);
        set({ settings: updated, ui: { darkMode: enabled } });
      },

      setUnits: async (units) => {
        const settings = get().settings;
        const currentUser = get().currentUser;

        if (!settings && !currentUser) {
          return;
        }

        if (!settings && currentUser) {
          const created = {
            ...baseSettings(currentUser.id),
            units,
          };
          await db.settings.put(created);
          set({ settings: created, ui: { darkMode: created.darkMode } });
          return;
        }

        const updated = { ...settings!, units };
        await db.settings.put(updated);
        set({ settings: updated, ui: { darkMode: updated.darkMode } });
      },

      setBmiThresholdProfile: async (profile) => {
        const settings = get().settings;
        const currentUser = get().currentUser;

        if (!settings && !currentUser) {
          return;
        }

        if (!settings && currentUser) {
          const created = {
            ...baseSettings(currentUser.id),
            bmiThresholdProfile: profile,
          };
          await db.settings.put(created);
          set({ settings: created, ui: { darkMode: created.darkMode } });
          return;
        }

        const updated = { ...settings!, bmiThresholdProfile: profile };
        await db.settings.put(updated);
        set({ settings: updated, ui: { darkMode: updated.darkMode } });
      },
    }),
    {
      name: "minefit-ui",
      partialize: (state) => ({ ui: state.ui, onboarding: state.onboarding }),
    },
  ),
);

export function getWorkoutStreak(logs: WorkoutLog[]) {
  const completedDays = new Set(logs.filter((log) => log.completed).map((log) => log.date));
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (!completedDays.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getWeeklyWorkoutCount(logs: WorkoutLog[]) {
  const weekStart = weekStartISO();
  return logs.filter((log) => log.date >= weekStart && log.completed).length;
}

export function getWeeklyActiveMinutes(logs: WorkoutLog[]) {
  const weekStart = weekStartISO();
  return logs
    .filter((log) => log.date >= weekStart && log.completed)
    .reduce((sum, log) => sum + log.duration, 0);
}
