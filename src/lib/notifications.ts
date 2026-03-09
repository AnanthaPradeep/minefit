import type { Reminder } from "@/lib/types";

export async function ensureNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    return "granted" as const;
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export function scheduleInAppNotification(title: string, delayMs: number) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  window.setTimeout(() => {
    new Notification("MineFit Reminder", { body: title });
  }, Math.max(0, delayMs));
}

function isScheduledForToday(reminder: Reminder, now: Date) {
  if (reminder.scheduleType === "daily") return true;
  if (reminder.scheduleType === "weekly") return reminder.daysOfWeek.includes(now.getDay());
  if (reminder.scheduleType === "monthly") return now.getDate() === 1;
  if (reminder.daysOfWeek.length > 0) return reminder.daysOfWeek.includes(now.getDay());
  return true;
}

function parseTimeOnDate(time: string, now: Date) {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const at = new Date(now);
  at.setHours(hour, minute, 0, 0);
  return at;
}

export function isReminderDueNow(reminder: Reminder, now = new Date()) {
  if (!reminder.enabled) return false;

  if (reminder.snoozeUntil) {
    const snoozeAt = new Date(reminder.snoozeUntil);
    if (Number.isNaN(snoozeAt.getTime()) || now < snoozeAt) return false;
    if (reminder.lastTriggeredAt) {
      const lastTriggeredAt = new Date(reminder.lastTriggeredAt);
      if (!Number.isNaN(lastTriggeredAt.getTime()) && lastTriggeredAt >= snoozeAt) {
        return false;
      }
    }
    return true;
  }

  if (!isScheduledForToday(reminder, now)) return false;
  const scheduledAt = parseTimeOnDate(reminder.time, now);
  if (!scheduledAt) return false;
  if (now < scheduledAt) return false;

  if (!reminder.lastTriggeredAt) return true;
  const lastTriggeredAt = new Date(reminder.lastTriggeredAt);
  if (Number.isNaN(lastTriggeredAt.getTime())) return true;
  return lastTriggeredAt < scheduledAt;
}

export function getDueReminders(reminders: Reminder[], now = new Date()) {
  return reminders.filter((reminder) => isReminderDueNow(reminder, now));
}

export function notifyReminder(reminder: Reminder) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification("MineFit Reminder", {
    body: reminder.note?.trim() || reminder.title,
    tag: `minefit-reminder-${reminder.id}`,
  });
}

export function startReminderScheduler(options: {
  getReminders: () => Reminder[];
  onDueReminder: (reminder: Reminder) => void | Promise<void>;
  intervalMs?: number;
}) {
  const tick = () => {
    const due = getDueReminders(options.getReminders(), new Date());
    due.forEach((reminder) => {
      void options.onDueReminder(reminder);
    });
  };

  tick();
  const timerId = window.setInterval(tick, options.intervalMs ?? 30000);
  return () => window.clearInterval(timerId);
}
