# Rumbo

Aplicación de productividad personal y en equipo (estilo Any.do), implementada
como referencia **clean-room** a partir de la especificación técnica
*"Especificación técnica modular para una plataforma tipo Any.do"* (RFC v1.0).

Dos entregables en este repositorio:

| Carpeta / archivo | Qué es |
|---|---|
| `rumbo.html` | Versión web en un solo archivo (abrir con doble clic, sin instalación) |
| `rumbo-native/` | **App móvil React Native** (Expo + TypeScript) para iOS/Android — ver [su README](rumbo-native/README.md) |

## Cómo usarla

`rumbo.html` es un archivo único, autocontenido y sin dependencias externas ni
backend. Para usarla:

1. Descarga `rumbo.html`.
2. Ábrelo con doble clic en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
3. Todo se guarda localmente en el navegador (`localStorage`). No requiere conexión a internet ni instalación.

## Qué incluye

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

## Licencia / marca

Nombre, interfaz y estructura de datos son propios de esta implementación
(sin código, textos, marca ni interfaz de terceros).
