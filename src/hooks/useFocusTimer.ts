"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { FocusSession } from "@/types";
import {
  createFocusSession,
  updateFocusSession,
  getActiveSession,
  addInterruption,
} from "@/db/repositories/focusSessions";
import { toDateKey } from "@/db/db";

interface TimerState {
  session: FocusSession | null;
  elapsed: number; // segundos
  remaining: number; // segundos
  isRunning: boolean;
  isPaused: boolean;
  isBreak: boolean;
  isComplete: boolean;
}

export function useFocusTimer() {
  const [state, setState] = useState<TimerState>({
    session: null,
    elapsed: 0,
    remaining: 0,
    isRunning: false,
    isPaused: false,
    isBreak: false,
    isComplete: false,
  });

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<FocusSession | null>(null);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  // Calcular elapsed basado en timestamps para evitar drift
  const getElapsed = (session: FocusSession): number => {
    if (!session.startTimestamp) return 0;
    const now = Date.now();
    const raw = now - session.startTimestamp;
    const pausedMs = session.totalPausedMs ?? 0;
    const active = Math.max(0, raw - pausedMs);
    return Math.floor(active / 1000);
  };

  const tick = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.state !== "running") return;
    const elapsed = getElapsed(s);
    const plannedSec = s.plannedMinutes * 60;
    const remaining = Math.max(0, plannedSec - elapsed);

    setState((prev) => ({ ...prev, elapsed, remaining }));

    if (remaining <= 0) {
      clearTick();
      completeSession();
    }
  }, []);

  const completeSession = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    const elapsed = getElapsed(s);
    await updateFocusSession(s.id, {
      state: "completed",
      endTimestamp: Date.now(),
      actualMinutes: Math.round(elapsed / 60),
    });
    const updated = { ...s, state: "completed" as const };
    sessionRef.current = updated;
    setState((prev) => ({
      ...prev,
      session: updated,
      isRunning: false,
      isPaused: false,
      isComplete: true,
      remaining: 0,
    }));
  }, []);

  // Restaurar sesión activa al montar
  useEffect(() => {
    getActiveSession().then((s) => {
      if (s) {
        sessionRef.current = s;
        const elapsed = getElapsed(s);
        const remaining = Math.max(0, s.plannedMinutes * 60 - elapsed);
        const isRunning = s.state === "running";
        const isPaused = s.state === "paused";
        setState({
          session: s,
          elapsed,
          remaining,
          isRunning,
          isPaused,
          isBreak: false,
          isComplete: s.state === "completed",
        });
        if (isRunning) {
          tickRef.current = setInterval(tick, 500);
        }
      }
    });
    return clearTick;
  }, [tick]);

  const start = useCallback(
    async (
      plannedMinutes: number,
      breakMinutes: number,
      mode: FocusSession["mode"],
      blockType: FocusSession["blockType"],
      priorityId?: string
    ) => {
      clearTick();
      const dateKey = toDateKey();
      const session = await createFocusSession({
        dateKey,
        priorityId,
        mode,
        blockType,
        plannedMinutes,
        breakMinutes,
        startTimestamp: Date.now(),
        totalPausedMs: 0,
        state: "running",
        interruptionCount: 0,
        completedBreak: false,
      });
      sessionRef.current = session;
      setState({
        session,
        elapsed: 0,
        remaining: plannedMinutes * 60,
        isRunning: true,
        isPaused: false,
        isBreak: false,
        isComplete: false,
      });
      tickRef.current = setInterval(tick, 500);
    },
    [tick]
  );

  const pause = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || s.state !== "running") return;
    clearTick();
    const updated = { ...s, state: "paused" as const, pausedAt: Date.now() };
    await updateFocusSession(s.id, { state: "paused", pausedAt: Date.now() });
    sessionRef.current = updated;
    setState((prev) => ({ ...prev, session: updated, isRunning: false, isPaused: true }));
  }, []);

  const resume = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || s.state !== "paused") return;
    const additionalPaused = s.pausedAt ? Date.now() - s.pausedAt : 0;
    const newTotal = (s.totalPausedMs ?? 0) + additionalPaused;
    const updated = {
      ...s,
      state: "running" as const,
      totalPausedMs: newTotal,
      pausedAt: undefined,
    };
    await updateFocusSession(s.id, {
      state: "running",
      totalPausedMs: newTotal,
      pausedAt: undefined,
    });
    sessionRef.current = updated;
    setState((prev) => ({
      ...prev,
      session: updated,
      isRunning: true,
      isPaused: false,
    }));
    tickRef.current = setInterval(tick, 500);
  }, [tick]);

  const cancel = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    clearTick();
    const elapsed = getElapsed(s);
    await updateFocusSession(s.id, {
      state: "idle",
      endTimestamp: Date.now(),
      actualMinutes: Math.round(elapsed / 60),
    });
    sessionRef.current = null;
    setState({
      session: null,
      elapsed: 0,
      remaining: 0,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      isComplete: false,
    });
  }, []);

  const finish = useCallback(async () => {
    await completeSession();
  }, [completeSession]);

  const registerInterruption = useCallback(async (reason?: string) => {
    const s = sessionRef.current;
    if (!s) return;
    await addInterruption(s.id, s.dateKey, reason);
    const updated = { ...s, interruptionCount: s.interruptionCount + 1 };
    sessionRef.current = updated;
    setState((prev) => ({ ...prev, session: updated }));
  }, []);

  const reset = useCallback(() => {
    clearTick();
    sessionRef.current = null;
    setState({
      session: null,
      elapsed: 0,
      remaining: 0,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      isComplete: false,
    });
  }, []);

  return {
    ...state,
    start,
    pause,
    resume,
    cancel,
    finish,
    registerInterruption,
    reset,
  };
}
