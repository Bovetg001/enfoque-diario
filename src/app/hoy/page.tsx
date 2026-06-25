"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DailyGreeting } from "@/components/hoy/DailyGreeting";
import { BreathingTimer } from "@/components/hoy/BreathingTimer";
import { WoopForm } from "@/components/hoy/WoopForm";
import { PrioritiesSection } from "@/components/hoy/PrioritiesSection";
import { WaterTracker } from "@/components/hoy/WaterTracker";
import { MovementTracker } from "@/components/hoy/MovementTracker";
import { EveningReflectionForm } from "@/components/hoy/EveningReflectionForm";
import { DBErrorMessage } from "@/components/shared/DBErrorMessage";
import { Button } from "@/components/ui/button";
import { toDateKey } from "@/db/db";
import {
  getOrCreateDailyPlan,
  saveWoop,
  updateDayStatus,
  getPastWoopEntries,
} from "@/db/repositories/dailyPlan";
import {
  getPrioritiesByDate,
  createPriority,
  updatePriority,
  togglePriorityComplete,
  movePriorityToDate,
} from "@/db/repositories/priorities";
import {
  addWaterEntry,
  getWaterByDate,
  deleteWaterEntry,
  addMovementEntry,
  getMovementByDate,
  deleteMovementEntry,
  saveEveningReflection,
  getEveningReflection,
  getBreathingByDate,
} from "@/db/repositories/wellness";
import { getSettings } from "@/db/repositories/settings";
import type {
  DailyPlan,
  DailyPriority,
  WaterEntry,
  MovementEntry,
  EveningReflection,
  WoopEntry,
  DayStatus,
  MovementType,
} from "@/types";
import { addDays, format } from "date-fns";

