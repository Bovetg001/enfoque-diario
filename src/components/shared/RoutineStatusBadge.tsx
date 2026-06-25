import { Badge } from "@/components/ui/badge";
import { getDayStatusLabel } from "@/lib/utils";
import type { DayStatus } from "@/types";

const statusConfig: Record<DayStatus, { variant: "default" | "secondary" | "success" | "warning" | "outline"; label: string }> = {
  empty: { variant: "outline", label: "Sin comenzar" },
  in_progress: { variant: "warning", label: "En progreso" },
  minimal: { variant: "secondary", label: "Rutina mínima" },
  complete: { variant: "success", label: "Completado" },
  partial: { variant: "outline", label: "Día parcial" },
};

interface RoutineStatusBadgeProps {
  status: DayStatus;
}

export function RoutineStatusBadge({ status }: RoutineStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
