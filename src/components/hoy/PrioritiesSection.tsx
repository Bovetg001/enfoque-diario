"use client";
import { useState } from "react";
import { Plus, Check, ChevronRight, MoreHorizontal, Timer, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategoryLabel, cn } from "@/lib/utils";
import type { DailyPriority, PriorityType, CategoryType } from "@/types";

const PRIORITY_LABELS: Record<PriorityType, string> = {
  critical: "Tarea crítica",
  secondary: "Tarea secundaria",
  personal: "Tarea personal",
  extra: "Adicional",
};

const CATEGORIES: CategoryType[] = [
  "universidad", "proyecto", "trabajo", "ejercicio", "salud", "personal", "otro",
];

interface PriorityCardProps {
  priority: DailyPriority;
  onToggle: (id: string) => void;
  onEdit: (p: DailyPriority) => void;
  onMoveNext: (id: string) => void;
  onStartFocus: (p: DailyPriority) => void;
}

function PriorityCard({ priority, onToggle, onEdit, onMoveNext, onStartFocus }: PriorityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-colors",
        priority.completed
          ? "bg-[var(--muted)] border-transparent opacity-70"
          : "bg-[var(--card)] border-[var(--border)]"
      )}
    >
      <button
        onClick={() => onToggle(priority.id)}
        aria-label={priority.completed ? "Marcar como pendiente" : "Marcar como completada"}
        className={cn(
          "mt-0.5 min-w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
          priority.completed
            ? "bg-[var(--success)] border-[var(--success)]"
            : "border-[var(--border)] hover:border-[var(--primary)]"
        )}
      >
        {priority.completed && <Check size={12} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", priority.completed && "line-through text-[var(--muted-foreground)]")}>
          {priority.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="outline" className="text-xs py-0">
            {getCategoryLabel(priority.category)}
          </Badge>
          {priority.estimatedMinutes && (
            <span className="text-xs text-[var(--muted-foreground)]">
              ~{priority.estimatedMinutes} min
            </span>
          )}
        </div>
        {priority.notes && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{priority.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!priority.completed && (
          <button
            onClick={() => onStartFocus(priority)}
            aria-label="Iniciar bloque de enfoque"
            className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--primary)] transition-colors"
          >
            <Timer size={15} />
          </button>
        )}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Más opciones"
          className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Opciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { onEdit(priority); setMenuOpen(false); }}>
              Editar tarea
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { onMoveNext(priority.id); setMenuOpen(false); }}>
              <ArrowRight size={15} />
              Mover al día siguiente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AddPriorityFormProps {
  type: PriorityType;
  onAdd: (data: Omit<DailyPriority, "id" | "dateKey" | "createdAt" | "updatedAt" | "completed" | "order">) => void;
  onCancel: () => void;
  initial?: DailyPriority;
}

function AddPriorityForm({ type, onAdd, onCancel, initial }: AddPriorityFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<CategoryType>(initial?.category ?? "personal");
  const [estMin, setEstMin] = useState(String(initial?.estimatedMinutes ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ type, title: title.trim(), category, estimatedMinutes: estMin ? Number(estMin) : undefined, notes: notes || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="priority-title">Nombre de la tarea</Label>
        <Input
          id="priority-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué necesitas hacer?"
          autoFocus
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Categoría</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as CategoryType)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{getCategoryLabel(c)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="est-min">Duración est. (min)</Label>
          <Input
            id="est-min"
            type="number"
            min={1}
            max={480}
            value={estMin}
            onChange={(e) => setEstMin(e.target.value)}
            placeholder="25"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalles adicionales..."
          rows={2}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={!title.trim()}>
          {initial ? "Guardar cambios" : "Agregar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

interface PrioritiesSectionProps {
  priorities: DailyPriority[];
  onAdd: (data: Omit<DailyPriority, "id" | "dateKey" | "createdAt" | "updatedAt" | "completed" | "order">) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, data: Partial<DailyPriority>) => void;
  onMoveNext: (id: string) => void;
  onStartFocus: (p: DailyPriority) => void;
}

export function PrioritiesSection({
  priorities,
  onAdd,
  onToggle,
  onEdit,
  onMoveNext,
  onStartFocus,
}: PrioritiesSectionProps) {
  const [addingType, setAddingType] = useState<PriorityType | null>(null);
  const [editingPriority, setEditingPriority] = useState<DailyPriority | null>(null);

  const mainTypes: PriorityType[] = ["critical", "secondary", "personal"];

  const byType = (type: PriorityType) =>
    priorities.filter((p) => p.type === type).sort((a, b) => a.order - b.order);

  const extraPriorities = byType("extra");

  const handleEdit = (p: DailyPriority) => setEditingPriority(p);

  const handleSaveEdit = (data: Omit<DailyPriority, "id" | "dateKey" | "createdAt" | "updatedAt" | "completed" | "order">) => {
    if (editingPriority) {
      onEdit(editingPriority.id, { ...data });
      setEditingPriority(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tres prioridades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mainTypes.map((type) => {
          const items = byType(type);
          const hasItem = items.length > 0;

          return (
            <div key={type} className="space-y-2">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                {PRIORITY_LABELS[type]}
              </p>
              {items.map((p) => (
                <PriorityCard
                  key={p.id}
                  priority={p}
                  onToggle={onToggle}
                  onEdit={handleEdit}
                  onMoveNext={onMoveNext}
                  onStartFocus={onStartFocus}
                />
              ))}
              {addingType === type ? (
                <AddPriorityForm
                  type={type}
                  onAdd={(data) => {
                    onAdd(data);
                    setAddingType(null);
                  }}
                  onCancel={() => setAddingType(null)}
                />
              ) : !hasItem ? (
                <button
                  onClick={() => setAddingType(type)}
                  className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Plus size={16} />
                  Agregar {PRIORITY_LABELS[type].toLowerCase()}
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Bandeja adicional */}
        {extraPriorities.length > 0 && (
          <div className="space-y-2 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
              Bandeja adicional
            </p>
            {extraPriorities.map((p) => (
              <PriorityCard
                key={p.id}
                priority={p}
                onToggle={onToggle}
                onEdit={handleEdit}
                onMoveNext={onMoveNext}
                onStartFocus={onStartFocus}
              />
            ))}
          </div>
        )}

        {addingType === "extra" ? (
          <AddPriorityForm
            type="extra"
            onAdd={(data) => {
              onAdd(data);
              setAddingType(null);
            }}
            onCancel={() => setAddingType(null)}
          />
        ) : (
          <button
            onClick={() => setAddingType("extra")}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
          >
            <Plus size={13} />
            Agregar a bandeja adicional
          </button>
        )}
      </CardContent>

      {/* Dialog para editar */}
      <Dialog open={!!editingPriority} onOpenChange={(v) => { if (!v) setEditingPriority(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
          </DialogHeader>
          {editingPriority && (
            <AddPriorityForm
              type={editingPriority.type}
              initial={editingPriority}
              onAdd={handleSaveEdit}
              onCancel={() => setEditingPriority(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
