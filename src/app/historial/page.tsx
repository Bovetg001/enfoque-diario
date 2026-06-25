"use client";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { RoutineStatusBadge } from "@/components/shared/RoutineStatusBadge";
import { getAllDailyPlans } from "@/db/repositories/dailyPlan";
import { getPrioritiesByDate } from "@/db/repositories/priorities";
import { getSessionsByDate } from "@/db/repositories/focusSessions";
import { getBreathingByDate, getWaterByDate, getMovementByDate, getEveningReflection } from "@/db/repositories/wellness";
import { Clock, Search, ChevronDown, ChevronUp, CheckCircle, Droplets, Activity, Moon, Timer } from "lucide-react";
import { DBErrorMessage } from "@/components/shared/DBErrorMessage";
import type { DailyPlan } from "@/types";

interface DayDetail {
  plan: DailyPlan;
  prioritiesCompleted: number;
  prioritiesTotal: number;
  focusBlocks: number;
  focusMinutes: number;
  waterTotal: number;
  movementMinutes: number;
  breathingDone: boolean;
  eveningDone: boolean;
}

function DayCard({ detail }: { detail: DayDetail }) {
  const [expanded, setExpanded] = useState(false);
  const { plan } = detail;
  const dateLabel = format(parseISO(plan.dateKey), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div>
          <p className="font-medium text-sm capitalize">{dateLabel}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <RoutineStatusBadge status={plan.status} />
            {detail.focusBlocks > 0 && (
              <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                <Timer size={11} />
                {detail.focusBlocks} bloques · {detail.focusMinutes} min
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] px-4 pb-4 pt-3 space-y-3">
          {plan.woop?.desire && (
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-1">Objetivo WOOP</p>
              <p className="text-sm">{plan.woop.desire}</p>
              {plan.woop.plan && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 italic">Plan: {plan.woop.plan}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className={detail.prioritiesCompleted > 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"} />
              <span>{detail.prioritiesCompleted}/{detail.prioritiesTotal} prioridades</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets size={14} className="text-blue-400" />
              <span>{detail.waterTotal} ml agua</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-green-500" />
              <span>{detail.movementMinutes} min mov.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Moon size={14} className={detail.eveningDone ? "text-indigo-400" : "text-[var(--muted-foreground)]"} />
              <span>{detail.eveningDone ? "Cierre hecho" : "Sin cierre"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistorialPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [allDetails, setAllDetails] = useState<DayDetail[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const plans = await getAllDailyPlans();
      const details: DayDetail[] = await Promise.all(
        plans.slice(0, 60).map(async (plan) => {
          const [priorities, sessions, water, movement, breathings, evening] = await Promise.all([
            getPrioritiesByDate(plan.dateKey),
            getSessionsByDate(plan.dateKey),
            getWaterByDate(plan.dateKey),
            getMovementByDate(plan.dateKey),
            getBreathingByDate(plan.dateKey),
            getEveningReflection(plan.dateKey),
          ]);
          const mainPriorities = priorities.filter((p) => p.type !== "extra");
          const completedSessions = sessions.filter((s) => s.state === "completed");
          return {
            plan,
            prioritiesCompleted: mainPriorities.filter((p) => p.completed).length,
            prioritiesTotal: mainPriorities.length,
            focusBlocks: completedSessions.length,
            focusMinutes: completedSessions.reduce((s, ses) => s + (ses.actualMinutes ?? ses.plannedMinutes), 0),
            waterTotal: water.reduce((s, w) => s + w.amountMl, 0),
            movementMinutes: movement.reduce((s, m) => s + m.durationMinutes, 0),
            breathingDone: breathings.some((b) => b.completed),
            eveningDone: !!evening,
          };
        })
      );
      setAllDetails(details);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const filtered = allDetails.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.plan.dateKey.includes(q) ||
      d.plan.woop?.desire?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="animate-pulse text-sm text-[var(--muted-foreground)]">Cargando historial...</div>
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <DBErrorMessage message={loadError} onRetry={() => { setLoadError(""); setLoading(true); loadHistory(); }} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Clock size={20} className="text-[var(--primary)]" />
          Historial
        </h1>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por fecha o objetivo..."
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
            {search ? "No se encontraron resultados." : "No hay registros todavía."}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((detail) => (
              <DayCard key={detail.plan.id} detail={detail} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
