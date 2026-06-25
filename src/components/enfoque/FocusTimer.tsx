"use client";
import { useState, useEffect } from "react";
import { Play, Pause, Square, AlertCircle, StickyNote, Check, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDuration, getCategoryLabel } from "@/lib/utils";
import { addQuickNote } from "@/db/repositories/focusSessions";
import { toDateKey } from "@/db/db";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import type { DailyPriority, FocusMode, FocusBlockType } from "@/types";
import { ActiveRecallForm } from "./ActiveRecallForm";

const BLOCK_TYPES: { value: FocusBlockType; label: string }[] = [
  { value: "estudio", label: "Estudio" },
  { value: "trabajo", label: "Trabajo" },
  { value: "proyecto", label: "Proyecto" },
  { value: "lectura", label: "Lectura" },
  { value: "practica", label: "Práctica" },
  { value: "otro", label: "Otro" },
];

interface FocusTimerProps {
  priorities: DailyPriority[];
  quickStartMinutes?: number;
}

export function FocusTimer({ priorities, quickStartMinutes }: FocusTimerProps) {
  const timer = useFocusTimer();

  const [mode, setMode] = useState<FocusMode>("pomodoro");
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [blockType, setBlockType] = useState<FocusBlockType>("estudio");
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>("");

  const [interruptDialog, setInterruptDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [interruptReason, setInterruptReason] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [showRecall, setShowRecall] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent<{ minutes: number }>) => {
      setMode("custom");
      setWorkMin(e.detail.minutes);
      setBreakMin(0);
    };
    window.addEventListener("start-quick-timer", handler as EventListener);
    return () => window.removeEventListener("start-quick-timer", handler as EventListener);
  }, []);

  useEffect(() => {
    if (quickStartMinutes) {
      setMode("custom");
      setWorkMin(quickStartMinutes);
    }
  }, [quickStartMinutes]);

  useEffect(() => {
    if (mode === "pomodoro") { setWorkMin(25); setBreakMin(5); }
    else if (mode === "deep") { setWorkMin(50); setBreakMin(10); }
  }, [mode]);

  useEffect(() => {
    if (timer.isComplete && !showRecall) {
      setShowRecall(true);
    }
  }, [timer.isComplete]);

  const handleStart = () => {
    timer.start(
      workMin,
      breakMin,
      mode,
      blockType,
      selectedPriorityId || undefined
    );
  };

  const handleInterrupt = async () => {
    await timer.registerInterruption(interruptReason || undefined);
    setInterruptDialog(false);
    setInterruptReason("");
  };

  const handleNote = async () => {
    if (!noteContent.trim()) return;
    await addQuickNote(noteContent, toDateKey(), timer.session?.id);
    setNoteContent("");
    setNoteSaved(true);
    setTimeout(() => { setNoteSaved(false); setNoteDialog(false); }, 1000);
  };

  const selectedPriority = priorities.find((p) => p.id === selectedPriorityId);
  const activePriority = timer.session?.priorityId
    ? priorities.find((p) => p.id === timer.session?.priorityId)
    : undefined;

  if (showRecall && timer.session) {
    return (
      <ActiveRecallForm
        session={timer.session}
        onComplete={() => {
          setShowRecall(false);
          timer.reset();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Configuración */}
      {!timer.isRunning && !timer.isPaused && !timer.isComplete && (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex gap-2">
              {(["pomodoro", "deep", "custom"] as FocusMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    mode === m
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {m === "pomodoro" ? "Pomodoro" : m === "deep" ? "Profundo" : "Custom"}
                </button>
              ))}
            </div>

            {mode === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="work-min">Trabajo (min)</Label>
                  <input
                    id="work-min"
                    type="number"
                    min={1}
                    max={180}
                    value={workMin}
                    onChange={(e) => setWorkMin(Number(e.target.value))}
                    className="mt-1 flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div>
                  <Label htmlFor="break-min">Descanso (min)</Label>
                  <input
                    id="break-min"
                    type="number"
                    min={0}
                    max={60}
                    value={breakMin}
                    onChange={(e) => setBreakMin(Number(e.target.value))}
                    className="mt-1 flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              </div>
            )}

            {mode !== "custom" && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {workMin} min trabajo · {breakMin} min descanso
              </p>
            )}

            <div>
              <Label>Tipo de bloque</Label>
              <Select value={blockType} onValueChange={(v) => setBlockType(v as FocusBlockType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((bt) => (
                    <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {priorities.length > 0 && (
              <div>
                <Label>Tarea asociada (opcional)</Label>
                <Select value={selectedPriorityId} onValueChange={setSelectedPriorityId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una tarea..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin tarea específica</SelectItem>
                    {priorities.filter((p) => !p.completed).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleStart} size="lg" className="w-full">
              <Play size={18} />
              Iniciar {workMin} minutos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timer activo */}
      {(timer.isRunning || timer.isPaused) && (
        <Card>
          <CardContent className="pt-6 pb-5 space-y-5">
            {activePriority && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{getCategoryLabel(activePriority.category)}</Badge>
                <span className="text-sm font-medium truncate">{activePriority.title}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 py-4">
              <div
                className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                  timer.isPaused
                    ? "border-[var(--warning)] bg-[var(--warning)]/10"
                    : "border-[var(--primary)] bg-[var(--primary)]/10"
                }`}
              >
                <span className="text-3xl font-bold tabular-nums text-[var(--foreground)]">
                  {formatDuration(timer.remaining)}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] mt-1">
                  {timer.isPaused ? "Pausado" : "Trabajando"}
                </span>
              </div>
              {timer.session && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Interrupciones: {timer.session.interruptionCount}
                </p>
              )}
            </div>

            <p className="text-xs text-center text-[var(--muted-foreground)] italic">
              No necesitas sentirte motivado. Solo vuelve al siguiente paso.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {timer.isRunning ? (
                <Button variant="outline" onClick={timer.pause} className="col-span-1">
                  <Pause size={16} /> Pausar
                </Button>
              ) : (
                <Button onClick={timer.resume} className="col-span-1">
                  <Play size={16} /> Reanudar
                </Button>
              )}
              <Button variant="outline" onClick={timer.finish} className="col-span-1">
                <Check size={16} /> Finalizar
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-[var(--warning)]"
                onClick={() => setInterruptDialog(true)}
              >
                <AlertCircle size={15} /> Me distraje
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setNoteDialog(true)}
              >
                <StickyNote size={15} /> Anotar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--error)]"
                onClick={timer.cancel}
                aria-label="Cancelar sesión"
              >
                <Square size={15} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog interrupción */}
      <Dialog open={interruptDialog} onOpenChange={setInterruptDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Qué te distrajo?</DialogTitle>
          </DialogHeader>
          <Textarea
            value={interruptReason}
            onChange={(e) => setInterruptReason(e.target.value)}
            placeholder="(opcional) Celular, notificación, pensamiento..."
            rows={3}
          />
          <p className="text-xs text-[var(--muted-foreground)] italic">
            Me distraje y ahora puedo volver.
          </p>
          <Button onClick={handleInterrupt} className="w-full">Registrar y volver</Button>
        </DialogContent>
      </Dialog>

      {/* Dialog nota */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Anotar pensamiento</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--muted-foreground)]">
            Anota algo pendiente sin abandonar la sesión.
          </p>
          {noteSaved ? (
            <p className="text-center text-[var(--success)] font-medium py-4">¡Anotado!</p>
          ) : (
            <>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Escribe aquí..."
                rows={3}
                autoFocus
              />
              <Button onClick={handleNote} className="w-full" disabled={!noteContent.trim()}>
                Guardar nota
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
