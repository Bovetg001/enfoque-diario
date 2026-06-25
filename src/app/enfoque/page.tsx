"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FocusTimer } from "@/components/enfoque/FocusTimer";
import { getPrioritiesByDate } from "@/db/repositories/priorities";
import { getSessionsByDate } from "@/db/repositories/focusSessions";
import { toDateKey } from "@/db/db";
import { formatDuration } from "@/lib/utils";
import type { DailyPriority, FocusSession } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, CheckCircle } from "lucide-react";

function EnfoqueContent() {
  const searchParams = useSearchParams();
  const priorityId = searchParams.get("priorityId");
  const quickMin = searchParams.get("minutes");
  const today = toDateKey();

  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    Promise.all([
      getPrioritiesByDate(today),
      getSessionsByDate(today),
    ]).then(([pris, sessions]) => {
      setPriorities(pris);
      setTodaySessions(sessions);
    });
  }, [today]);

  const completedSessions = todaySessions.filter((s) => s.state === "completed");
  const totalMin = completedSessions.reduce((s, ses) => s + (ses.actualMinutes ?? ses.plannedMinutes), 0);

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Timer size={20} className="text-[var(--primary)]" />
            Enfoque
          </h1>
          {completedSessions.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
              <CheckCircle size={15} className="text-[var(--success)]" />
              {completedSessions.length} bloques · {totalMin} min
            </div>
          )}
        </div>

        <FocusTimer
          priorities={priorities}
          quickStartMinutes={quickMin ? Number(quickMin) : undefined}
        />

        {completedSessions.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
                Bloques de hoy
              </p>
              <div className="space-y-2">
                {completedSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{s.blockType}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {s.actualMinutes ?? s.plannedMinutes} min
                      {s.interruptionCount > 0 && (
                        <span className="ml-2 text-[var(--warning)]">
                          {s.interruptionCount} int.
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default function EnfoquePage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="animate-pulse text-[var(--muted-foreground)] text-sm">Cargando...</div>
        </div>
      </AppShell>
    }>
      <EnfoqueContent />
    </Suspense>
  );
}
