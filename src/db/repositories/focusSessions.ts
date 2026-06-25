import { db, generateId, now } from "../db";
import type { FocusSession, FocusInterruption, QuickNote, FocusState, FocusMode, FocusBlockType } from "@/types";

export async function createFocusSession(
  data: Omit<FocusSession, "id" | "createdAt" | "updatedAt">
): Promise<FocusSession> {
  const session: FocusSession = {
    ...data,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.focusSessions.add(session);
  return session;
}

export async function updateFocusSession(
  id: string,
  partial: Partial<Omit<FocusSession, "id" | "createdAt">>
): Promise<void> {
  await db.focusSessions.update(id, { ...partial, updatedAt: now() });
}

export async function getFocusSession(id: string): Promise<FocusSession | undefined> {
  return db.focusSessions.get(id);
}

export async function getSessionsByDate(dateKey: string): Promise<FocusSession[]> {
  return db.focusSessions.where("dateKey").equals(dateKey).toArray();
}

export async function getActiveSession(): Promise<FocusSession | undefined> {
  const running = await db.focusSessions.where("state").equals("running").first();
  if (running) return running;
  return db.focusSessions.where("state").equals("paused").first();
}

export async function addInterruption(
  sessionId: string,
  dateKey: string,
  reason?: string
): Promise<FocusInterruption> {
  const interruption: FocusInterruption = {
    id: generateId(),
    sessionId,
    dateKey,
    reason,
    timestamp: Date.now(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.focusInterruptions.add(interruption);
  await db.focusSessions.update(sessionId, {
    interruptionCount: await db.focusInterruptions
      .where("sessionId")
      .equals(sessionId)
      .count(),
    updatedAt: now(),
  });
  return interruption;
}

export async function addQuickNote(
  content: string,
  dateKey: string,
  sessionId?: string
): Promise<QuickNote> {
  const note: QuickNote = {
    id: generateId(),
    sessionId,
    dateKey,
    content,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.quickNotes.add(note);
  return note;
}

export async function getNotesByDate(dateKey: string): Promise<QuickNote[]> {
  return db.quickNotes.where("dateKey").equals(dateKey).toArray();
}

export async function getSessionsRange(
  startDate: string,
  endDate: string
): Promise<FocusSession[]> {
  return db.focusSessions
    .where("dateKey")
    .between(startDate, endDate, true, true)
    .toArray();
}
