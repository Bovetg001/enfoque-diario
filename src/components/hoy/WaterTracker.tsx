"use client";
import { Droplets, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WaterEntry } from "@/types";

const QUICK_AMOUNTS = [250, 500, 750];

interface WaterTrackerProps {
  entries: WaterEntry[];
  goalMl: number;
  onAdd: (ml: number) => void;
  onDelete: (id: string) => void;
}

export function WaterTracker({ entries, goalMl, onAdd, onDelete }: WaterTrackerProps) {
  const total = entries.reduce((s, e) => s + e.amountMl, 0);
  const percentage = Math.min(100, Math.round((total / goalMl) * 100));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets size={17} className="text-blue-400" />
            Hidratación
          </CardTitle>
          <span className="text-sm font-medium text-[var(--muted-foreground)]">
            {total} / {goalMl} ml
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percentage} />

        <div className="flex gap-2">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              onClick={() => onAdd(ml)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)] active:scale-95 transition-all"
            >
              +{ml < 1000 ? `${ml}ml` : `${ml / 1000}L`}
            </button>
          ))}
        </div>

        {entries.length > 0 && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {[...entries].reverse().slice(0, 8).map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="text-[var(--muted-foreground)]">
                  {new Date(e.timestamp).toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-medium">{e.amountMl} ml</span>
                <button
                  onClick={() => onDelete(e.id)}
                  aria-label="Eliminar registro"
                  className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {percentage >= 100 && (
          <p className="text-sm text-[var(--success)] font-medium text-center">
            Meta de hidratación alcanzada
          </p>
        )}
      </CardContent>
    </Card>
  );
}
