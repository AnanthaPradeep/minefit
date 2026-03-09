import { db } from "@/lib/db";
import { workoutExerciseCatalog, yogaPoseCatalog } from "@/lib/workout-yoga-catalog";
import type { DietRegion, Exercise, FoodItem, MealType, WorkoutTiming } from "@/lib/types";

const EXERCISE_LIBRARY_SEED_VERSION = "video-map-v2";

export const southIndianFoods: Record<MealType, FoodItem[]> = {
  morning: [
    { name: "Idli", calories: 120, protein: 4, carbs: 24, fat: 1 },
    { name: "Dosa", calories: 180, protein: 5, carbs: 28, fat: 5 },
    { name: "Appam", calories: 160, protein: 3, carbs: 31, fat: 2 },
    { name: "Upma", calories: 200, protein: 6, carbs: 30, fat: 6 },
    { name: "Puttu", calories: 210, protein: 5, carbs: 35, fat: 5 },
    { name: "Idiyappam", calories: 150, protein: 3, carbs: 31, fat: 1 },
  ],
  afternoon: [
    { name: "Rice", calories: 220, protein: 4, carbs: 45, fat: 1 },
    { name: "Sambar", calories: 130, protein: 6, carbs: 16, fat: 4 },
    { name: "Rasam", calories: 80, protein: 2, carbs: 12, fat: 2 },
    { name: "Vegetable Curry", calories: 160, protein: 4, carbs: 18, fat: 7 },
    { name: "Curd Rice", calories: 250, protein: 7, carbs: 36, fat: 8 },
    { name: "Sadya Mix", calories: 300, protein: 8, carbs: 44, fat: 10 },
  ],
  evening: [
    { name: "Sundal", calories: 140, protein: 8, carbs: 20, fat: 3 },
    { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: "Peanuts", calories: 160, protein: 7, carbs: 6, fat: 13 },
    { name: "Coconut Snack", calories: 120, protein: 2, carbs: 10, fat: 8 },
  ],
  night: [
    { name: "Chapati", calories: 120, protein: 4, carbs: 20, fat: 2 },
    { name: "Dosa", calories: 180, protein: 5, carbs: 28, fat: 5 },
    { name: "Vegetable Curry", calories: 160, protein: 4, carbs: 18, fat: 7 },
    { name: "Soup", calories: 90, protein: 4, carbs: 12, fat: 3 },
  ],
};

export const northIndianFoods: Record<MealType, FoodItem[]> = {
  morning: [
    { name: "Aloo Paratha", calories: 260, protein: 7, carbs: 34, fat: 10 },
    { name: "Poha", calories: 180, protein: 4, carbs: 30, fat: 5 },
    { name: "Moong Chilla", calories: 190, protein: 10, carbs: 21, fat: 6 },
    { name: "Dahi + Fruit", calories: 170, protein: 8, carbs: 22, fat: 5 },
  ],
  afternoon: [
    { name: "Roti", calories: 120, protein: 4, carbs: 20, fat: 2 },
    { name: "Dal Tadka", calories: 170, protein: 9, carbs: 20, fat: 6 },
    { name: "Jeera Rice", calories: 220, protein: 4, carbs: 43, fat: 3 },
    { name: "Paneer Bhurji", calories: 230, protein: 14, carbs: 8, fat: 15 },
  ],
  evening: [
    { name: "Roasted Chana", calories: 130, protein: 7, carbs: 18, fat: 2 },
    { name: "Sprouts Chaat", calories: 145, protein: 9, carbs: 20, fat: 3 },
    { name: "Masala Buttermilk", calories: 70, protein: 3, carbs: 8, fat: 3 },
    { name: "Apple", calories: 95, protein: 0, carbs: 25, fat: 0 },
  ],
  night: [
    { name: "Phulka", calories: 110, protein: 4, carbs: 19, fat: 2 },
    { name: "Mixed Veg Sabzi", calories: 160, protein: 5, carbs: 18, fat: 7 },
    { name: "Dal", calories: 150, protein: 8, carbs: 18, fat: 5 },
    { name: "Palak Paneer", calories: 220, protein: 13, carbs: 9, fat: 14 },
  ],
};

export const balancedIndianFoods: Record<MealType, FoodItem[]> = {
  morning: [
    { name: "Oats Upma", calories: 180, protein: 7, carbs: 28, fat: 5 },
    { name: "Idli", calories: 120, protein: 4, carbs: 24, fat: 1 },
    { name: "Moong Chilla", calories: 190, protein: 10, carbs: 21, fat: 6 },
    { name: "Vegetable Dalia", calories: 175, protein: 6, carbs: 30, fat: 4 },
  ],
  afternoon: [
    { name: "Brown Rice", calories: 210, protein: 5, carbs: 43, fat: 2 },
    { name: "Sambar", calories: 130, protein: 6, carbs: 16, fat: 4 },
    { name: "Dal", calories: 150, protein: 8, carbs: 18, fat: 5 },
    { name: "Grilled Paneer", calories: 200, protein: 16, carbs: 6, fat: 12 },
  ],
  evening: [
    { name: "Sundal", calories: 140, protein: 8, carbs: 20, fat: 3 },
    { name: "Sprouts Chaat", calories: 145, protein: 9, carbs: 20, fat: 3 },
    { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: "Nuts Mix", calories: 170, protein: 6, carbs: 8, fat: 13 },
  ],
  night: [
    { name: "Chapati", calories: 120, protein: 4, carbs: 20, fat: 2 },
    { name: "Vegetable Curry", calories: 160, protein: 4, carbs: 18, fat: 7 },
    { name: "Soup", calories: 90, protein: 4, carbs: 12, fat: 3 },
    { name: "Curd", calories: 85, protein: 4, carbs: 6, fat: 4 },
  ],
};

export const foodCatalogByRegion: Record<DietRegion, Record<MealType, FoodItem[]>> = {
  south_indian: southIndianFoods,
  north_indian: northIndianFoods,
  balanced_indian: balancedIndianFoods,
};

export const defaultExercises: Exercise[] = [
  ...workoutExerciseCatalog,
  ...yogaPoseCatalog.map((pose) => ({
    id: pose.id,
    name: pose.name,
    category: "yoga" as const,
    imageUrl: pose.imageUrl,
    equipment: "mat",
    difficulty: pose.difficulty,
    workoutTiming: (pose.bestTime === "after-meal" ? "post-meal" : "anytime") as WorkoutTiming,
    targetMuscles: ["Flexibility", "Mobility"],
    caloriesBurnPerMinute: 4,
    description: pose.description,
    benefits: pose.benefits,
    duration: pose.duration,
    restTime: 20,
    recommendedSets: 1,
    recommendedReps: 1,
    steps: pose.steps,
    mistakesToAvoid: ["Forcing into pain", "Holding breath"],
    youtubeId: pose.youtubeId,
    youtubeUrl: pose.youtubeUrl,
  })),
];

export async function seedLibraryIfNeeded() {
  const versionMeta = await db.meta.get("exerciseLibrarySeedVersion");
  const currentCount = await db.exerciseLibrary.count();
  if (versionMeta?.value === EXERCISE_LIBRARY_SEED_VERSION && currentCount > 0) {
    return;
  }

  await db.exerciseLibrary.clear();
  await db.exerciseLibrary.bulkAdd(defaultExercises);
  await db.meta.put({ key: "exerciseLibrarySeedVersion", value: EXERCISE_LIBRARY_SEED_VERSION });
}
