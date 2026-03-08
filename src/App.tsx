import type { ReactNode } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { AppBootstrap } from "@/components/app-bootstrap";
import { AppShell } from "@/components/layout/app-shell";
import HomePage from "@/app/page";
import OnboardingPage from "@/app/onboarding/page";
import SetupPage from "@/app/setup/page";
import DashboardPage from "@/app/dashboard/page";
import DietPage from "@/app/diet/page";
import WeeklyDietPlannerPage from "@/app/diet/weekly/page";
import WorkoutsPage from "@/app/workouts/page";
import AllExercisesPage from "@/app/workouts/all/page";
import WorkoutBuilderPage from "@/app/workouts/builder/page";
import ActiveWorkoutPage from "@/app/workouts/active/page";
import { PlayerClient } from "@/app/workouts/player/player-client";
import YogaPage from "@/app/yoga/page";
import AllYogaPage from "@/app/yoga/all/page";
import YogaPracticePage from "@/app/yoga/practice/page";
import ProgressPage from "@/app/progress/page";
import ReminderPage from "@/app/reminders/page";
import SettingsPage from "@/app/settings/page";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import SupportPage from "@/app/support/page";
import { SplashScreen } from "@/components/layout/splash-screen";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAppStore } from "@/state/store";

function RequireProfile({ children }: { children: ReactNode }) {
  const user = useAppStore((state) => state.currentUser);
  if (!user) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}

function WorkoutPlayerRoute() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  return <PlayerClient id={id} />;
}

export function App() {
  const hydrated = useAppStore((state) => state.hydrated);
  const user = useAppStore((state) => state.currentUser);
  const hasSeenOnboarding = useAppStore((state) => state.onboarding.hasSeen);

  if (!hydrated) {
    return (
      <>
        <AppBootstrap />
        <SplashScreen />
      </>
    );
  }

  return (
    <>
      <AppBootstrap />
      <AppShell>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/onboarding"
              element={user ? <Navigate to="/dashboard" replace /> : hasSeenOnboarding ? <Navigate to="/setup" replace /> : <OnboardingPage />}
            />
            <Route
              path="/setup"
              element={user ? <Navigate to="/dashboard" replace /> : hasSeenOnboarding ? <SetupPage /> : <Navigate to="/onboarding" replace />}
            />
            <Route path="/dashboard" element={<RequireProfile><DashboardPage /></RequireProfile>} />
            <Route path="/diet" element={<RequireProfile><DietPage /></RequireProfile>} />
            <Route path="/diet/weekly" element={<RequireProfile><WeeklyDietPlannerPage /></RequireProfile>} />
            <Route path="/workouts" element={<RequireProfile><WorkoutsPage /></RequireProfile>} />
            <Route path="/workouts/all" element={<RequireProfile><AllExercisesPage /></RequireProfile>} />
            <Route path="/workouts/builder" element={<RequireProfile><WorkoutBuilderPage /></RequireProfile>} />
            <Route path="/workouts/active" element={<RequireProfile><ActiveWorkoutPage /></RequireProfile>} />
            <Route path="/workouts/player" element={<RequireProfile><WorkoutPlayerRoute /></RequireProfile>} />
            <Route path="/yoga" element={<RequireProfile><YogaPage /></RequireProfile>} />
            <Route path="/yoga/all" element={<RequireProfile><AllYogaPage /></RequireProfile>} />
            <Route path="/yoga/practice" element={<RequireProfile><YogaPracticePage /></RequireProfile>} />
            <Route path="/progress" element={<RequireProfile><ProgressPage /></RequireProfile>} />
            <Route path="/reminders" element={<RequireProfile><ReminderPage /></RequireProfile>} />
            <Route path="/settings" element={<RequireProfile><SettingsPage /></RequireProfile>} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AppShell>
    </>
  );
}
