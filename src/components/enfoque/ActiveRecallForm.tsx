"use client";
import { useState } from "react";
import { Brain, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveActiveRecall } from "@/db/repositories/wellness";
import { toDateKey } from "@/db/db";
import { formatDuration } from "@/lib/utils";
import type { FocusSession } from "@/types";

interface ActiveRecallFormProps {
  session: FocusSession;
  onComplete: () => void;
}

export function ActiveRecallForm({ session, onComplete }: ActiveRecallFormProps) {
  const [saving, setSaving] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testContent, setTestContent] = useState("");
  const [referenceContent, setReferenceContent] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  const [form, setForm] = useState({
    whatLearned: "",
    remembered: "",
    mistakes: "",
    stillConfused: "",
    nextStep: "",
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await saveActiveRecall({
      sessionId: session.id,
      dateKey: toDateKey(),
      ...form,
      testContent: testMode ? testContent : undefined,
      referenceContent: testMode ? referenceContent : undefined,
    });
    setSaving(false);
    onComplete();
  };

  const actualMin = session.actualMinutes ?? session.plannedMinutes;

  return (
    <Card className="border-[var(--primary)]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain size={17} className="text-[var(--primary)]" />
          Recuperación activa
        </CardTitle>
        <p className="text-xs text-[var(--muted-foreground)]">
          Bloque completado · {formatDuration(actualMin * 60)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="what-learned">¿Qué aprendí?</Label>
          <Textarea
            id="what-learned"
            value={form.whatLearned}
            onChange={update("whatLearned")}
            placeholder="Describe brevemente lo que cubriste..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remembered">¿Qué fórmula, concepto o procedimiento recuerdo sin mirar?</Label>
          <Textarea
            id="remembered"
            value={form.remembered}
            onChange={update("remembered")}
            placeholder="Escribe de memoria, sin revisar tus notas..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mistakes">¿Dónde me equivoqué?</Label>
          <Textarea
            id="mistakes"
            value={form.mistakes}
            onChange={update("mistakes")}
            placeholder="Errores que noté..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confused">¿Qué todavía no comprendo?</Label>
          <Textarea
            id="confused"
            value={form.stillConfused}
            onChange={update("stillConfused")}
            placeholder="Dudas pendientes..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="next-step">¿Cuál es el siguiente paso?</Label>
          <Textarea
            id="next-step"
            value={form.nextStep}
            onChange={update("nextStep")}
            placeholder="La próxima acción concreta..."
            rows={2}
          />
        </div>

        {session.blockType === "estudio" && (
          <button
            onClick={() => setTestMode(!testMode)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            <BookOpen size={15} />
            {testMode ? "Ocultar" : "Prueba sin mirar"}
          </button>
        )}

        {testMode && (
          <div className="space-y-3 border-l-2 border-[var(--primary)]/30 pl-4">
            <div className="space-y-2">
              <Label htmlFor="test-content">Escribe sin mirar (fórmulas, conceptos, procedimientos)</Label>
              <Textarea
                id="test-content"
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Explica con tus propias palabras, escribe las fórmulas que recuerdes..."
                rows={4}
              />
            </div>
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              {showCompare ? "Ocultar referencia" : "Agregar nota de referencia para comparar"}
            </button>
            {showCompare && (
              <div className="space-y-2">
                <Label htmlFor="ref-content">Nota de referencia</Label>
                <Textarea
                  id="ref-content"
                  value={referenceContent}
                  onChange={(e) => setReferenceContent(e.target.value)}
                  placeholder="Lo que debería decir según tus apuntes..."
                  rows={3}
                />
              </div>
            )}
            <p className="text-xs text-[var(--muted-foreground)] italic">
              La comparación es manual por ahora. En futuras versiones una IA podrá darte retroalimentación.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Guardando..." : "Guardar y continuar"}
          </Button>
          <Button variant="outline" onClick={onComplete}>
            Omitir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
