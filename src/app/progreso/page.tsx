"use client";
import { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyChart } from "@/components/progreso/WeeklyChart";
import { ActivityCalendar } from "@/components/progreso/ActivityCalendar";
import { BarChart2 } from "lucide-react";
import { DBErrorMessage } from "@/components/shared/DBErrorMessage";
import { getSessionsRange } from "@/db/repositories/focusSessions";
import { getBreathingRange, getWaterRange, getMovementRange, getEveningReflectionsRange } from "@/db/repositories/wellness";
import { getPrioritiesRange } from "@/db/repositories/priorities";
import { getAllDailyPlans } from "@/db/repositories/dailyPlan";
import type { DayStatus } from "@/types";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{value}</p>
      {sub && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ProgresoPage() {
  const [weekData, setWeekData] = useState<{ label: string; minutos: number; bloques: number }[]>([]);
  const [stats, setStats] = useState({
    focusBlocks: 0,
    focusMinutes: 0,
    breathingSessions: 0,
    prioritiesCompleted: 0,
    minimalDays: 0,
    completeDays: 0,
    waterAvgMl: 0,
    movementMinutes: 0,
    eveningReflections: 0,
  });
  const [calendarDays, setCalendarDays] = useState<{ dateKey: string; status: DayStatus }[]>([]);
  const [whatWorking, setWhatWorking] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const now = new Date();
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(now, "yyyy-MM-dd");

      const [sessions, breathings, waters, movements, evenings, priorities, allPlans] =
        await Promise.all([
          getSessionsRange(weekStart, weekEnd),
          getBreathingRange(weekStart, weekEnd),
          getWaterRange(weekStart, weekEnd),
          getMovementRange(weekStart, weekEnd),
          getEveningReflectionsRange(weekStart, weekEnd),
          getPrioritiesRange(weekStart, weekEnd),
          getAllDailyPlans(),
        ]);

      const completedSessions = sessions.filter((s) => s.state === "completed");
      const focusMin = completedSessions.reduce((s, ses) => s + (ses.actualMinutes ?? ses.plannedMinutes), 0);

      const waterDays: Record<string, number> = {};
      waters.forEach((w) => { waterDays[w.dateKey] = (waterDays[w.dateKey] ?? 0) + w.amountMl; });
      const waterAvg = Object.values(waterDays).length > 0
        ? Math.round(Object.values(waterDays).reduce((a, b) => a + b, 0) / Object.values(waterDays).length)
        : 0;

      setStats({
        focusBlocks: completedSessions.length,
        focusMinutes: focusMin,
        breathingSessions: breathings.filter((b) => b.completed).length,
        prioritiesCompleted: priorities.filter((p) => p.completed && p.type !== "extra").length,
        minimalDays: allPlans.filter((p) => p.status === "minimal").length,
        completeDays: allPlans.filter((p) => p.status === "complete").length,
        waterAvgMl: waterAvg,
        movementMinutes: movements.reduce((s, m) => s + m.durationMinutes, 0),
        eveningReflections: evenings.length,
      });

      const weekDays = eachDayOfInterval({ start: new Date(weekStart), end: new Date(weekEnd) });
      const sessionsByDate: Record<string, { min: number; count: number }> = {};
      completedSessions.forEach((s) => {
        if (!sessionsByDate[s.dateKey]) sessionsByDate[s.dateKey] = { min: 0, count: 0 };
        sessionsByDate[s.dateKey].min += s.actualMinutes ?? s.plannedMinutes;
        sessionsByDate[s.dateKey].count++;
      });
      setWeekData(
        weekDays.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          return {
            label: format(d, "EEE", { locale: es }).slice(0, 2),
            minutos: sessionsByDate[key]?.min ?? 0,
            bloques: sessionsByDate[key]?.count ?? 0,
          };
        })
      );

      const calDays = allPlans
        .filter((p) => p.dateKey >= monthStart && p.dateKey <= monthEnd)
        .map((p) => ({ dateKey: p.dateKey, status: p.status }));
      setCalendarDays(calDays);

      const working: string[] = [];
      if (breathings.length > 0 && completedSessions.length >= 3) {
        working.push("Los días con respiración tienes más bloques completados.");
      }
      if (completedSessions.length >= allPlans.filter((p) => p.dateKey >= weekStart).length * 0.7) {
        working.push("Esta semana completaste la mayoría de tus bloques planificados.");
      }
      if (evenings.length >= 3) {
        working.push("Estás manteniendo la reflexión nocturna — eso ayuda al día siguiente.");
      }
      if (working.length === 0) {
        working.push("Sigue registrando para ver patrones en tu semana.");
      }
      setWhatWorking(working);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="animate-pulse text-sm text-[var(--muted-foreground)]">Cargando...</div>
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <DBErrorMessage message={loadError} onRetry={() => { setLoadError(""); setLoading(true); loadData(); }} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-5">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <BarChart2 size={20} className="text-[var(--primary)]" />
          Progreso
        </h1>

        <div>
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-3">
            Esta semana
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Bloques de enfoque" value={stats.focusBlocks} />
            <StatCard label="Minutos de enfoque" value={stats.focusMinutes} sub="min" />
            <StatCard label="Prioridades completadas" value={stats.prioritiesCompleted} />
            <StatCard label="Sesiones de respiración" value={stats.breathingSessions} />
            <StatCard label="Promedio agua" value={`${stats.waterAvgMl} ml`} />
            <StatCard label="Minutos movimiento" value={stats.movementMinutes} sub="min" />
            <StatCard label="Cierres nocturnos" value={stats.eveningReflections} />
            <StatCard label="Días completados" value={stats.completeDays} />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Minutos de enfoque por día</CardTitle>
          </CardHeader>
          <CardContent>
            {weekData.some((d) => d.minutos > 0) ? (
              <WeeklyChart data={weekData} />
            ) : (
              <p className="text-sm text-center text-[var(--muted-foreground)] py-8">
                Sin sesiones esta semana
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lo que está funcionando</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {whatWorking.map((item, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-[var(--success)] mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Actividad del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityCalendar month={new Date()} days={calendarDays} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
