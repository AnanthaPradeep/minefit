import type { FitnessGoal, FoodItem, MealType } from "@/lib/types";

type MealBuckets = Record<MealType, FoodItem[]>;

function sortByGoal(goal: FitnessGoal, foods: FoodItem[]) {
  if (goal === "weight_loss") {
    return [...foods].sort((a, b) => a.calories - b.calories || b.protein - a.protein);
  }

  if (goal === "weight_gain") {
    return [...foods].sort((a, b) => b.protein - a.protein || b.calories - a.calories);
  }

  if (goal === "improve_fitness") {
    return [...foods].sort((a, b) => b.protein + b.carbs - (a.protein + a.carbs));
  }

  if (goal === "yoga_flexibility") {
    return [...foods].sort((a, b) => a.fat - b.fat || a.calories - b.calories);
  }

  return [...foods].sort((a, b) => b.protein - a.protein);
}

export function suggestMeals(
  goal: FitnessGoal,
  foodDb: MealBuckets,
  recentMeals: string[] = [],
) {
  const pick = (mealType: MealType) => {
    const options = sortByGoal(goal, foodDb[mealType]).filter(
      (item) => !recentMeals.includes(item.name),
    );
    return options[0] ?? sortByGoal(goal, foodDb[mealType])[0];
  };

  const morning = pick("morning");
  const afternoon = pick("afternoon");
  const evening = pick("evening");
  const night = pick("night");

  const totalCalories = [morning, afternoon, evening, night].reduce((sum, item) => sum + item.calories, 0);

  return {
    morning,
    afternoon,
    evening,
    night,
    totalCalories,
  };
}