export default function HoyPage() {
  const router = useRouter();
  const today = toDateKey();

  const [userName, setUserName] = useState("");
  const [waterGoal, setWaterGoal] = useState(2000);
  const [dayPlan, setDayPlan] = useState<DailyPlan | null>(null);
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [movementEntries, setMovementEntries] = useState<MovementEntry[]>([]);
  const [eveningReflection, setEveningReflection] = useState<EveningReflection | undefined>();
  const [pastWoops, setPastWoops] = useState<WoopEntry[]>([]);
  const [breathingDone, setBreathingDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isMinimal, setIsMinimal] = useState(false);

  const load = useCallback(async () => {
    try {
      const [settings, plan, pris, water, movement, reflection, pastW, breathings] =
        await Promise.all([
          getSettings(),
          getOrCreateDailyPlan(today),
          getPrioritiesByDate(today),
          getWaterByDate(today),
          getMovementByDate(today),
          getEveningReflection(today),
          getPastWoopEntries(10),
          getBreathingByDate(today),
        ]);
      setUserName(settings.name);
      setWaterGoal(settings.waterGoalMl);
      setDayPlan(plan);
      setPriorities(pris);
      setWaterEntries(water);
      setMovementEntries(movement);
      setEveningReflection(reflection);
      setPastWoops(pastW);
      setBreathingDone(breathings.some((b) => b.completed));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!dayPlan) return;
    const completed = priorities.filter((p) => p.type !== "extra" && p.completed).length;
    let status: DayStatus = "empty";
    if (breathingDone || waterEntries.length > 0 || completed > 0) status = "in_progress";
    if (isMinimal) status = "minimal";
    if (completed > 0 && eveningReflection && breathingDone) status = "complete";
    if (completed > 0 && !eveningReflection) status = "partial";
    if (status !== dayPlan.status) {
      updateDayStatus(today, status);
      setDayPlan((p) => p ? { ...p, status } : p);
    }
  }, [priorities, breathingDone, waterEntries, eveningReflection, isMinimal, dayPlan, today]);

  const handleSaveWoop = async (woop: WoopEntry) => {
    await saveWoop(today, woop);
    setDayPlan((p) => p ? { ...p, woop } : p);
  };

  const handleAddPriority = async (
    data: Omit<DailyPriority, "id" | "dateKey" | "createdAt" | "updatedAt" | "completed" | "order">
  ) => {
    const order = priorities.filter((p) => p.type === data.type).length;
    const p = await createPriority({ ...data, dateKey: today, completed: false, order });
    setPriorities((prev) => [...prev, p]);
  };

  const handleToggle = async (id: string) => {
    await togglePriorityComplete(id);
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  const handleEditPriority = async (id: string, data: Partial<DailyPriority>) => {
    await updatePriority(id, data);
    setPriorities((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const handleMoveNext = async (id: string) => {
    const nextDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
    await movePriorityToDate(id, nextDate);
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, movedToDate: nextDate } : p))
    );
  };

  const handleStartFocus = (p: DailyPriority) => {
    router.push(`/enfoque?priorityId=${p.id}`);
  };

  const handleAddWater = async (ml: number) => {
    const entry = await addWaterEntry(today, ml);
    setWaterEntries((prev) => [...prev, entry]);
  };

  const handleDeleteWater = async (id: string) => {
    await deleteWaterEntry(id);
    setWaterEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddMovement = async (type: MovementType, minutes: number, notes?: string) => {
    const entry = await addMovementEntry(today, type, minutes, notes);
    setMovementEntries((prev) => [...prev, entry]);
  };

  const handleDeleteMovement = async (id: string) => {
    await deleteMovementEntry(id);
    setMovementEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveEvening = async (
    data: Omit<EveningReflection, "id" | "dateKey" | "createdAt" | "updatedAt">
  ) => {
    const saved = await saveEveningReflection(today, data);
    setEveningReflection(saved);
    if (data.firstActionTomorrow) {
      const nextDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
      const { updateDailyPlan } = await import("@/db/repositories/dailyPlan");
      await updateDailyPlan(nextDate, { firstActionTomorrow: data.firstActionTomorrow });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="animate-pulse text-[var(--muted-foreground)] text-sm">Cargando...</div>
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <DBErrorMessage
          message={loadError}
          onRetry={() => { setLoadError(""); setLoading(true); load(); }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <DailyGreeting
        name={userName}
        status={dayPlan?.status ?? "empty"}
        firstActionTomorrow={dayPlan?.firstActionTomorrow}
      />

      <div className="px-4 pb-4 space-y-4">
        {!isMinimal && (
          <button
            onClick={() => setIsMinimal(true)}
            className="w-full text-sm text-center text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors py-1"
          >
            Hoy necesito la versión mínima
          </button>
        )}
        {isMinimal && (
          <div className="rounded-xl bg-[var(--secondary)] border border-[var(--border)] p-3 text-sm">
            <p className="font-medium text-[var(--foreground)]">Modo rutina mínima activo</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              3 min respiración · 1 bloque 25 min · 10 min movimiento · 3 cosas buenas
            </p>
            <button
              onClick={() => setIsMinimal(false)}
              className="text-xs text-[var(--primary)] mt-1 hover:underline"
            >
              Volver a la rutina completa
            </button>
          </div>
        )}

        <BreathingTimer onComplete={() => setBreathingDone(true)} />

        {!isMinimal && (
          <WoopForm
            initial={dayPlan?.woop}
            pastEntries={pastWoops}
            onSave={handleSaveWoop}
          />
        )}

        <PrioritiesSection
          priorities={priorities}
          onAdd={handleAddPriority}
          onToggle={handleToggle}
          onEdit={handleEditPriority}
          onMoveNext={handleMoveNext}
          onStartFocus={handleStartFocus}
        />

        <WaterTracker
          entries={waterEntries}
          goalMl={waterGoal}
          onAdd={handleAddWater}
          onDelete={handleDeleteWater}
        />
        <MovementTracker
          entries={movementEntries}
          onAdd={handleAddMovement}
          onDelete={handleDeleteMovement}
        />

        <EveningReflectionForm
          initial={eveningReflection}
          onSave={handleSaveEvening}
        />
      </div>
    </AppShell>
  );
}
