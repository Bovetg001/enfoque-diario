"use client";
import { useState } from "react";
import { RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toDateKey } from "@/db/db";
import { savePositiveReset } from "@/db/repositories/wellness";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { negative: '"No entiendo nada"', positive: '"Todavía no entiendo este paso."' },
  { negative: '"Perdí el día"', positive: '"Todavía puedo completar una acción pequeña."' },
  { negative: '"Siempre procrastino"', positive: '"Me distraje y ahora puedo volver."' },
  { negative: '"Seguro me irá mal"', positive: '"Puedo mejorar mi preparación desde ahora."' },
  { negative: '"Tengo demasiadas cosas"', positive: '"Primero elegiré la siguiente acción concreta."' },
];

export function PositiveResetFab() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [form, setForm] = useState({
    whatHappened: "",
    negativeInterpretation: "",
    whatICanControl: "",
    tenMinuteAction: "",
  });

  const handleSave = async () => {
    await savePositiveReset(toDateKey(), form);
    setSaved(true);
  };

  const handleReset = () => {
    setStep(0);
    setSaved(false);
    setTimerStarted(false);
    setForm({ whatHappened: "", negativeInterpretation: "", whatICanControl: "", tenMinuteAction: "" });
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(handleReset, 300);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Reinicio positivo"
        className={cn(
          "fixed bottom-[84px] right-4 z-30 w-12 h-12 rounded-full",
          "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg",
          "flex items-center justify-center",
          "transition-transform active:scale-90 hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        )}
      >
        <RefreshCw size={20} aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reinicio positivo</DialogTitle>
          </DialogHeader>

          {!saved ? (
            <div className="space-y-4">
              <p className="text-xs text-[var(--muted-foreground)] italic">
                Una herramienta para momentos de frustración o bloqueo.
              </p>

              <div className="space-y-2">
                <Label htmlFor="whatHappened">¿Qué ocurrió realmente?</Label>
                <Textarea
                  id="whatHappened"
                  placeholder="Describe los hechos concretos..."
                  value={form.whatHappened}
                  onChange={(e) => setForm((f) => ({ ...f, whatHappened: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negInt">¿Qué interpretación negativa estoy agregando?</Label>
                <Textarea
                  id="negInt"
                  placeholder="El pensamiento que me frena..."
                  value={form.negativeInterpretation}
                  onChange={(e) => setForm((f) => ({ ...f, negativeInterpretation: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="control">¿Qué sí puedo controlar?</Label>
                <Textarea
                  id="control"
                  placeholder="Lo que está en mi mano hacer..."
                  value={form.whatICanControl}
                  onChange={(e) => setForm((f) => ({ ...f, whatICanControl: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">¿Cuál es una acción de 10 minutos?</Label>
                <Textarea
                  id="action"
                  placeholder="Una acción concreta y pequeña..."
                  value={form.tenMinuteAction}
                  onChange={(e) => setForm((f) => ({ ...f, tenMinuteAction: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="rounded-xl bg-[var(--muted)] p-3 space-y-1.5">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Ejemplos de reformulación</p>
                {EXAMPLES.map((ex, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-[var(--error)]">{ex.negative}</span>
                    <span className="text-[var(--muted-foreground)]"> → </span>
                    <span className="text-[var(--success)]">{ex.positive}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSave}
                className="w-full"
                disabled={!form.whatHappened && !form.tenMinuteAction}
              >
                Guardar y continuar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="text-4xl">✓</div>
              <p className="font-medium">
                Hecho. Ahora realiza solamente la acción de 10 minutos.
              </p>
              {form.tenMinuteAction && (
                <p className="text-sm text-[var(--muted-foreground)] italic">
                  "{form.tenMinuteAction}"
                </p>
              )}
              {!timerStarted ? (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    setTimerStarted(true);
                    // Dispatch evento para iniciar temporizador de 10 min desde enfoque
                    window.dispatchEvent(
                      new CustomEvent("start-quick-timer", { detail: { minutes: 10 } })
                    );
                    handleClose();
                  }}
                >
                  <Timer size={16} />
                  Iniciar temporizador 10 min
                </Button>
              ) : null}
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
