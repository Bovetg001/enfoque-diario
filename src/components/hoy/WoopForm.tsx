"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WoopEntry } from "@/types";

interface WoopFormProps {
  initial?: WoopEntry;
  pastEntries?: WoopEntry[];
  onSave: (woop: WoopEntry) => Promise<void>;
}

const EXAMPLE: WoopEntry = {
  desire: "Resolver dos ejercicios de transferencia de calor.",
  outcome: "Comprender mejor la materia y sentirme preparado.",
  obstacle: "Distraerme con el celular.",
  plan: "Si tomo el celular durante el bloque, entonces lo dejaré lejos y retomaré el último paso.",
};

export function WoopForm({ initial, pastEntries = [], onSave }: WoopFormProps) {
  const [expanded, setExpanded] = useState(!initial?.desire);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [form, setForm] = useState<WoopEntry>(
    initial ?? { desire: "", outcome: "", obstacle: "", plan: "" }
  );

  const handleSave = async () => {
    if (!form.desire) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setSaved(true);
    setExpanded(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const loadPast = (entry: WoopEntry) => {
    setForm(entry);
    setShowPast(false);
    setExpanded(true);
  };

  const loadExample = () => {
    setForm(EXAMPLE);
    setExpanded(true);
  };

  const update = (field: keyof WoopEntry) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <div>
            <CardTitle className="text-base">Objetivo del día (WOOP)</CardTitle>
            {!expanded && form.desire && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                {form.desire}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && <Check size={16} className="text-[var(--success)]" />}
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="woop-desire">Deseo — ¿Qué quiero conseguir hoy?</Label>
            <Textarea
              id="woop-desire"
              placeholder="Ej: Resolver dos ejercicios de transferencia de calor."
              value={form.desire}
              onChange={update("desire")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="woop-outcome">Resultado — ¿Qué cambiaría si lo logro?</Label>
            <Textarea
              id="woop-outcome"
              placeholder="Ej: Comprender mejor la materia y sentirme preparado."
              value={form.outcome}
              onChange={update("outcome")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="woop-obstacle">Obstáculo — ¿Qué podría detenerme?</Label>
            <Textarea
              id="woop-obstacle"
              placeholder="Ej: Distraerme con el celular."
              value={form.obstacle}
              onChange={update("obstacle")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="woop-plan">Plan — Si ocurre _____, entonces haré _____.</Label>
            <Textarea
              id="woop-plan"
              placeholder="Ej: Si tomo el celular, entonces lo dejaré lejos y retomaré el último paso."
              value={form.plan}
              onChange={update("plan")}
              rows={2}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleSave}
              disabled={!form.desire || saving}
              className="flex-1"
            >
              {saving ? "Guardando..." : "Guardar objetivo"}
            </Button>
            {pastEntries.length > 0 && (
              <Button variant="outline" size="icon" onClick={() => setShowPast((v) => !v)} aria-label="Ver objetivos anteriores">
                <RefreshCw size={16} />
              </Button>
            )}
          </div>

          {!form.desire && (
            <button
              onClick={loadExample}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              Cargar ejemplo
            </button>
          )}

          {showPast && (
            <div className="space-y-2 border-t border-[var(--border)] pt-3">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Objetivos anteriores</p>
              {pastEntries.slice(0, 5).map((e, i) => (
                <button
                  key={i}
                  onClick={() => loadPast(e)}
                  className="w-full text-left text-sm bg-[var(--muted)] rounded-xl px-3 py-2 hover:bg-[var(--secondary)] transition-colors line-clamp-2"
                >
                  {e.desire}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
