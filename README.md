# Enfoque Diario

Aplicación web progresiva (PWA) para organizar tu rutina diaria, mejorar la concentración, mantener una mentalidad positiva realista y aumentar la productividad de forma sostenible.

## Características

- **Planificación diaria** con método WOOP (Deseo, Resultado, Obstáculo, Plan)
- **Tres prioridades diarias** con categorías, duración estimada y seguimiento
- **Temporizador de concentración** con modos Pomodoro, Bloque profundo y Custom
- **Persistencia por timestamp** — el temporizador no pierde tiempo si la pestaña se suspende
- **Respiración consciente** con animación de fases y temporizador
- **Recuperación activa** post-bloque con "Prueba sin mirar"
- **Reinicio positivo** — herramienta de reestructuración cognitiva desde cualquier pantalla
- **Seguimiento de hidratación y movimiento**
- **Cierre nocturno** con tres cosas buenas y primera acción del día siguiente
- **Rutina mínima** para días difíciles (sin penalización de racha)
- **Estadísticas semanales** y calendario de actividad mensual
- **Historial por fecha** con búsqueda
- **Exportar/importar** datos en JSON
- **PWA instalable** y funcional sin conexión
- **Modo claro, oscuro y automático**

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| TypeScript | 5 | Tipado estático |
| Tailwind CSS | 4 | Estilos |
| Radix UI | Latest | Componentes accesibles |
| Dexie.js | 4 | IndexedDB (almacenamiento local) |
| Recharts | 3 | Gráficos |
| date-fns | 4 | Manipulación de fechas |
| lucide-react | Latest | Iconos |
| next-pwa | 5 | Service Worker y PWA |
| Vitest | 4 | Pruebas unitarias |

**Nota sobre next-pwa**: `next-pwa` usa Webpack internamente. En Next.js 16 Turbopack es el default, por lo que el build requiere `--webpack`. Si se migra a Turbopack en el futuro, considerar `@serwist/next`.

## Requisitos

- Node.js 18+
- npm 9+
- Navegador moderno con soporte para IndexedDB

## Instalación

```bash
git clone <repo>
cd enfoque-diario
npm install
```

## Ejecución local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Compilación de producción

```bash
npm run build
npm start
```

## Pruebas

```bash
# Pruebas unitarias
npm test

# Modo watch
npm run test:watch

# Verificación de tipos
npm run type-check
```

## Arquitectura

```
src/
├── app/              # Next.js App Router (páginas)
│   ├── hoy/          # Pantalla principal del día
│   ├── enfoque/      # Temporizador de concentración
│   ├── progreso/     # Estadísticas
│   ├── historial/    # Historial por fecha
│   └── ajustes/      # Configuración
├── components/
│   ├── ui/           # Componentes base (Button, Card, etc.)
│   ├── layout/       # AppShell, BottomNavigation
│   ├── hoy/          # Componentes de la pantalla Hoy
│   ├── enfoque/      # FocusTimer, ActiveRecallForm
│   ├── progreso/     # WeeklyChart, ActivityCalendar
│   └── shared/       # Componentes compartidos
├── db/
│   ├── db.ts         # Instancia Dexie + helpers
│   └── repositories/ # Acceso a datos por entidad
├── hooks/            # useFocusTimer, useTheme, useOnlineStatus
├── lib/              # utils.ts (cn, formatDuration, etc.)
├── types/            # Tipos TypeScript globales
└── test/             # Pruebas unitarias
```

## Modelo de datos

Todas las tablas IndexedDB tienen `id` (UUID), `createdAt` y `updatedAt` en ISO 8601. Las tablas con datos diarios incluyen `dateKey` en formato `YYYY-MM-DD`.

| Tabla | Descripción |
|---|---|
| `userSettings` | Configuración del usuario (singleton) |
| `dailyPlans` | Plan diario con WOOP y estado |
| `dailyPriorities` | Las tres prioridades + extras |
| `focusSessions` | Sesiones de concentración |
| `focusInterruptions` | Interrupciones por sesión |
| `quickNotes` | Notas rápidas durante sesiones |
| `activeRecallEntries` | Recuperación activa post-bloque |
| `breathingSessions` | Sesiones de respiración consciente |
| `waterEntries` | Registros de hidratación |
| `movementEntries` | Registros de movimiento |
| `positiveResetEntries` | Reinicios positivos |
| `eveningReflections` | Cierres nocturnos |
| `dailyStatus` | Estado consolidado del día |
| `customCategories` | Categorías personalizadas |

## Privacidad

- Todos los datos se almacenan **únicamente en el dispositivo** del usuario usando IndexedDB.
- **No se envía ningún dato a servidores externos** en esta versión.
- Si el usuario limpia los datos del navegador o desinstala la aplicación, los datos se perderán.
- Usa la opción **Exportar datos** en Ajustes para crear un respaldo local.

## Limitaciones conocidas

- Las notificaciones en segundo plano dependen del soporte del navegador/SO.
- En iOS Safari, el Service Worker tiene restricciones adicionales.
- `next-pwa` requiere el flag `--webpack` para compilar en Next.js 16.
- No hay sincronización entre dispositivos en esta versión (preparado para Supabase).

## Próximas mejoras

- Autenticación y sincronización con Supabase
- Notificaciones push configurables
- Generación de preguntas con IA en recuperación activa
- Análisis semanal automático
- Exportación CSV por categoría
- Integración con calendario
- App nativa con Capacitor

## Despliegue en Vercel

```bash
npm install -g vercel
vercel
```

O conecta el repositorio en vercel.com y el despliegue es automático.

**Variable de build**: `npm run build` (ya incluye `--webpack`).

## Instalar como PWA

1. Abre la aplicación en Chrome/Edge (móvil o escritorio)
2. **Android**: toca los tres puntos → "Añadir a pantalla de inicio"
3. **iPhone/iPad**: toca el botón Compartir → "Añadir a pantalla de inicio"
4. **Escritorio**: busca el icono de instalación en la barra de direcciones
