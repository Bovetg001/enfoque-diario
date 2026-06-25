import { db, generateId, now, toDateKey } from "../db";
import type { DailyPlan, DayStatus, WoopEntry } from "@/types";

export async function getDailyPlan(dateKey: string): Promise<DailyPlan | undefined> {
  return db.dailyPlans.where("dateKey").equals(dateKey).first();
}

export async function getOrCreateDailyPlan(dateKey: string): Promise<DailyPlan> {
  const existing = await getDailyPlan(dateKey);
  if (existing) return existing;

  const plan: DailyPlan = {
    id: generateId(),
    dateKey,
    status: "empty",
    isMinimalRoutine: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.dailyPlans.add(plan);
  return plan;
}

export async function updateDailyPlan(
  dateKey: string,
  partial: Partial<Omit<DailyPlan, "id" | "dateKey" | "createdAt">>
): Promise<void> {
  const plan = await getOrCreateDailyPlan(dateKey);
  await db.dailyPlans.put({ ...plan, ...partial, updatedAt: now() });
}

export async function saveWoop(dateKey: string, woop: WoopEntry): Promise<void> {
  await updateDailyPlan(dateKey, { woop });
}

export async function updateDayStatus(
  dateKey: string,
  status: DayStatus
): Promise<void> {
  await updateDailyPlan(dateKey, { status });
}

export async function getPastWoopEntries(limit = 10): Promise<WoopEntry[]> {
  const plans = await db.dailyPlans
    .orderBy("dateKey")
    .reverse()
    .limit(limit)
    .toArray();
  return plans
    .filter((p) => p.woop?.desire)
    .map((p) => p.woop as WoopEntry);
}

export async function getAllDailyPlans(): Promise<DailyPlan[]> {
  return db.dailyPlans.orderBy("dateKey").reverse().toArray();
}
