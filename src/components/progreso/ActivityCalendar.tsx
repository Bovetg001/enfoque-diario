"use client";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DayStatus } from "@/types";

const STATUS_COLORS: Record<DayStatus, string> = {
  empty: "bg-[var(--secondary)]",
  in_progress: "bg-blue-300 dark:bg-blue-700",
  minimal: "bg-indigo-300 dark:bg-indigo-700",
  partial: "bg-yellow-300 dark:bg-yellow-700",
  complete: "bg-[var(--success)]",
};

interface CalendarDay {
  dateKey: string;
  status: DayStatus;
}

interface ActivityCalendarProps {
  month: Date;
  days: CalendarDay[];
}

export function ActivityCalendar({ month, days }: ActivityCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayMap = new Map(days.map((d) => [d.dateKey, d.status]));
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <p className="text-sm font-medium mb-3 capitalize">
        {format(month, "MMMM yyyy", { locale: es })}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="text-center text-xs text-[var(--muted-foreground)] font-medium pb-1">
            {d}
          </div>
        ))}
        {/* Empty cells for start of month */}
        {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {allDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const status = dayMap.get(key);
          const isToday = key === today;
          const isFuture = key > today;

          return (
            <div
              key={key}
              title={`${format(day, "d MMM", { locale: es })}${status ? `: ${status}` : ""}`}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors",
                isFuture ? "opacity-30" : "",
                status ? STATUS_COLORS[status] : "bg-[var(--muted)]",
                isToday ? "ring-2 ring-[var(--primary)] ring-offset-1" : ""
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
        {(Object.entries(STATUS_COLORS) as [DayStatus, string][]).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            {status === "empty" ? "Sin registro" :
             status === "in_progress" ? "En progreso" :
             status === "minimal" ? "Mínima" :
             status === "partial" ? "Parcial" : "Completo"}
          </div>
        ))}
      </div>
    </div>
  );
}
