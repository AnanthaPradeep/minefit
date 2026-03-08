import workoutsJson from "@/data/workouts.json";
import yogaJson from "@/data/yoga.json";
import type {
  Exercise,
  ExerciseCategory,
  FitnessGoal,
  WorkoutDifficulty,
  WorkoutPlan,
  WorkoutTiming,
  YogaPose,
  YogaRoutine,
} from "@/lib/types";

interface WorkoutJsonShape {
  image_seed_prefix: string;
  pre_meal: string[];
  post_meal: string[];
  free_hand: {
    upper_body: string[];
    lower_body: string[];
    core: string[];
    full_body: string[];
  };
  dumbbell: {
    chest: string[];
    shoulders: string[];
    back: string[];
    arms: string[];
    legs: string[];
  };
  resistance_band: string[];
  kettlebell: string[];
  gym_barbell: string[];
  gym_machine: string[];
  cardio: string[];
}

interface YogaJsonShape {
  image_seed_prefix: string;
  beginner: string[];
  intermediate: string[];
  advanced: string[];
  relaxation: string[];
  digestion: string[];
}

const workoutsData = workoutsJson as WorkoutJsonShape;
const yogaData = yogaJson as YogaJsonShape;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeId(prefix: string, category: string, name: string) {
  return `${prefix}_${slugify(category)}_${slugify(name)}`;
}

function makeImageUrl(seedPrefix: string, category: string, name: string) {
  const seed = slugify(`${seedPrefix}-${category}-${name}`);
  return `https://picsum.photos/seed/${seed}/1200/720`;
}

function difficultyForName(name: string): WorkoutDifficulty {
  if (/Headstand|Handstand|Snatch|Turkish|Deadlift/i.test(name)) return "advanced";
  if (/Decline|Bulgarian|Renegade|Jump Squats|Overhead Press|Barbell Row/i.test(name)) return "intermediate";
  return "beginner";
}

function timingForCategory(category: ExerciseCategory): WorkoutTiming {
  if (category === "pre_meal") return "pre-meal";
  if (category === "post_meal") return "post-meal";
  return "anytime";
}

function equipmentForCategory(category: ExerciseCategory): string {
  if (category === "dumbbell") return "dumbbell";
  if (category === "resistance_band") return "resistance-band";
  if (category === "kettlebell") return "kettlebell";
  if (category === "gym_barbell") return "barbell";
  if (category === "gym_machine") return "machine";
  if (category === "yoga") return "mat";
  return "bodyweight";
}

function targetForName(name: string): string[] {
  if (/Squat|Lunge|Leg|Step/i.test(name)) return ["Quadriceps", "Glutes", "Hamstrings"];
  if (/Push|Press|Fly/i.test(name)) return ["Chest", "Shoulders", "Triceps"];
  if (/Row|Pulldown|Deadlift/i.test(name)) return ["Back", "Biceps", "Core"];
  if (/Plank|Crunch|Twist|Core|Mountain/i.test(name)) return ["Core", "Obliques"];
  if (/Run|Cycle|Jump|Stair|Cardio|Jogging/i.test(name)) return ["Cardio", "Legs"];
  return ["Full Body"];
}

function buildExercise(name: string, category: ExerciseCategory, description: string): Exercise {
  const difficulty = difficultyForName(name);
  return {
    id: makeId("ex", category, name),
    name,
    category,
    imageUrl: makeImageUrl(workoutsData.image_seed_prefix, category, name),
    equipment: equipmentForCategory(category),
    difficulty,
    workoutTiming: timingForCategory(category),
    targetMuscles: targetForName(name),
    caloriesBurnPerMinute: difficulty === "advanced" ? 11 : difficulty === "intermediate" ? 9 : 7,
    description,
    benefits: [
      "Improves movement quality",
      "Builds strength and endurance",
      "Supports metabolic health",
    ],
    steps: [
      "Start in controlled posture",
      "Keep core engaged and breathe steadily",
      "Perform full range of motion with control",
      "Return to starting position and repeat",
    ],
    mistakesToAvoid: [
      "Rushing reps with poor form",
      "Holding breath during effort",
      "Overarching lower back",
    ],
    duration: difficulty === "advanced" ? 18 : 12,
    restTime: difficulty === "advanced" ? 45 : 60,
    recommendedSets: difficulty === "advanced" ? 4 : 3,
    recommendedReps: difficulty === "advanced" ? 15 : 12,
    youtubeUrl: "https://www.youtube.com/embed/2pLT-olgUJs",
  };
}

function makeCategoryExercises(names: string[], category: ExerciseCategory, description: string) {
  return names.map((name) => buildExercise(name, category, description));
}

const freeHandNames = [
  ...workoutsData.free_hand.upper_body,
  ...workoutsData.free_hand.lower_body,
  ...workoutsData.free_hand.core,
  ...workoutsData.free_hand.full_body,
];

const dumbbellNames = [
  ...workoutsData.dumbbell.chest,
  ...workoutsData.dumbbell.shoulders,
  ...workoutsData.dumbbell.back,
  ...workoutsData.dumbbell.arms,
  ...workoutsData.dumbbell.legs,
];

