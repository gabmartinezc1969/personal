# Rumbo (React Native)

Aplicación móvil de productividad personal y en equipo (estilo Any.do),
implementación **clean-room** a partir de la especificación técnica
*"Especificación técnica modular para una plataforma tipo Any.do"* (RFC v1.0).
Construida con **Expo SDK 57 + React Native 0.86 + expo-router + TypeScript**.

## Ejecutar

```bash
cd rumbo-native
npm install
npm start          # abre el dev server de Expo
# escanea el QR con la app Expo Go (iOS/Android), o:
npm run android    # emulador Android
npm run ios        # simulador iOS (requiere macOS)
npm run web        # versión web (react-native-web)
```

## Funcionalidad

| Pantalla | Módulos del RFC | Qué hace |
|---|---|---|
| **Mi Día** (pestaña) | PLAN-02 | Selección diaria, sugerencias por vencimiento/atraso, navegación por días |
| **Listas** (pestaña) | PERS-01, CORE-01 | Listas con color, tareas con subtareas/notas/prioridad/etiquetas |
| **Detalle de tarea** | PLAN-01, TIME-01, AI-01 | Fecha/hora (DateTimePicker nativo), recordatorio, recurrencia (diaria→personalizada), temporizador único, sugerencias de subtareas con aceptar/rechazar, convertir a tarjeta |
| **Calendario** (pestaña) | CAL-01 | Vista mensual con indicadores + agenda del día seleccionado |
| **Compras** (pestaña) | HOME-01 | Categorización automática por pasillo, reclasificación manual |
| **Espacios / Tablero** | COL-01/02/03, AUTO-01 | Miembros con rol, secciones tipo Kanban (mover con pulsación larga), checklist, asignados, comentarios, actividad, automatizaciones |
| **Más** | SRCH-01, RPT-01, NTF-01 | Búsqueda global, informes, papelera, notificaciones, ajustes, panel Arquitectura |

- **Persistencia:** AsyncStorage (offline-first, todo local en el dispositivo).
- **Recordatorios:** notificaciones locales del sistema vía `expo-notifications`
  (se programan al fijar fecha+hora+recordatorio; sin servidor de push).
- **Tema:** claro / oscuro / automático, con la misma paleta que la versión web.
- El panel **Arquitectura** (Más → Arquitectura) documenta la cobertura de los
  22 módulos del RFC: qué está completo en local, qué está simplificado y qué
  queda fuera de alcance por requerir backend (identidad, facturación,
  sincronización multidispositivo, integraciones, gobierno).

## Estructura

```
app/                  # rutas (expo-router)
  (tabs)/             # Mi Día, Listas, Calendario, Compras, Más
  task/[id].tsx       # detalle de tarea personal
  board/[id].tsx      # tablero Kanban
  board-task/[id].tsx # detalle de tarjeta
  ...
src/
  state/    # StoreProvider (Context + AsyncStorage), seed, factorías
  types/    # modelo de dominio tipado
  utils/    # fechas/recurrencia, clasificador de compras, IA heurística, notificaciones
  theme/    # paleta clara/oscura y hook useTheme
  components/  # ui.tsx (Chip, Btn, Card…), TaskRow, QuickAdd
```
