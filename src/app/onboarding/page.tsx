"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { FitnessGoal } from "@/lib/types";
import { useAppStore } from "@/state/store";

const goalOptions: Array<{ value: FitnessGoal; label: string; description: string }> = [
  { value: "weight_loss", label: "Weight loss", description: "Burn fat with sustainable daily habits" },
  { value: "weight_gain", label: "Weight gain", description: "Build strength with balanced nutrition" },
  { value: "maintain_health", label: "Maintain health", description: "Stay consistent and active" },
  { value: "improve_fitness", label: "Improve fitness", description: "Boost stamina and overall performance" },
  { value: "yoga_flexibility", label: "Yoga & flexibility", description: "Improve mobility and recovery" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>("maintain_health");

  const finishOnboarding = (skipped: boolean) => {
    completeOnboarding({ skipped, starterGoal: selectedGoal });
    navigate("/setup", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Card className="relative">
        <button
          type="button"
          onClick={() => finishOnboarding(true)}
          className="absolute right-4 top-4 text-xs font-medium text-zinc-500 transition-colors duration-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Skip
        </button>

        <CardTitle>Welcome to MineFit</CardTitle>
        <CardDescription className="mt-1">Step {step + 1} of 3</CardDescription>

        <div className="mt-4 flex items-center gap-2" aria-label="Onboarding progress">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={index <= step ? "h-1.5 flex-1 rounded-full bg-emerald-600" : "h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700"}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="mt-5 space-y-3">
            <h2 className="text-lg font-semibold">Your personal wellness companion</h2>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>• Personalized diet, workout, and yoga guidance.</li>
              <li>• Daily reminders and progress tracking in one place.</li>
              <li>• Designed for quick routines and long-term consistency.</li>
            </ul>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-5 space-y-3">
            <h2 className="text-lg font-semibold">Privacy first by default</h2>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>• Your profile and logs stay on your device.</li>
              <li>• Export and import backups anytime from Settings.</li>
              <li>• No mandatory cloud account to use MineFit.</li>
            </ul>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-5 space-y-3">
            <h2 className="text-lg font-semibold">Choose your starter goal</h2>
            <div className="space-y-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setSelectedGoal(goal.value)}
                  className={
                    selectedGoal === goal.value
                      ? "w-full rounded-xl border border-emerald-500 bg-emerald-50 px-3 py-2 text-left dark:bg-emerald-900/20"
                      : "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left dark:border-zinc-700 dark:bg-zinc-900"
                  }
                >
                  <p className="text-sm font-semibold">{goal.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-300">{goal.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            Back
          </Button>

          {step < 2 ? (
            <Button onClick={() => setStep((current) => Math.min(2, current + 1))}>Continue</Button>
          ) : (
            <Button onClick={() => finishOnboarding(false)}>Continue to Setup</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
