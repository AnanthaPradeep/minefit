"use client";

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/state/store";

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.currentUser);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen px-4 py-8">
      <Card className="mt-10">
        <CardTitle className="text-2xl">MineFit</CardTitle>
        <CardDescription className="mt-2 text-base">
          Privacy-first personal diet, workout, yoga, and progress app built for offline use.
        </CardDescription>

        <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <li>• 100% local storage on your device</li>
          <li>• South Indian diet planning support</li>
          <li>• Workout, yoga, reminders, and progress tracking</li>
        </ul>

        <Link to="/setup" className="mt-6 block">
          <Button className="w-full" size="lg">
            Start Setup
          </Button>
        </Link>
      </Card>
    </div>
  );
}
