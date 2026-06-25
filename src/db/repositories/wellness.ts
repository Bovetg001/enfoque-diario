import { db, generateId, now } from "../db";
import type {
  BreathingSession,
  WaterEntry,
  MovementEntry,
  MovementType,
  PositiveResetEntry,
  EveningReflection,
  ActiveRecallEntry,
} from "@/types";

// ---- Breathing ----

export async function saveBreathingSession(
  dateKey: string,
  durationMinutes: number,
  actualDurationSeconds: number,
  completed: boolean
): Promise<BreathingSession> {
  const session: BreathingSession = {
    id: generateId(),
    dateKey,
    durationMinutes,
    actualDurationSeconds,
    completed,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.breathingSessions.add(session);
  return session;
}

export async function getBreathingByDate(dateKey: string): Promise<BreathingSession[]> {
  return db.breathingSessions.where("dateKey").equals(dateKey).toArray();
}

// ---- Water ----

export async function addWaterEntry(
  dateKey: string,
  amountMl: number
): Promise<WaterEntry> {
  const entry: WaterEntry = {
    id: generateId(),
    dateKey,
    amountMl,
    timestamp: Date.now(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.waterEntries.add(entry);
  return entry;
}

export async function getWaterByDate(dateKey: string): Promise<WaterEntry[]> {
  return db.waterEntries
    .where("dateKey")
    .equals(dateKey)
    .sortBy("timestamp");
}

export async function deleteWaterEntry(id: string): Promise<void> {
  await db.waterEntries.delete(id);
}

export async function getTotalWaterByDate(dateKey: string): Promise<number> {
  const entries = await getWaterByDate(dateKey);
  return entries.reduce((sum, e) => sum + e.amountMl, 0);
}

// ---- Movement ----

export async function addMovementEntry(
  dateKey: string,
  type: MovementType,
  durationMinutes: number,
  notes?: string
): Promise<MovementEntry> {
  const entry: MovementEntry = {
    id: generateId(),
    dateKey,
    type,
    durationMinutes,
    notes,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.movementEntries.add(entry);
  return entry;
}

export async function getMovementByDate(dateKey: string): Promise<MovementEntry[]> {
  return db.movementEntries.where("dateKey").equals(dateKey).toArray();
}

export async function deleteMovementEntry(id: string): Promise<void> {
  await db.movementEntries.delete(id);
}

// ---- Positive Reset ----

export async function savePositiveReset(
  dateKey: string,
  data: Omit<PositiveResetEntry, "id" | "dateKey" | "createdAt" | "updatedAt">
): Promise<PositiveResetEntry> {
  const entry: PositiveResetEntry = {
    ...data,
    id: generateId(),
    dateKey,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.positiveResetEntries.add(entry);
  return entry;
}

export async function getPositiveResetsByDate(
  dateKey: string
): Promise<PositiveResetEntry[]> {
  return db.positiveResetEntries.where("dateKey").equals(dateKey).toArray();
}

// ---- Evening Reflection ----

export async function saveEveningReflection(
  dateKey: string,
  data: Omit<EveningReflection, "id" | "dateKey" | "createdAt" | "updatedAt">
): Promise<EveningReflection> {
  const existing = await db.eveningReflections
    .where("dateKey")
    .equals(dateKey)
    .first();

  if (existing) {
    const updated = { ...existing, ...data, updatedAt: now() };
    await db.eveningReflections.put(updated);
    return updated;
  }

  const entry: EveningReflection = {
    ...data,
    id: generateId(),
    dateKey,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.eveningReflections.add(entry);
  return entry;
}

export async function getEveningReflection(
  dateKey: string
): Promise<EveningReflection | undefined> {
  return db.eveningReflections.where("dateKey").equals(dateKey).first();
}

// ---- Active Recall ----

export async function saveActiveRecall(
  data: Omit<ActiveRecallEntry, "id" | "createdAt" | "updatedAt">
): Promise<ActiveRecallEntry> {
  const entry: ActiveRecallEntry = {
    ...data,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.activeRecallEntries.add(entry);
  return entry;
}

export async function getActiveRecallByDate(
  dateKey: string
): Promise<ActiveRecallEntry[]> {
  return db.activeRecallEntries.where("dateKey").equals(dateKey).toArray();
}

export async function getActiveRecallBySession(
  sessionId: string
): Promise<ActiveRecallEntry | undefined> {
  return db.activeRecallEntries.where("sessionId").equals(sessionId).first();
}

// ---- Range queries para estadísticas ----

export async function getBreathingRange(
  start: string,
  end: string
): Promise<BreathingSession[]> {
  return db.breathingSessions
    .where("dateKey")
    .between(start, end, true, true)
    .toArray();
}

export async function getWaterRange(
  start: string,
  end: string
): Promise<WaterEntry[]> {
  return db.waterEntries
    .where("dateKey")
    .between(start, end, true, true)
    .toArray();
}

export async function getMovementRange(
  start: string,
  end: string
): Promise<MovementEntry[]> {
  return db.movementEntries
    .where("dateKey")
    .between(start, end, true, true)
    .toArray();
}

export async function getEveningReflectionsRange(
  start: string,
  end: string
): Promise<EveningReflection[]> {
  return db.eveningReflections
    .where("dateKey")
    .between(start, end, true, true)
    .toArray();
}
