"use client";

import { useSearchParams } from "react-router-dom";
import { PlayerClient } from "@/app/workouts/player/player-client";

export default function WorkoutPlayerPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;

  return <PlayerClient id={id} />;
}
