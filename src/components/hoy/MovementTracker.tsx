"use client";
import { useState } from "react";
import { Activity, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMovementLabel } from "@/lib/utils";
import type { MovementEntry, MovementType } from "@/types";

const MOVEMENT_TYPES: MovementType[] = [
  "movilidad", "rehabilitacion", "entrenamiento", "caminata", "descanso_activo", "otro",
];

interface MovementTrackerProps {
  entries: MovementEntry[];
  onAdd: (type: MovementType, minutes: number, notes?: string) => void;
  onDelete: (id: string) => void;
}

export function MovementTracker({ entries, onAdd, onDelete }: MovementTrackerProps) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<MovementType>("caminata");
  const [minutes, setMinutes] = useState("25");
  const [notes, setNotes] = useState("");

  const total = entries.reduce((s, e) => s + e.durationMinutes, 0);

  const handleAdd = () => {
    const min = Number(minutes);
    if (!min || min < 1) return;
    onAdd(type, min, notes || undefined);
    setAdding(false);
    setMinutes("25");
    setNotes("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity size={17} className="text-green-500" />
            Movimiento
          </CardTitle>
          {total > 0 && (
            <span className="text-sm text-[var(--muted-foreground)]">{total} min hoy</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{getMovementLabel(e.type)}</span>
              <span className="text-[var(--muted-foreground)] ml-2">{e.durationMinutes} min</span>
              {e.notes && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{e.notes}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(e.id)}
              aria-label="Eliminar registro"
              className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="space-y-3 border-t border-[var(--border)] pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as MovementType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{getMovementLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mov-min">Minutos</Label>
                <Input
                  id="mov-min"
                  type="number"
                  min={1}
                  max={480}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mov-notes">Observaciones (opcional)</Label>
              <Textarea
                id="mov-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Cómo fue?"
                rows={2}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-[var(--muted-foreground)] italic">
              Esta información es solo para tu seguimiento personal.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1" size="sm">Guardar</Button>
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            <Plus size={16} />
            Registrar movimiento
          </button>
        )}
      </CardContent>
    </Card>
  );
}