export const workoutExerciseCatalog: Exercise[] = [
  ...makeCategoryExercises(
    workoutsData.pre_meal,
    "pre_meal",
    "Pre-meal movement to activate metabolism and mobility.",
  ),
  ...makeCategoryExercises(
    workoutsData.post_meal,
    "post_meal",
    "Light post-meal movement to aid digestion and reduce bloating.",
  ),
  ...makeCategoryExercises(
    freeHandNames,
    "free_hand",
    "Bodyweight exercise for home and travel workouts.",
  ),
  ...makeCategoryExercises(
    dumbbellNames,
    "dumbbell",
    "Dumbbell resistance training for full-body strength.",
  ),
  ...makeCategoryExercises(
    workoutsData.resistance_band,
    "resistance_band",
    "Joint-friendly resistance band training.",
  ),
  ...makeCategoryExercises(
    workoutsData.kettlebell,
    "kettlebell",
    "Explosive kettlebell work for power and conditioning.",
  ),
  ...makeCategoryExercises(
    workoutsData.gym_barbell,
    "gym_barbell",
    "Compound barbell lifts for progressive overload.",
  ),
  ...makeCategoryExercises(
    workoutsData.gym_machine,
    "gym_machine",
    "Machine-based focused training.",
  ),
  ...makeCategoryExercises(
    workoutsData.cardio,
    "cardio",
    "Cardio sessions for heart health and calorie burn.",
  ),
];

const yogaDescriptions = {
  beginner: "Foundation yoga pose for mobility and alignment.",
  intermediate: "Intermediate yoga pose for balance and control.",
  advanced: "Advanced yoga pose requiring strength and stability.",
  relaxation: "Restorative pose to calm the nervous system.",
  digestion: "Post-meal digestive support pose.",
} as const;

const yogaBestTime = {
  beginner: "morning",
  intermediate: "morning",
  advanced: "evening",
  relaxation: "evening",
  digestion: "after-meal",
} as const;

const yogaVideoByCategory = {
  beginner: "https://www.youtube.com/embed/v7AYKMP6rOE",
  intermediate: "https://www.youtube.com/embed/4C-gxOE0j7s",
  advanced: "https://www.youtube.com/embed/0o0kNeOyH98",
  relaxation: "https://www.youtube.com/embed/inpok4MKVLM",
  digestion: "https://www.youtube.com/embed/dAqQqmaI9vY",
} as const;

const yogaByCategory = [
  { key: "beginner", poses: yogaData.beginner },
  { key: "intermediate", poses: yogaData.intermediate },
  { key: "advanced", poses: yogaData.advanced },
  { key: "relaxation", poses: yogaData.relaxation },
  { key: "digestion", poses: yogaData.digestion },
] as const;

export const yogaPoseCatalog: YogaPose[] = yogaByCategory.flatMap((entry) =>
  entry.poses.map((name) => ({
    id: makeId("yoga", entry.key, name),
    name,
    imageUrl: makeImageUrl(yogaData.image_seed_prefix, entry.key, name),
    category: entry.key,
    difficulty:
      entry.key === "advanced"
        ? "advanced"
        : entry.key === "intermediate"
          ? "intermediate"
          : "beginner",
    duration: entry.key === "relaxation" ? 6 : 3,
    description: yogaDescriptions[entry.key],
    benefits: ["Mobility", "Breathing control", "Mind-body awareness"],
    steps: [
      "Settle into the starting posture",
      "Move into final pose with control",
      "Maintain steady breathing",
      "Release posture safely",
    ],
    breathingTechnique: "Inhale through nose, exhale slowly and longer.",
    precautions: ["Avoid pain range", "Use support props when needed"],
    bestTime: yogaBestTime[entry.key],
    youtubeUrl: yogaVideoByCategory[entry.key],
  })),
);

export const sampleWorkoutPlans: WorkoutPlan[] = [
  {
    id: "plan_home_fat_burn",
    title: "Home Fat Burn - 30 min",
    planType: "home",
    exerciseIds: workoutExerciseCatalog
      .filter((item) => ["pre_meal", "free_hand", "cardio"].includes(item.category))
      .slice(0, 8)
      .map((item) => item.id),
    createdAt: new Date().toISOString(),
  },
  {
    id: "plan_gym_strength_split",
    title: "Gym Strength Split",
    planType: "gym",
    exerciseIds: workoutExerciseCatalog
      .filter((item) => ["dumbbell", "gym_barbell", "gym_machine"].includes(item.category))
      .slice(0, 10)
      .map((item) => item.id),
    createdAt: new Date().toISOString(),
  },
];

export const sampleYogaRoutines: YogaRoutine[] = [
  {
    id: "routine_morning_flex_flow",
    title: "Morning Flex Flow",
    poseIds: yogaPoseCatalog
      .filter((pose) => pose.bestTime === "morning")
      .slice(0, 6)
      .map((pose) => pose.id),
    focus: "flexibility",
    createdAt: new Date().toISOString(),
  },
  {
    id: "routine_after_meal_digestion",
    title: "After Meal Digestion",
    poseIds: yogaPoseCatalog
      .filter((pose) => pose.category === "digestion")
      .map((pose) => pose.id),
    focus: "digestion",
    createdAt: new Date().toISOString(),
  },
];

export function getSmartWorkoutSuggestions(params: {
  level: WorkoutDifficulty;
  equipment: string[];
  goal: FitnessGoal;
  minutesAvailable: number;
}) {
  const { level, equipment, goal, minutesAvailable } = params;

  return workoutExerciseCatalog
    .filter((exercise) => exercise.difficulty === level || level === "beginner")
    .filter((exercise) => equipment.includes("all") || equipment.includes(exercise.equipment))
    .filter((exercise) => {
      if (goal === "weight_loss") return exercise.category === "cardio" || exercise.category === "free_hand";
      if (goal === "weight_gain") return ["dumbbell", "gym_barbell", "gym_machine"].includes(exercise.category);
      if (goal === "yoga_flexibility") return exercise.category === "post_meal" || exercise.category === "free_hand";
      return true;
    })
    .filter((exercise) => exercise.duration <= Math.max(8, minutesAvailable))
    .slice(0, 10);
}

export const workoutYogaModuleJson = {
  workouts: workoutExerciseCatalog,
  yoga: yogaPoseCatalog,
  sampleWorkoutPlans,
  sampleYogaRoutines,
};
