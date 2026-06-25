import { db, generateId, now } from "../db";
import type { UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  id: "singleton",
  name: "",
  startTime: "07:00",
  eveningTime: "21:00",
  waterGoalMl: 2000,
  pomodoroMinutes: 25,
  deepWorkMinutes: 50,
  shortBreakMinutes: 5,
  longBreakMinutes: 10,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: "auto",
  weekStartsMonday: true,
  supportPhrasesEnabled: true,
  createdAt: now(),
  updatedAt: now(),
};

export async function getSettings(): Promise<UserSettings> {
  const s = await db.userSettings.get("singleton");
  if (!s) {
    await db.userSettings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return s;
}

export async function updateSettings(
  partial: Partial<Omit<UserSettings, "id" | "createdAt">>
): Promise<void> {
  const current = await getSettings();
  await db.userSettings.put({ ...current, ...partial, updatedAt: now() });
}
