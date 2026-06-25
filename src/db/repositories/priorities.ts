import { db, generateId, now } from "../db";
import type { DailyPriority, PriorityType, CategoryType } from "@/types";

export async function getPrioritiesByDate(dateKey: string): Promise<DailyPriority[]> {
  return db.dailyPriorities
    .where("dateKey")
    .equals(dateKey)
    .sortBy("order");
}

export async function createPriority(
  data: Omit<DailyPriority, "id" | "createdAt" | "updatedAt">
): Promise<DailyPriority> {
  const priority: DailyPriority = {
    ...data,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.dailyPriorities.add(priority);
  return priority;
}

export async function updatePriority(
  id: string,
  partial: Partial<Omit<DailyPriority, "id" | "createdAt">>
): Promise<void> {
  await db.dailyPriorities.update(id, { ...partial, updatedAt: now() });
}

export async function deletePriority(id: string): Promise<void> {
  await db.dailyPriorities.delete(id);
}

export async function togglePriorityComplete(id: string): Promise<void> {
  const p = await db.dailyPriorities.get(id);
  if (p) {
    await db.dailyPriorities.update(id, {
      completed: !p.completed,
      updatedAt: now(),
    });
  }
}

export async function movePriorityToDate(
  id: string,
  targetDate: string
): Promise<void> {
  const p = await db.dailyPriorities.get(id);
  if (!p) return;
  // Create a copy for the new date
  const newPriority: DailyPriority = {
    ...p,
    id: generateId(),
    dateKey: targetDate,
    completed: false,
    movedToDate: undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.dailyPriorities.add(newPriority);
  await db.dailyPriorities.update(id, {
    movedToDate: targetDate,
    updatedAt: now(),
  });
}

export async function getPrioritiesRange(
  startDate: string,
  endDate: string
): Promise<DailyPriority[]> {
  return db.dailyPriorities
    .where("dateKey")
    .between(startDate, endDate, true, true)
    .toArray();
}
