"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Timer, BarChart2, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hoy", label: "Hoy", Icon: Home },
  { href: "/enfoque", label: "Enfoque", Icon: Timer },
  { href: "/progreso", label: "Progreso", Icon: BarChart2 },
  { href: "/historial", label: "Historial", Icon: Clock },
  { href: "/ajustes", label: "Ajustes", Icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)] border-t border-[var(--border)] safe-bottom"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[60px] px-2 py-2 text-xs transition-colors",
                active
                  ? "text-[var(--primary)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
