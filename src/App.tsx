import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { AppBootstrap } from "@/components/app-bootstrap";
import { AppShell } from "@/components/layout/app-shell";
import HomePage from "@/app/page";
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
import { ErrorBoundary } from "@/components/error-boundary";

function WorkoutPlayerRoute() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  return <PlayerClient id={id} />;
}

export function App() {
  return (
    <>
      <AppBootstrap />
      <AppShell>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/diet" element={<DietPage />} />
            <Route path="/diet/weekly" element={<WeeklyDietPlannerPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/all" element={<AllExercisesPage />} />
            <Route path="/workouts/builder" element={<WorkoutBuilderPage />} />
            <Route path="/workouts/active" element={<ActiveWorkoutPage />} />
            <Route path="/workouts/player" element={<WorkoutPlayerRoute />} />
            <Route path="/yoga" element={<YogaPage />} />
            <Route path="/yoga/all" element={<AllYogaPage />} />
            <Route path="/yoga/practice" element={<YogaPracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/reminders" element={<ReminderPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
