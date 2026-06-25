"use client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--warning)] text-white text-xs flex items-center justify-center gap-1.5 py-1.5 px-4"
    >
      <WifiOff size={13} aria-hidden="true" />
      <span>Sin conexión — los datos se guardan localmente</span>
    </div>
  );
}
