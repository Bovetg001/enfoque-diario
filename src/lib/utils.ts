import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateKey: string): string {
  const date = parseISO(dateKey);
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  return format(date, "d 'de' MMMM", { locale: es });
}

export function formatDateFull(dateKey: string): string {
  const date = parseISO(dateKey);
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const base =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  return name ? `${base}, ${name}` : base;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    universidad: "Universidad",
    proyecto: "Proyecto",
    trabajo: "Trabajo",
    ejercicio: "Ejercicio",
    salud: "Salud",
    personal: "Personal",
    otro: "Otro",
  };
  return labels[cat] ?? capitalizeFirst(cat);
}

export function getMovementLabel(type: string): string {
  const labels: Record<string, string> = {
    movilidad: "Movilidad",
    rehabilitacion: "Rehabilitación",
    entrenamiento: "Entrenamiento",
    caminata: "Caminata",
    descanso_activo: "Descanso activo",
    otro: "Otro",
  };
  return labels[type] ?? capitalizeFirst(type);
}

export function getEmotionalLabel(scale: string): string {
  const labels: Record<string, string> = {
    muy_dificil: "Muy difícil",
    dificil: "Difícil",
    normal: "Normal",
    bueno: "Bueno",
    muy_bueno: "Muy bueno",
  };
  return labels[scale] ?? scale;
}

export function getDayStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    empty: "Sin comenzar",
    in_progress: "En progreso",
    minimal: "Rutina mínima",
    complete: "Día completado",
    partial: "Día parcial",
  };
  return labels[status] ?? status;
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(rows: string[][], filename: string): void {
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
