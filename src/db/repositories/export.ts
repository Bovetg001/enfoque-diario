import { db } from "../db";

export interface ExportData {
  version: string;
  exportedAt: string;
  userSettings: unknown[];
  dailyPlans: unknown[];
  dailyPriorities: unknown[];
  focusSessions: unknown[];
  focusInterruptions: unknown[];
  quickNotes: unknown[];
  activeRecallEntries: unknown[];
  breathingSessions: unknown[];
  waterEntries: unknown[];
  movementEntries: unknown[];
  positiveResetEntries: unknown[];
  eveningReflections: unknown[];
  dailyStatus: unknown[];
  customCategories: unknown[];
}

export async function exportAllData(): Promise<ExportData> {
  const [
    userSettings,
    dailyPlans,
    dailyPriorities,
    focusSessions,
    focusInterruptions,
    quickNotes,
    activeRecallEntries,
    breathingSessions,
    waterEntries,
    movementEntries,
    positiveResetEntries,
    eveningReflections,
    dailyStatus,
    customCategories,
  ] = await Promise.all([
    db.userSettings.toArray(),
    db.dailyPlans.toArray(),
    db.dailyPriorities.toArray(),
    db.focusSessions.toArray(),
    db.focusInterruptions.toArray(),
    db.quickNotes.toArray(),
    db.activeRecallEntries.toArray(),
    db.breathingSessions.toArray(),
    db.waterEntries.toArray(),
    db.movementEntries.toArray(),
    db.positiveResetEntries.toArray(),
    db.eveningReflections.toArray(),
    db.dailyStatus.toArray(),
    db.customCategories.toArray(),
  ]);

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    userSettings,
    dailyPlans,
    dailyPriorities,
    focusSessions,
    focusInterruptions,
    quickNotes,
    activeRecallEntries,
    breathingSessions,
    waterEntries,
    movementEntries,
    positiveResetEntries,
    eveningReflections,
    dailyStatus,
    customCategories,
  };
}

export async function importAllData(data: ExportData): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.userSettings,
      db.dailyPlans,
      db.dailyPriorities,
      db.focusSessions,
      db.focusInterruptions,
      db.quickNotes,
      db.activeRecallEntries,
      db.breathingSessions,
      db.waterEntries,
      db.movementEntries,
      db.positiveResetEntries,
      db.eveningReflections,
      db.dailyStatus,
      db.customCategories,
    ],
    async () => {
      await db.userSettings.bulkPut(data.userSettings as never[]);
      await db.dailyPlans.bulkPut(data.dailyPlans as never[]);
      await db.dailyPriorities.bulkPut(data.dailyPriorities as never[]);
      await db.focusSessions.bulkPut(data.focusSessions as never[]);
      await db.focusInterruptions.bulkPut(data.focusInterruptions as never[]);
      await db.quickNotes.bulkPut(data.quickNotes as never[]);
      await db.activeRecallEntries.bulkPut(data.activeRecallEntries as never[]);
      await db.breathingSessions.bulkPut(data.breathingSessions as never[]);
      await db.waterEntries.bulkPut(data.waterEntries as never[]);
      await db.movementEntries.bulkPut(data.movementEntries as never[]);
      await db.positiveResetEntries.bulkPut(data.positiveResetEntries as never[]);
      await db.eveningReflections.bulkPut(data.eveningReflections as never[]);
      await db.dailyStatus.bulkPut(data.dailyStatus as never[]);
      await db.customCategories.bulkPut(data.customCategories as never[]);
    }
  );
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.userSettings,
      db.dailyPlans,
      db.dailyPriorities,
      db.focusSessions,
      db.focusInterruptions,
      db.quickNotes,
      db.activeRecallEntries,
      db.breathingSessions,
      db.waterEntries,
      db.movementEntries,
      db.positiveResetEntries,
      db.eveningReflections,
      db.dailyStatus,
      db.customCategories,
    ],
    async () => {
      await Promise.all([
        db.userSettings.clear(),
        db.dailyPlans.clear(),
        db.dailyPriorities.clear(),
        db.focusSessions.clear(),
        db.focusInterruptions.clear(),
        db.quickNotes.clear(),
        db.activeRecallEntries.clear(),
        db.breathingSessions.clear(),
        db.waterEntries.clear(),
        db.movementEntries.clear(),
        db.positiveResetEntries.clear(),
        db.eveningReflections.clear(),
        db.dailyStatus.clear(),
        db.customCategories.clear(),
      ]);
    }
  );
}
