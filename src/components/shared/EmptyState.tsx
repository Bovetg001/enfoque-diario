import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-10 px-6 gap-3",
        className
      )}
    >
      {icon && (
        <div className="text-[var(--muted-foreground)] opacity-50 mb-1">{icon}</div>
      )}
      <p className="font-medium text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
