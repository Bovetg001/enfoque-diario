"use client";
import { useState } from "react";
import { Moon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { EveningReflection, EmotionalScale } from "@/types";

const SCALE_OPTIONS: { value: EmotionalScale; label: string; color: string }[] = [
  { value: "muy_dificil", label: "Muy difícil", color: "bg-red-400" },
  { value: "dificil", label: "Difícil", color: "bg-orange-400" },
  { value: "normal", label: "Normal", color: "bg-yellow-400" },
  { value: "bueno", label: "Bueno", color: "bg-lime-400" },
  { value: "muy_bueno", label: "Muy bueno", color: "bg-green-500" },
];

interface EveningReflectionFormProps {
  initial?: EveningReflection;
  onSave: (data: Omit<EveningReflection, "id" | "dateKey" | "createdAt" | "updatedAt">) => Promise<void>;
}

export function EveningReflectionForm({ initial, onSave }: EveningReflectionFormProps) {
  const [expanded, setExpanded] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(!!initial);

  const [good1, setGood1] = useState(initial?.threeGoodThings[0] ?? "");
  const [good2, setGood2] = useState(initial?.threeGoodThings[1] ?? "");
  const [good3, setGood3] = useState(initial?.threeGoodThings[2] ?? "");
  const [whyGood, setWhyGood] = useState(initial?.whyGood ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [lesson, setLesson] = useState(initial?.lessonLearned ?? "");
  const [adjustment, setAdjustment] = useState(initial?.adjustment ?? "");
  const [firstAction, setFirstAction] = useState(initial?.firstActionTomorrow ?? "");
  const [scale, setScale] = useState<EmotionalScale | undefined>(initial?.emotionalScale);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      threeGoodThings: [good1 || "–", good2 || "–", good3 || "–"],
      whyGood,
      difficulty,
      lessonLearned: lesson,
      adjustment,
      firstActionTomorrow: firstAction,
      emotionalScale: scale,
    });
    setSaving(false);
    setDone(true);
    setExpanded(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Moon size={16} className="text-indigo-400" />
            Cierre nocturno
          </CardTitle>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {done && (
            <div className="rounded-xl bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)] italic">
              "Hoy no necesitabas hacerlo perfecto. Lo importante es que ahora tienes información para mañana."
            </div>
          )}

          <div className="space-y-2">
            <Label>Tres cosas buenas que ocurrieron hoy</Label>
            <Textarea value={good1} onChange={(e) => setGood1(e.target.value)} placeholder="1. " rows={1} />
            <Textarea value={good2} onChange={(e) => setGood2(e.target.value)} placeholder="2. " rows={1} />
            <Textarea value={good3} onChange={(e) => setGood3(e.target.value)} placeholder="3. " rows={1} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="why-good">¿Por qué ocurrieron?</Label>
            <Textarea id="why-good" value={whyGood} onChange={(e) => setWhyGood(e.target.value)} placeholder="Qué hice o qué circunstancias ayudaron..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">¿Qué dificultad tuve?</Label>
            <Textarea id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">¿Qué aprendí de esa dificultad?</Label>
            <Textarea id="lesson" value={lesson} onChange={(e) => setLesson(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment">¿Qué ajustaré mañana?</Label>
            <Textarea id="adjustment" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first-action">¿Cuál será mi primera acción concreta mañana?</Label>
            <Textarea
              id="first-action"
              value={firstAction}
              onChange={(e) => setFirstAction(e.target.value)}
              placeholder="Ej: Abrir el libro de termodinámica y resolver el ejercicio 3.2"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>¿Cómo estuvo hoy? (opcional)</Label>
            <div className="flex gap-2 flex-wrap">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScale(scale === opt.value ? undefined : opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                    scale === opt.value
                      ? "border-[var(--primary)] bg-[var(--secondary)]"
                      : "border-transparent bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] italic">
              Esta escala es solo para tu registro personal, no es un diagnóstico.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Guardar cierre del día"}
          </Button>
        </CardContent>
      )}

      {done && !expanded && (
        <CardContent className="pt-0">
          <p className="text-sm text-[var(--success)]">Cierre completado</p>
          {initial?.firstActionTomorrow && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Mañana: {initial.firstActionTomorrow}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
