# PLAN.md — Enfoque Diario

## Arquitectura General

```
enfoque-diario/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Rutas autenticadas / principales
│   │   │   ├── hoy/            # Pantalla principal
│   │   │   ├── enfoque/        # Temporizador de concentración
│   │   │   ├── progreso/       # Estadísticas
│   │   │   ├── historial/      # Historial por fecha
│   │   │   └── ajustes/        # Configuración
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # shadcn/ui primitivos
│   │   ├── layout/             # AppShell, BottomNavigation
│   │   ├── hoy/                # Componentes pantalla Hoy
│   │   ├── enfoque/            # Temporizador y recuperación
│   │   ├── progreso/           # Gráficos y estadísticas
│   │   └── shared/             # Componentes compartidos
│   ├── db/                     # IndexedDB con Dexie
│   │   ├── schema.ts           # Esquema de la BD
│   │   ├── db.ts               # Instancia de Dexie
│   │   └── repositories/       # Acceso a datos por entidad
│   ├── hooks/                  # Hooks personalizados
│   ├── lib/                    # Utilidades
│   ├── types/                  # Tipos TypeScript
│   └── styles/                 # CSS global
├── public/
│   ├── icons/                  # Iconos PWA
│   └── manifest.json
├── PLAN.md
├── README.md
└── CHANGELOG.md
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| / | Redirect a /hoy |
| /hoy | Pantalla principal del día |
| /enfoque | Temporizador de concentración |
| /progreso | Estadísticas semanales/mensuales |
| /historial | Historial por fecha |
| /ajustes | Configuración del usuario |

## Modelo de Datos (IndexedDB)

### Tablas principales
- `userSettings` — Configuración del usuario
- `dailyPlans` — Plan diario (WOOP + estado)
- `dailyPriorities` — Las 3 prioridades + extra
- `focusSessions` — Sesiones de concentración
- `focusInterruptions` — Interrupciones por sesión
- `quickNotes` — Notas rápidas durante sesiones
- `activeRecallEntries` — Recuperación activa post-bloque
- `breathingSessions` — Sesiones de respiración
- `waterEntries` — Registros de hidratación
- `movementEntries` — Registros de movimiento
- `positiveResetEntries` — Reinicios positivos
- `eveningReflections` — Cierres nocturnos
- `dailyStatus` — Estado consolidado del día
- `customCategories` — Categorías personalizadas

## Etapas de Implementación

### FASE 1 — Base (Actual)
- [x] Inicialización Next.js
- [ ] Configuración TypeScript estricta
- [ ] Estructura de carpetas
- [ ] Tema visual (Tailwind + dark mode)
- [ ] Layout principal y navegación inferior
- [ ] IndexedDB con Dexie
- [ ] Tipos TypeScript
- [ ] Configuración PWA

### FASE 2 — Pantalla Hoy
- [ ] DailyGreeting
- [ ] BreathingTimer
- [ ] WoopForm
- [ ] PrioritiesSection (3 prioridades)
- [ ] WaterTracker
- [ ] MovementTracker
- [ ] RoutineStatusBadge

### FASE 3 — Enfoque
- [ ] FocusTimer (con timestamps para persistencia)
- [ ] FocusInterruptions
- [ ] QuickNotes
- [ ] ActiveRecallForm
- [ ] Post-bloque review

### FASE 4 — Bienestar
- [ ] PositiveResetModal (botón flotante)
- [ ] MinimalRoutineMode
- [ ] EveningReflectionForm
- [ ] Integración primera acción día siguiente

### FASE 5 — Datos
- [ ] WeeklyChart (Recharts)
- [ ] ActivityCalendar
- [ ] HistorialPage
- [ ] Exportar JSON/CSV
- [ ] Importar JSON

### FASE 6 — Cierre
- [ ] Accesibilidad completa
- [ ] Pruebas unitarias (Vitest)
- [ ] Prueba E2E básica
- [ ] Optimización
- [ ] README final

## Principios de diseño
- Mobile-first, mínimo 44px en áreas táctiles
- Colores calmantes: blues/indigos suaves con modo oscuro
- Sin gamificación agresiva ni mensajes culpabilizantes
- Animaciones discretas (respeta prefers-reduced-motion)
- Navegación inferior fija en móvil
