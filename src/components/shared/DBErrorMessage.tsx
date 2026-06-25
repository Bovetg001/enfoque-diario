"use client";
import { AlertTriangle } from "lucide-react";

interface DBErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function DBErrorMessage({ message, onRetry }: DBErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 gap-4 text-center">
      <AlertTriangle size={36} className="text-[var(--warning)]" />
      <p className="font-medium text-[var(--foreground)]">No se pudieron cargar los datos</p>
      <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
        Si estás usando <strong>modo privado</strong> o accediendo por <strong>HTTP sin HTTPS</strong>, el
        almacenamiento local puede estar restringido en iPhone.
      </p>
      {message && (
        <p className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)] rounded-lg px-3 py-2 max-w-xs break-all">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
