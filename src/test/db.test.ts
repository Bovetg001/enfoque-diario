import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db, toDateKey, generateId } from "@/db/db";
import { getSettings, updateSettings } from "@/db/repositories/settings";
import { getOrCreateDailyPlan, saveWoop, getDailyPlan } from "@/db/repositories/dailyPlan";
import {
  createPriority,
  getPrioritiesByDate,
  togglePriorityComplete,
} from "@/db/repositories/priorities";
import {
  addWaterEntry,
  getWaterByDate,
  getTotalWaterByDate,
} from "@/db/repositories/wellness";

describe("UserSettings", () => {
  it("returns default settings on first load", async () => {
    const settings = await getSettings();
    expect(settings.id).toBe("singleton");
    expect(settings.waterGoalMl).toBe(2000);
    expect(settings.pomodoroMinutes).toBe(25);
  });

  it("can be updated", async () => {
    await updateSettings({ name: "Test User", waterGoalMl: 2500 });
    const updated = await getSettings();
    expect(updated.name).toBe("Test User");
    expect(updated.waterGoalMl).toBe(2500);
  });
});

describe("DailyPlan", () => {
  it("creates a plan when none exists", async () => {
    const dateKey = "2026-06-01";
    const plan = await getOrCreateDailyPlan(dateKey);
    expect(plan.dateKey).toBe(dateKey);
    expect(plan.status).toBe("empty");
  });

  it("returns the same plan on second call", async () => {
    const dateKey = "2026-06-02";
    const plan1 = await getOrCreateDailyPlan(dateKey);
    const plan2 = await getOrCreateDailyPlan(dateKey);
    expect(plan1.id).toBe(plan2.id);
  });

  it("saves WOOP entry", async () => {
    const dateKey = "2026-06-03";
    await getOrCreateDailyPlan(dateKey);
    const woop = {
      desire: "Estudiar termodinámica",
      outcome: "Aprobar el examen",
      obstacle: "Distracciones",
      plan: "Si me distraigo, cierro el celular.",
    };
    await saveWoop(dateKey, woop);
    const plan = await getDailyPlan(dateKey);
    expect(plan?.woop?.desire).toBe("Estudiar termodinámica");
  });
});

describe("Priorities", () => {
  it("can create and retrieve priorities", async () => {
    const dateKey = "2026-06-04";
    await createPriority({
      dateKey,
      type: "critical",
      title: "Resolver ejercicios",
      category: "universidad",
      completed: false,
      order: 0,
    });
    const priorities = await getPrioritiesByDate(dateKey);
    expect(priorities.length).toBe(1);
    expect(priorities[0].title).toBe("Resolver ejercicios");
  });

  it("can toggle completion", async () => {
    const dateKey = "2026-06-05";
    const p = await createPriority({
      dateKey,
      type: "secondary",
      title: "Leer apuntes",
      category: "personal",
      completed: false,
      order: 0,
    });
    expect(p.completed).toBe(false);
    await togglePriorityComplete(p.id);
    const list = await getPrioritiesByDate(dateKey);
    expect(list[0].completed).toBe(true);
  });
});

describe("Water tracking", () => {
  it("adds water entries and sums correctly", async () => {
    const dateKey = "2026-06-06";
    await addWaterEntry(dateKey, 250);
    await addWaterEntry(dateKey, 500);
    const total = await getTotalWaterByDate(dateKey);
    expect(total).toBe(750);
  });

  it("retrieves entries by date", async () => {
    const dateKey = "2026-06-07";
    await addWaterEntry(dateKey, 750);
    const entries = await getWaterByDate(dateKey);
    expect(entries.length).toBe(1);
    expect(entries[0].amountMl).toBe(750);
  });
});

describe("toDateKey", () => {
  it("returns a valid YYYY-MM-DD format", () => {
    // Use explicit local date to avoid UTC offset issues
    const date = new Date(2026, 5, 25); // month is 0-indexed
    const key = toDateKey(date);
    expect(key).toBe("2026-06-25");
  });
});

describe("generateId", () => {
  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBe(36); // UUID format
  });
});
