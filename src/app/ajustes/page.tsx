"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Download, Upload, Trash2, Shield } from "lucide-react";
import { getSettings, updateSettings } from "@/db/repositories/settings";
import { exportAllData, importAllData, clearAllData } from "@/db/repositories/export";
import { downloadJSON } from "@/lib/utils";
import { DBErrorMessage } from "@/components/shared/DBErrorMessage";
import type { UserSettings } from "@/types";

export default function AjustesPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

  function loadSettings() {
    getSettings()
      .then((s) => {
        setSettings(s);
        setTheme(s.theme);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
      });
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const update = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await updateSettings({ [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    await updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = await exportAllData();
    downloadJSON(data, `enfoque-diario-backup-${new Date().toISOString().split("T")[0]}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        await importAllData(data);
        window.location.reload();
      } catch {
        setImportError("El archivo no es válido. Usa un respaldo JSON de Enfoque Diario.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    await clearAllData();
    window.location.reload();
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "auto") => {
    setTheme(newTheme);
    await update("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("enfoque-theme", "dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("enfoque-theme", "light");
    } else {
      localStorage.removeItem("enfoque-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  };

  if (loadError) {
    return (
      <AppShell>
        <DBErrorMessage message={loadError} onRetry={() => { setLoadError(""); loadSettings(); }} />
      </AppShell>
    );
  }

  if (!settings) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="animate-pulse text-sm text-[var(--muted-foreground)]">Cargando...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-5">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Settings size={20} className="text-[var(--primary)]" />
          Ajustes
        </h1>

        {/* Perfil */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="user-name">Tu nombre</Label>
              <Input
                id="user-name"
                value={settings.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="¿Cómo te llamo?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="start-time">Hora de inicio del día</Label>
              <Input
                id="start-time"
                type="time"
                value={settings.startTime}
                onChange={(e) => update("startTime", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="evening-time">Hora de cierre nocturno</Label>
              <Input
                id="evening-time"
                type="time"
                value={settings.eveningTime}
                onChange={(e) => update("eveningTime", e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Temporizadores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Temporizadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pomo-min">Pomodoro (min)</Label>
                <Input
                  id="pomo-min"
                  type="number"
                  min={5}
                  max={90}
                  value={settings.pomodoroMinutes}
                  onChange={(e) => update("pomodoroMinutes", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deep-min">Bloque profundo (min)</Label>
                <Input
                  id="deep-min"
                  type="number"
                  min={10}
                  max={180}
                  value={settings.deepWorkMinutes}
                  onChange={(e) => update("deepWorkMinutes", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="short-break">Pausa corta (min)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min={1}
                  max={30}
                  value={settings.shortBreakMinutes}
                  onChange={(e) => update("shortBreakMinutes", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="long-break">Pausa larga (min)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min={1}
                  max={60}
                  value={settings.longBreakMinutes}
                  onChange={(e) => update("longBreakMinutes", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidratación */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Hidratación</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="water-goal">Meta diaria de agua (ml)</Label>
            <Input
              id="water-goal"
              type="number"
              min={500}
              max={5000}
              step={250}
              value={settings.waterGoalMl}
              onChange={(e) => update("waterGoalMl", Number(e.target.value))}
              className="mt-1"
            />
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tema</Label>
              <div className="flex gap-2 mt-2">
                {(["light", "auto", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      theme === t
                        ? "border-[var(--primary)] bg-[var(--secondary)]"
                        : "border-transparent bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Auto"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="support-phrases">Frases de apoyo</Label>
              <Switch
                id="support-phrases"
                checked={settings.supportPhrasesEnabled}
                onCheckedChange={(v) => update("supportPhrasesEnabled", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sounds">Sonidos</Label>
              <Switch
                id="sounds"
                checked={settings.soundEnabled}
                onCheckedChange={(v) => update("soundEnabled", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration">Vibración</Label>
              <Switch
                id="vibration"
                checked={settings.vibrationEnabled}
                onCheckedChange={(v) => update("vibrationEnabled", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="week-monday">Semana empieza en lunes</Label>
              <Switch
                id="week-monday"
                checked={settings.weekStartsMonday}
                onCheckedChange={(v) => update("weekStartsMonday", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Datos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Datos y respaldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
              <Download size={16} />
              Exportar datos (JSON)
            </Button>

            <div>
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => document.getElementById("import-file")?.click()}
              >
                <Upload size={16} />
                Importar respaldo JSON
              </Button>
              {importError && (
                <p className="text-xs text-[var(--error)] mt-1">{importError}</p>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 size={16} />
                  Borrar todos los datos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar todos los datos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todos tus registros, planificaciones, sesiones e historial. No se puede deshacer. Exporta un respaldo antes si necesitas conservar la información.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-[var(--error)] hover:opacity-90"
                    onClick={handleClearAll}
                  >
                    Sí, borrar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Privacidad */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield size={15} />
              Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <p>Todos los datos se almacenan localmente en este dispositivo usando IndexedDB.</p>
            <p>No se envía ninguna información a servidores externos en esta versión.</p>
            <p>Si limpias los datos del navegador o desinstala la aplicación, los datos se perderán. Usa la opción de exportar para mantener un respaldo.</p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Enfoque Diario v1.0.0 · Datos locales
        </p>
      </div>
    </AppShell>
  );
}
