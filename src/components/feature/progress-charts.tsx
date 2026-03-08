"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdherenceSnapshot, ProgressEntry, WorkoutLog } from "@/lib/types";

export function WeightChart({ data, range = 30 }: { data: ProgressEntry[]; range?: 7 | 30 | 90 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-range)
    .map((item, index, list) => {
      const windowStart = Math.max(0, index - 2);
      const window = list.slice(windowStart, index + 1);
      const average = window.reduce((sum, value) => sum + value.weight, 0) / window.length;
      return {
        date: item.date.slice(5),
        weight: item.weight,
        avgWeight: Number(average.toFixed(2)),
      };
    });

  if (!mounted) {
    return <div className="h-56 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2} />
          <Line type="monotone" dataKey="avgWeight" stroke="#22d3ee" strokeDasharray="5 5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyWorkoutChart({ logs }: { logs: WorkoutLog[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const map = new Map<string, number>();
  logs.forEach((log) => {
    if (!log.completed) return;
    map.set(log.date, (map.get(log.date) ?? 0) + 1);
  });

  const chartData = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date: date.slice(5), count }));

  if (!mounted) {
    return <div className="h-56 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#14b8a6" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdherenceChart({ data }: { data: AdherenceSnapshot[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [...data]
    .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
    .slice(-8)
    .map((item) => ({
      week: item.weekStartDate.slice(5),
      sessions: item.completionRate,
      minutes: item.minutesRate,
    }));

  if (!mounted) {
    return <div className="h-56 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[0, 120]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sessions" name="Sessions %" stroke="#14b8a6" strokeWidth={2} />
          <Line type="monotone" dataKey="minutes" name="Minutes %" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityMinutesChart({ logs, targetMinutes }: { logs: WorkoutLog[]; targetMinutes: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const map = new Map<string, number>();
  logs.forEach((log) => {
    if (!log.completed) return;
    map.set(log.date, (map.get(log.date) ?? 0) + log.duration);
  });

  const chartData = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, minutes]) => ({
      date: date.slice(5),
      minutes,
      target: Math.round(targetMinutes / 7),
    }));

  if (!mounted) {
    return <div className="h-56 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="minutes" fill="#10b981" radius={6} />
          <Bar dataKey="target" fill="#64748b" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
