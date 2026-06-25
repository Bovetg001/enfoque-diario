import Dexie, { type Table } from "dexie";
import type {
  UserSettings,
  DailyPlan,
  DailyPriority,
  FocusSession,
  FocusInterruption,
  QuickNote,
  ActiveRecallEntry,
  BreathingSession,
  WaterEntry,
  MovementEntry,
  PositiveResetEntry,
  EveningReflection,
  DailyStatus,
  CustomCategory,
} from "@/types";

export class EnfoqueDiarioDB extends Dexie {
  userSettings!: Table<UserSettings>;
  dailyPlans!: Table<DailyPlan>;
  dailyPriorities!: Table<DailyPriority>;
  focusSessions!: Table<FocusSession>;
  focusInterruptions!: Table<FocusInterruption>;
  quickNotes!: Table<QuickNote>;
  activeRecallEntries!: Table<ActiveRecallEntry>;
  breathingSessions!: Table<BreathingSession>;
  waterEntries!: Table<WaterEntry>;
  movementEntries!: Table<MovementEntry>;
  positiveResetEntries!: Table<PositiveResetEntry>;
  eveningReflections!: Table<EveningReflection>;
  dailyStatus!: Table<DailyStatus>;
  customCategories!: Table<CustomCategory>;

  constructor() {
    super("EnfoqueDiarioDB");

    this.version(1).stores({
      userSettings: "id",
      dailyPlans: "id, dateKey",
      dailyPriorities: "id, dateKey, type, completed",
      focusSessions: "id, dateKey, priorityId, state",
      focusInterruptions: "id, sessionId, dateKey",
      quickNotes: "id, sessionId, dateKey",
      activeRecallEntries: "id, sessionId, dateKey",
      breathingSessions: "id, dateKey",
      waterEntries: "id, dateKey, timestamp",
      movementEntries: "id, dateKey",
      positiveResetEntries: "id, dateKey",
      eveningReflections: "id, dateKey",
      dailyStatus: "id, dateKey",
      customCategories: "id",
    });
  }
}

export const db = new EnfoqueDiarioDB();

export function generateId(): string {
  // crypto.randomUUID() requires a secure context (HTTPS / localhost).
  // Fallback to getRandomValues, which works on plain HTTP too.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }
  // Last-resort fallback (virtually never reached in a modern browser)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
