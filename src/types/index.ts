// Tipos principales de Enfoque Diario

export type DayStatus = "empty" | "in_progress" | "minimal" | "complete" | "partial";
export type PriorityType = "critical" | "secondary" | "personal" | "extra";
export type CategoryType =
  | "universidad"
  | "proyecto"
  | "trabajo"
  | "ejercicio"
  | "salud"
  | "personal"
  | "otro";
export type FocusMode = "pomodoro" | "deep" | "custom";
export type FocusState = "idle" | "running" | "paused" | "break" | "completed";
export type BreathingPhase = "inhale" | "hold" | "exhale" | "rest";
export type MovementType =
  | "movilidad"
  | "rehabilitacion"
  | "entrenamiento"
  | "caminata"
  | "descanso_activo"
  | "otro";
export type FocusBlockType =
  | "estudio"
  | "trabajo"
  | "proyecto"
  | "lectura"
  | "practica"
  | "otro";
export type EmotionalScale = "muy_dificil" | "dificil" | "normal" | "bueno" | "muy_bueno";

export interface UserSettings {
  id: string;
  name: string;
  startTime: string; // "HH:mm"
  eveningTime: string; // "HH:mm"
  waterGoalMl: number;
  pomodoroMinutes: number;
  deepWorkMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: "light" | "dark" | "auto";
  weekStartsMonday: boolean;
  supportPhrasesEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPlan {
  id: string;
  dateKey: string; // "YYYY-MM-DD"
  woop?: WoopEntry;
  status: DayStatus;
  isMinimalRoutine: boolean;
  firstActionTomorrow?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WoopEntry {
  desire: string;
  outcome: string;
  obstacle: string;
  plan: string;
}

export interface DailyPriority {
  id: string;
  dateKey: string;
  type: PriorityType;
  title: string;
  category: CategoryType;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completed: boolean;
  notes?: string;
  movedToDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  dateKey: string;
  priorityId?: string;
  mode: FocusMode;
  blockType: FocusBlockType;
  plannedMinutes: number;
  actualMinutes?: number;
  startTimestamp: number; // Unix ms
  endTimestamp?: number;
  pausedAt?: number;
  totalPausedMs: number;
  state: FocusState;
  breakMinutes: number;
  interruptionCount: number;
  completedBreak: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusInterruption {
  id: string;
  sessionId: string;
  dateKey: string;
  reason?: string;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuickNote {
  id: string;
  sessionId?: string;
  dateKey: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveRecallEntry {
  id: string;
  sessionId: string;
  dateKey: string;
  whatLearned: string;
  remembered: string;
  mistakes: string;
  stillConfused: string;
  nextStep: string;
  testContent?: string;
  referenceContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreathingSession {
  id: string;
  dateKey: string;
  durationMinutes: number;
  actualDurationSeconds: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WaterEntry {
  id: string;
  dateKey: string;
  amountMl: number;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

export interface MovementEntry {
  id: string;
  dateKey: string;
  type: MovementType;
  durationMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositiveResetEntry {
  id: string;
  dateKey: string;
  whatHappened: string;
  negativeInterpretation: string;
  whatICanControl: string;
  tenMinuteAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface EveningReflection {
  id: string;
  dateKey: string;
  threeGoodThings: [string, string, string];
  whyGood: string;
  difficulty: string;
  lessonLearned: string;
  adjustment: string;
  firstActionTomorrow: string;
  emotionalScale?: EmotionalScale;
  createdAt: string;
  updatedAt: string;
}

export interface DailyStatus {
  id: string;
  dateKey: string;
  status: DayStatus;
  breathingCompleted: boolean;
  woopCompleted: boolean;
  prioritiesCompleted: number;
  focusSessionsCompleted: number;
  focusMinutesTotal: number;
  waterMlTotal: number;
  movementMinutesTotal: number;
  eveningReflectionCompleted: boolean;
  minimalRoutineCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para estadísticas
export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  focusSessionsCount: number;
  focusMinutesTotal: number;
  breathingSessionsCount: number;
  prioritiesCompleted: number;
  minimalRoutineDays: number;
  completeDays: number;
  activeRecallCount: number;
  waterMlAvg: number;
  movementMinutesTotal: number;
  eveningReflectionsCount: number;
  categoryBreakdown: Record<string, number>;
}

// Tipo para navegación
export interface NavItem {
  href: string;
  label: string;
  icon: string;
}
