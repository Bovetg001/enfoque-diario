"use client";
import { BottomNavigation } from "./BottomNavigation";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { PositiveResetFab } from "@/components/shared/PositiveResetFab";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--background)] flex flex-col">
      <OfflineIndicator />
      <main className="flex-1 overflow-y-auto pb-[76px]" id="main-content">
        <div className="max-w-lg mx-auto w-full">{children}</div>
      </main>
      <PositiveResetFab />
      <BottomNavigation />
    </div>
  );
}
