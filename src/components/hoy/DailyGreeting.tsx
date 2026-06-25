"use client";
import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getGreeting, capitalizeFirst } from "@/lib/utils";
import { RoutineStatusBadge } from "@/components/shared/RoutineStatusBadge";
import type { DayStatus } from "@/types";

interface DailyGreetingProps {
  name?: string;
  status: DayStatus;
  firstActionTomorrow?: string;
}

export function DailyGreeting({ name, status, firstActionTomorrow }: DailyGreetingProps) {
  const greeting = useMemo(() => getGreeting(name), [name]);
  const dateLabel = useMemo(
    () => capitalizeFirst(format(new Date(), "EEEE d 'de' MMMM", { locale: es })),
    []
  );

  return (
    <div className="px-5 pt-5 pb-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[var(--muted-foreground)] text-sm">{dateLabel}</p>
          <h1 className="text-xl font-semibold text-[var(--foreground)] mt-0.5">{greeting}</h1>
        </div>
        <RoutineStatusBadge status={status} />
      </div>
      {firstActionTomorrow && (
        <div className="mt-3 rounded-xl bg-[var(--secondary)] px-4 py-3">
          <p className="text-xs text-[var(--muted-foreground)] font-medium">Primera acción de hoy</p>
          <p className="text-sm text-[var(--foreground)] mt-0.5">{firstActionTomorrow}</p>
        </div>
      )}
    </div>
  );
}
