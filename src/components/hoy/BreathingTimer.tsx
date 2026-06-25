"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBreathingSession } from "@/db/repositories/wellness";
import { toDateKey } from "@/db/db";
import { formatDuration } from "@/lib/utils";

type Phase = "inhale" | "hold" | "exhale" | "rest";
type TimerState = "idle" | "running" | "paused" | "done";

const PHASE_CONFIG: Record<Phase, { label: string; seconds: number; next: Phase }> = {
  inhale: { label: "Inhala", seconds: 4, next: "hold" },
  hold: { label: "Sostén", seconds: 4, next: "exhale" },
  exhale: { label: "Exhala", seconds: 6, next: "rest" },
  rest: { label: "Descansa", seconds: 2, next: "inhale" },
};

const DURATION_OPTIONS = [
  { label: "3 min", minutes: 3 },
  { label: "5 min", minutes: 5 },
  { label: "7 min", minutes: 7 },
];

interface BreathingTimerProps {
  onComplete?: () => void;
}

export function BreathingTimer({ onComplete }: BreathingTimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(3);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseRemaining, setPhaseRemaining] = useState(PHASE_CONFIG.inhale.seconds);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const startTimestamp = useRef(0);
  const pausedMs = useRef(0);
  const pausedAt = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("inhale");
  const phaseEndRef = useRef(0); // timestamp when current phase ends

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const finish = useCallback(async (elapsed: number, completed: boolean) => {
    clearTick();
    setTimerState("done");
    await saveBreathingSession(toDateKey(), selectedMinutes, elapsed, completed);
    onComplete?.();
  }, [selectedMinutes, onComplete]);

  const tick = useCallback(() => {
    const now = Date.now();
    const totalDuration = selectedMinutes * 60 * 1000;
    const rawElapsed = now - startTimestamp.current;
    const activeElapsed = rawElapsed - pausedMs.current;
    const elapsed = Math.floor(activeElapsed / 1000);
    const remaining = Math.max(0, totalDuration - activeElapsed);

    setTotalElapsed(elapsed);
    setTotalRemaining(Math.ceil(remaining / 1000));

    if (remaining <= 0) {
      finish(elapsed, true);
      return;
    }

    // Phase management
    const phaseRemSec = Math.max(0, Math.ceil((phaseEndRef.current - now) / 1000));
    setPhaseRemaining(phaseRemSec);

    if (now >= phaseEndRef.current) {
      const nextPhase = PHASE_CONFIG[phaseRef.current].next;
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
      phaseEndRef.current = now + PHASE_CONFIG[nextPhase].seconds * 1000;
      setPhaseRemaining(PHASE_CONFIG[nextPhase].seconds);
    }
  }, [selectedMinutes, finish]);

  const start = () => {
    const now = Date.now();
    startTimestamp.current = now;
    pausedMs.current = 0;
    phaseRef.current = "inhale";
    phaseEndRef.current = now + PHASE_CONFIG.inhale.seconds * 1000;
    setPhase("inhale");
    setPhaseRemaining(PHASE_CONFIG.inhale.seconds);
    setTotalRemaining(selectedMinutes * 60);
    setTotalElapsed(0);
    setTimerState("running");
    tickRef.current = setInterval(tick, 200);
  };

  const pause = () => {
    clearTick();
    pausedAt.current = Date.now();
    setTimerState("paused");
  };

  const resume = () => {
    const additional = Date.now() - pausedAt.current;
    pausedMs.current += additional;
    phaseEndRef.current += additional;
    setTimerState("running");
    tickRef.current = setInterval(tick, 200);
  };

  const stop = async () => {
    clearTick();
    await finish(totalElapsed, false);
  };

  const reset = () => {
    clearTick();
    setTimerState("idle");
    setPhase("inhale");
    setPhaseRemaining(PHASE_CONFIG.inhale.seconds);
    setTotalRemaining(0);
    setTotalElapsed(0);
  };

  useEffect(() => () => clearTick(), []);

  const circleScale =
    phase === "inhale" ? 1.3 : phase === "hold" ? 1.3 : phase === "exhale" ? 1.0 : 1.0;

  const circleColor =
    phase === "inhale"
      ? "bg-blue-400/20 border-blue-400"
      : phase === "hold"
      ? "bg-indigo-400/20 border-indigo-400"
      : phase === "exhale"
      ? "bg-teal-400/20 border-teal-400"
      : "bg-slate-300/20 border-slate-300";

  if (timerState === "done") {
    return (
      <Card>
        <CardContent className="py-6 text-center space-y-3">
          <div className="text-3xl">🌿</div>
          <p className="font-medium">Sesión completada</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {formatDuration(totalElapsed)} de respiración consciente
          </p>
          <Button variant="outline" size="sm" onClick={reset}>
            Nueva sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Inicio consciente</CardTitle>
        <p className="text-xs text-[var(--muted-foreground)] italic">
          No necesitas dejar la mente en blanco. Solo nota la distracción y vuelve a tu respiración.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {timerState === "idle" && (
          <div className="flex gap-2 flex-wrap">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => setSelectedMinutes(opt.minutes)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMinutes === opt.minutes
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {timerState !== "idle" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${circleColor}`}
              style={{ transform: `scale(${circleScale})` }}
            >
              <span className="text-sm font-medium text-[var(--foreground)]">
                {PHASE_CONFIG[phase].label}
              </span>
              <span className="text-2xl font-bold text-[var(--primary)]">
                {phaseRemaining}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Restante: {formatDuration(totalRemaining)}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {timerState === "idle" && (
            <Button onClick={start} className="w-full">
              <Play size={16} />
              Comenzar {selectedMinutes} min
            </Button>
          )}
          {timerState === "running" && (
            <>
              <Button variant="outline" onClick={pause} className="flex-1">
                <Pause size={16} /> Pausar
              </Button>
              <Button variant="outline" size="icon" onClick={stop} aria-label="Finalizar">
                <Square size={16} />
              </Button>
            </>
          )}
          {timerState === "paused" && (
            <>
              <Button onClick={resume} className="flex-1">
                <Play size={16} /> Reanudar
              </Button>
              <Button variant="outline" size="icon" onClick={stop} aria-label="Finalizar">
                <Square size={16} />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
