# Apps personales

Este repositorio reúne varias apps personales de un solo archivo HTML, cada
una con su contraparte como app móvil React Native (Expo + TypeScript).

| App | Web (un solo archivo) | Móvil (React Native) |
|---|---|---|
| **Rumbo** — productividad personal y en equipo (estilo Any.do) | [`rumbo.html`](rumbo.html) | [`rumbo-native/`](rumbo-native/README.md) |
| **Mis Gastos Pro** — finanzas personales (gastos, ingresos, presupuestos) | [`mis-gastos-pro.html`](mis-gastos-pro.html) | [`mis-gastos-pro-native/`](mis-gastos-pro-native/README.md) |

## Rumbo

Aplicación de productividad personal y en equipo (estilo Any.do), implementada
como referencia **clean-room** a partir de la especificación técnica
*"Especificación técnica modular para una plataforma tipo Any.do"* (RFC v1.0).

Dos entregables en este repositorio:

| Carpeta / archivo | Qué es |
|---|---|
| `rumbo.html` | Versión web en un solo archivo (abrir con doble clic, sin instalación) |
| `rumbo-native/` | **App móvil React Native** (Expo + TypeScript) para iOS/Android — ver [su README](rumbo-native/README.md) |

### Cómo usarla

`rumbo.html` es un archivo único, autocontenido y sin dependencias externas ni
backend. Para usarla:

1. Descarga `rumbo.html`.
2. Ábrelo con doble clic en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
3. Todo se guarda localmente en el navegador (`localStorage`). No requiere conexión a internet ni instalación.

### Qué incluye

- **Mi Día** — selección diaria, fijados y sugerencias por vencimiento.
- **Listas y tareas** — subtareas, notas, prioridad, etiquetas, adjuntos, recurrencia (diaria, semanal, mensual, anual, días personalizados) y recordatorios.
- **Calendario** — vista mensual unificada de tareas y tarjetas de tablero.
- **Compras inteligentes** — categorización automática por pasillo.
- **Espacios y tableros Kanban** — secciones, checklist, asignados, comentarios, actividad y automatizaciones simples.
- **Seguimiento de tiempo**, **informes**, **búsqueda global** (Ctrl/Cmd+K) y **asistencia de IA heurística local** (sugerencias de subtareas, siempre con aceptación explícita).
- **Exportar / importar** datos en JSON y modo claro/oscuro.

Un panel "Arquitectura" dentro de la app (menú lateral) documenta qué módulos
de la especificación original están implementados por completo en el cliente,
cuáles son versiones simplificadas y cuáles quedan fuera de alcance por
requerir un backend real (identidad multiusuario, facturación, sincronización
multidispositivo, integraciones OAuth, gobierno/auditoría).

## Mis Gastos Pro

App de finanzas personales: registro de gastos e ingresos, análisis por
categoría, presupuestos y respaldo de datos.

| Carpeta / archivo | Qué es |
|---|---|
| `mis-gastos-pro.html` | Versión web en un solo archivo (abrir con doble clic, sin instalación) |
| `mis-gastos-pro-native/` | **App móvil React Native** (Expo + TypeScript) para iOS/Android — ver [su README](mis-gastos-pro-native/README.md) |

### Cómo usarla

`mis-gastos-pro.html` es un archivo único, autocontenido y sin dependencias
externas ni backend. Para usarla:

1. Descarga `mis-gastos-pro.html`.
2. Ábrelo con doble clic en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
3. Todo se guarda localmente en el navegador (`localStorage`). No requiere conexión a internet ni instalación.

### Qué incluye

- **Registros** — periodo mensual, totales de gastos/ingresos, búsqueda y lista agrupada por día, exportar a CSV.
- **Cuadro (análisis)** — gráfico de dona y ranking de categorías por mes o año, para gastos o ingresos.
- **Informes** — presupuesto mensual global con anillo de disponibilidad, y presupuestos por categoría con barra de progreso.
- **Categorías personalizables** — nombre, icono, color y tipo (gasto/ingreso); plantilla inicial de más de 30 categorías.
- **Perfil** — moneda (MXN/USD/EUR), respaldo y restauración en JSON, reinicio de datos.

## Licencia / marca

Nombre, interfaz y estructura de datos son propios de esta implementación
(sin código, textos, marca ni interfaz de terceros).
