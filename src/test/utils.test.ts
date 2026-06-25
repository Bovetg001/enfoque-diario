import { describe, it, expect } from "vitest";
import { formatDuration, formatMinutes, getGreeting, getDayStatusLabel, formatDate } from "@/lib/utils";

describe("formatDuration", () => {
  it("formats seconds under one hour as MM:SS", () => {
    expect(formatDuration(90)).toBe("01:30");
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("formats seconds over one hour as H:MM:SS", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});

describe("formatMinutes", () => {
  it("formats minutes under 60 correctly", () => {
    expect(formatMinutes(25)).toBe("25 min");
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("formats hours correctly", () => {
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(90)).toBe("1h 30min");
    expect(formatMinutes(120)).toBe("2h");
  });
});

describe("getGreeting", () => {
  it("returns a greeting string", () => {
    const greeting = getGreeting("Ana");
    expect(typeof greeting).toBe("string");
    expect(greeting).toContain("Ana");
  });

  it("works without a name", () => {
    const greeting = getGreeting();
    expect(typeof greeting).toBe("string");
    expect(greeting.length).toBeGreaterThan(0);
  });
});

describe("getDayStatusLabel", () => {
  it("returns correct labels", () => {
    expect(getDayStatusLabel("empty")).toBe("Sin comenzar");
    expect(getDayStatusLabel("in_progress")).toBe("En progreso");
    expect(getDayStatusLabel("minimal")).toBe("Rutina mínima");
    expect(getDayStatusLabel("complete")).toBe("Día completado");
    expect(getDayStatusLabel("partial")).toBe("Día parcial");
  });
});
