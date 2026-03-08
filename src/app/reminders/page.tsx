"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ensureNotificationPermission, scheduleInAppNotification } from "@/lib/notifications";
import type { ReminderPriority, ReminderScheduleType, ReminderType } from "@/lib/types";
import { useAppStore } from "@/state/store";

const dayOptions = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const presetTemplates = [
  { title: "Hydration break", type: "water" as ReminderType, time: "10:30" },
  { title: "Lunch walk", type: "workout" as ReminderType, time: "13:15" },
  { title: "Evening yoga", type: "yoga" as ReminderType, time: "18:30" },
  { title: "Dinner log", type: "meal" as ReminderType, time: "20:15" },
];

export default function ReminderPage() {
  const reminders = useAppStore((state) => state.reminders);
  const addReminder = useAppStore((state) => state.addReminder);
  const toggleReminder = useAppStore((state) => state.toggleReminder);
  const markReminderDone = useAppStore((state) => state.markReminderDone);
  const snoozeReminder = useAppStore((state) => state.snoozeReminder);
  const getTodayReminderSummary = useAppStore((state) => state.getTodayReminderSummary);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<ReminderType>("workout");
  const [scheduleType, setScheduleType] = useState<ReminderScheduleType>("daily");
  const [priority, setPriority] = useState<ReminderPriority>("medium");
  const [time, setTime] = useState("07:00");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 3, 5]);

  const summary = getTodayReminderSummary();

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Reminder Manager 2.0</CardTitle>
        <CardDescription className="mt-1">Actionable reminders with schedule control, snooze, and adherence</CardDescription>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Enabled</p>
            <p className="text-lg font-semibold">{summary.enabledCount}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Due Today</p>
            <p className="text-lg font-semibold">{summary.dueTodayCount}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Completed</p>
            <p className="text-lg font-semibold">{summary.completedTodayCount}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Snoozed</p>
            <p className="text-lg font-semibold">{summary.snoozedCount}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-2 text-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Adherence</p>
            <p className="text-lg font-semibold">{summary.completionRate}%</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Quick Add Presets</CardTitle>
        <CardDescription className="mt-1">Common reminders that keep wording concise and actionable</CardDescription>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {presetTemplates.map((item) => (
            <Button
              key={item.title}
              variant="outline"
              onClick={async () => {
                await addReminder(item.title, item.type, "daily", item.time, { priority: "medium" });
              }}
            >
              {item.title} • {item.time}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Notification Best Practices</CardTitle>
        <ul className="mt-2 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
          <li>Keep reminder titles short and specific (e.g., “Hydration break”, not long paragraphs).</li>
          <li>Use actions like Done and Snooze instead of sending repeated duplicate alerts.</li>
          <li>Choose weekly day targeting to reduce notification fatigue and improve consistency.</li>
          <li>Respect user control with enable/disable and priority levels.</li>
        </ul>
      </Card>

      <Card>
        <CardTitle>Create Smart Reminder</CardTitle>
        <div className="mt-3 space-y-2">
          <Input placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input placeholder="Optional note (what to do)" value={note} onChange={(event) => setNote(event.target.value)} />
          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={type}
            onChange={(event) => setType(event.target.value as ReminderType)}
          >
            <option value="workout">Workout</option>
            <option value="yoga">Yoga</option>
            <option value="meal">Meal</option>
            <option value="water">Water intake</option>
          </select>
          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={scheduleType}
            onChange={(event) => setScheduleType(event.target.value as ReminderScheduleType)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom time</option>
          </select>
          <select
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={priority}
            onChange={(event) => setPriority(event.target.value as ReminderPriority)}
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />

          {scheduleType === "weekly" || scheduleType === "custom" ? (
            <div className="grid grid-cols-4 gap-2">
              {dayOptions.map((day) => {
                const active = daysOfWeek.includes(day.value);
                return (
                  <Button
                    key={day.value}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => {
                      setDaysOfWeek((prev) =>
                        prev.includes(day.value)
                          ? prev.filter((value) => value !== day.value)
                          : [...prev, day.value],
                      );
                    }}
                  >
                    {day.label}
                  </Button>
                );
              })}
            </div>
          ) : null}

          <Button
            className="w-full"
            onClick={async () => {
              if (!title.trim()) return;
              await addReminder(title, type, scheduleType, time, {
                daysOfWeek,
                note,
                priority,
              });
              const permission = await ensureNotificationPermission();
              if (permission === "granted") {
                scheduleInAppNotification(title, 3000);
              }
              setTitle("");
              setNote("");
            }}
          >
            Save Reminder
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Scheduled Reminders</CardTitle>
        <div className="mt-3 space-y-2">
          {reminders.length === 0 ? <p className="text-sm text-zinc-500 dark:text-zinc-400">No reminders yet.</p> : null}
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="rounded-2xl border border-zinc-200/70 p-3 dark:border-zinc-800"
            >
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm font-semibold">{reminder.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {reminder.scheduleType} • {reminder.time} • {reminder.type} • {reminder.priority}
                  </p>
                  {reminder.note ? <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{reminder.note}</p> : null}
                  {reminder.daysOfWeek.length > 0 ? (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Days: {reminder.daysOfWeek.join(", ")}</p>
                  ) : null}
                  {reminder.snoozeUntil ? (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Snoozed until {new Date(reminder.snoozeUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <Button size="sm" variant="outline" onClick={() => toggleReminder(reminder.id)}>
                    {reminder.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" onClick={() => markReminderDone(reminder.id)}>
                    Mark Done
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => snoozeReminder(reminder.id, 10)}>
                    Snooze 10m
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => snoozeReminder(reminder.id, 30)}>
                    Snooze 30m
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
