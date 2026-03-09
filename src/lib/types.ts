export type FitnessGoal =
  | "weight_loss"
  | "weight_gain"
  | "maintain_health"
  | "improve_fitness"
  | "yoga_flexibility";

export type MealType = "morning" | "afternoon" | "evening" | "night";
export type DietRegion = "south_indian" | "north_indian" | "balanced_indian";
export type MealLogMode = "quick" | "detailed";

export type ExerciseCategory =
  | "pre_meal"
  | "post_meal"
  | "free_hand"
  | "dumbbell"
  | "resistance_band"
  | "kettlebell"
  | "gym_barbell"
  | "gym_machine"
  | "cardio"
  | "yoga";

export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced";
export type WorkoutTiming = "pre-meal" | "post-meal" | "anytime";
export type YogaBestTime = "morning" | "evening" | "after-meal";

export type ReminderType = "workout" | "yoga" | "meal" | "water";
export type ReminderScheduleType = "daily" | "weekly" | "monthly" | "custom";
export type ReminderPriority = "low" | "medium" | "high";
export type BmiThresholdProfile = "standard" | "asian";

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female" | "other";
  fitnessGoal: FitnessGoal;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  userId: string;
  mealType: MealType;
  foodItems: FoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  region?: DietRegion;
  mode?: MealLogMode;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStartDate: string;
  plan: Record<string, unknown>;
  region?: DietRegion;
  strategy?: string;
  templateId?: string;
  updatedAt?: string;
}

export interface NutritionGoal {
  id: string;
  userId: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  fiberTarget: number;
  waterTargetMl: number;
  createdAt: string;
  updatedAt: string;
}

export interface HydrationEntry {
  id: string;
  userId: string;
  date: string;
  amountMl: number;
  createdAt: string;
}

export interface MealTemplate {
  id: string;
  userId: string;
  name: string;
  region: DietRegion;
  mealType: MealType;
  foodItems: FoodItem[];
  notes?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  imageUrl?: string;
  equipment: string;
  difficulty: WorkoutDifficulty;
  workoutTiming: WorkoutTiming;
  targetMuscles: string[];
  caloriesBurnPerMinute: number;
  description: string;
  benefits: string[];
  duration: number;
  restTime: number;
  recommendedSets: number;
  recommendedReps: number;
  steps: string[];
  mistakesToAvoid: string[];
  youtubeUrl?: string;
}

export interface YogaPose {
  id: string;
  name: string;
  category: "beginner" | "intermediate" | "advanced" | "relaxation" | "digestion";
  imageUrl?: string;
  difficulty: WorkoutDifficulty;
  duration: number;
  description: string;
  benefits: string[];
  steps: string[];
  breathingTechnique: string;
  precautions: string[];
  bestTime: YogaBestTime;
  youtubeUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  planType: "custom" | "weekly" | "home" | "gym";
  exerciseIds: string[];
  createdAt: string;
}

export interface YogaRoutine {
  id: string;
  title: string;
  poseIds: string[];
  focus: "flexibility" | "relaxation" | "digestion" | "strength";
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  exerciseName: string;
  category: ExerciseCategory;
  duration: number;
  completed: boolean;
  date: string;
  caloriesBurned: number;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  weight: number;
  date: string;
  note?: string;
}

export interface MeasurementEntry {
  id: string;
  userId: string;
  waist?: number;
  chest?: number;
  hips?: number;
  bodyFat?: number;
  date: string;
  note?: string;
}

export interface ProgressGoal {
  id: string;
  userId: string;
  targetWeight?: number;
  targetDate?: string;
  weeklyTargetMinutes: number;
  weeklyTargetSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  date: string;
  note?: string;
}

export interface AdherenceSnapshot {
  id: string;
  userId: string;
  weekStartDate: string;
  completedSessions: number;
  targetSessions: number;
  completionRate: number;
  activeMinutes: number;
  targetMinutes: number;
  minutesRate: number;
  createdAt: string;
}

export interface ProgressMilestone {
  id: string;
  userId: string;
  type: "streak" | "weight_goal" | "consistency" | "minutes_goal";
  title: string;
  detail?: string;
  date: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  note?: string;
  type: ReminderType;
  scheduleType: ReminderScheduleType;
  daysOfWeek: number[];
  time: string;
  priority: ReminderPriority;
  snoozeUntil?: string;
  lastTriggeredAt?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderLog {
  id: string;
  userId: string;
  reminderId: string;
  action: "done" | "snoozed" | "skipped" | "triggered";
  at: string;
}

export interface AppSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  soundEnabled: boolean;
  units: "metric" | "imperial";
  bmiThresholdProfile?: BmiThresholdProfile;
}

export interface OnboardingState {
  hasSeen: boolean;
  skipped: boolean;
  completedAt?: string;
  starterGoal?: FitnessGoal;
}

export interface AppExportPayload {
  user: UserProfile | null;
  meals: MealEntry[];
  weeklyPlans: WeeklyPlan[];
  nutritionGoals?: NutritionGoal[];
  hydrationEntries?: HydrationEntry[];
  mealTemplates?: MealTemplate[];
  workouts: WorkoutLog[];
  progress: ProgressEntry[];
  measurements: MeasurementEntry[];
  goals: ProgressGoal[];
  photos: ProgressPhoto[];
  adherenceSnapshots: AdherenceSnapshot[];
  milestones: ProgressMilestone[];
  reminders: Reminder[];
  reminderLogs?: ReminderLog[];
  settings: AppSettings | null;
  exportedAt: string;
}
