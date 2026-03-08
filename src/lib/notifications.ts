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
