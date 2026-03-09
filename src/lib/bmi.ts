import type { BmiThresholdProfile } from "@/lib/types";

export type BmiRisk = "low" | "neutral" | "high";

const CM_TO_IN = 0.3937008;
const KG_TO_LB = 2.2046226;

export function calculateBmi(heightCm: number, weightKg: number) {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) {
    return null;
  }
  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(1));
}

export function convertKgToUnits(weightKg: number, units: "metric" | "imperial") {
  if (!Number.isFinite(weightKg)) return 0;
  if (units === "imperial") return Number((weightKg * KG_TO_LB).toFixed(1));
  return Number(weightKg.toFixed(1));
}

export function convertUnitsToKg(weightValue: number, units: "metric" | "imperial") {
  if (!Number.isFinite(weightValue)) return 0;
  if (units === "imperial") return Number((weightValue / KG_TO_LB).toFixed(1));
  return Number(weightValue.toFixed(1));
}

export function convertCmToUnits(heightCm: number, units: "metric" | "imperial") {
  if (!Number.isFinite(heightCm)) return 0;
  if (units === "imperial") return Number((heightCm * CM_TO_IN).toFixed(1));
  return Number(heightCm.toFixed(1));
}

export function getBmiInsight(params: { age: number; bmi: number | null; profile: BmiThresholdProfile }) {
  const { age, bmi, profile } = params;

  if (!bmi) {
    return {
      label: "N/A",
      detail: "Enter valid height and weight to calculate BMI.",
      range: "-",
      risk: "neutral" as const,
      tone: "muted" as const,
    };
  }

  if (age < 20) {
    return {
      label: "Teen BMI",
      detail: "Use BMI-for-age percentile charts for ages under 20.",
      range: "Percentile based",
      risk: "neutral" as const,
      tone: "warning" as const,
    };
  }

  const thresholds =
    profile === "asian"
      ? { underweight: 18.5, healthy: 23, overweight: 27.5 }
      : { underweight: 18.5, healthy: 25, overweight: 30 };

  if (bmi < thresholds.underweight) {
    return {
      label: "Underweight",
      detail: "Consider balanced nutrition and consult guidance if needed.",
      range: `< ${thresholds.underweight}`,
      risk: "neutral" as const,
      tone: "warning" as const,
    };
  }

  if (bmi < thresholds.healthy) {
    return {
      label: "Healthy range",
      detail: "Maintain consistency with activity and nutrition habits.",
      range: `${thresholds.underweight} - ${(thresholds.healthy - 0.1).toFixed(1)}`,
      risk: "low" as const,
      tone: "good" as const,
    };
  }

  if (bmi < thresholds.overweight) {
    return {
      label: "Overweight range",
      detail: "Focus on steady activity and nutrition consistency.",
      range: `${thresholds.healthy} - ${(thresholds.overweight - 0.1).toFixed(1)}`,
      risk: "neutral" as const,
      tone: "warning" as const,
    };
  }

  return {
    label: "Obesity range",
    detail: "Use this as a screening signal; not a diagnosis.",
    range: `>= ${thresholds.overweight}`,
    risk: "high" as const,
    tone: "high" as const,
  };
}

export function getBmiRiskToneClass(risk: BmiRisk) {
  if (risk === "low") return "text-emerald-700 dark:text-emerald-300";
  if (risk === "high") return "text-rose-700 dark:text-rose-300";
  return "text-amber-700 dark:text-amber-300";
}
