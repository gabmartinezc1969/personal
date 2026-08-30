# Rumbo

Aplicación de productividad personal y en equipo (estilo Any.do), implementada
como referencia **clean-room** a partir de la especificación técnica
*"Especificación técnica modular para una plataforma tipo Any.do"* (RFC v1.0).

Dos entregables en este repositorio:

| Carpeta / archivo | Qué es |
|---|---|
| `rumbo.html` | Versión web en un solo archivo (abrir con doble clic, sin instalación) |
| `rumbo-native/` | **App móvil React Native** (Expo + TypeScript) para iOS/Android — ver [su README](rumbo-native/README.md) |
| `galeria-fotos.html` | Galería de fotos local en un solo archivo — ver detalles más abajo |

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

---

# Galería de Fotos Local (`galeria-fotos.html`)

Galería de fotos en un solo archivo HTML, sin backend ni dependencias
externas. Muestra en cuadrícula las fotos de una carpeta local (o de una
unidad de red mapeada como carpeta local, por ejemplo un NAS), con vista a
pantalla completa y organización por carpeta o por fecha.

**Nota importante:** este entorno de ejecución en la nube no tiene acceso a
direcciones IP privadas (como `192.168.68.108`), por lo que no fue posible
conectarse directamente a esa unidad para inspeccionar dónde guarda las
fotos. En su lugar, la app se diseñó para que sea el propio navegador (que sí
corre en tu red local) el que lea las fotos: elegís la carpeta y todo se
procesa en tu máquina.

## Cómo usarla

1. Descarga `galeria-fotos.html` y ábrelo con doble clic en Chrome o Edge
   (recomendado por su soporte completo de selección de carpetas).
2. Si tus fotos están en el NAS/dispositivo de `192.168.68.108`, primero
   mapealo como unidad o carpeta local:
   - **Windows:** Explorador de archivos → "Conectar a unidad de red" →
     `\\192.168.68.108\<carpeta_compartida>`.
   - **macOS:** Finder → Ir → Conectarse al servidor → `smb://192.168.68.108`.
   - **Linux:** montá el recurso compartido (SMB/NFS/WebDAV) con tu gestor de
     archivos o `mount`.
3. En la app, hacé clic en **"Elegir carpeta…"** y seleccioná la carpeta de
   fotos (local o la unidad de red ya montada). También podés arrastrar y
   soltar una carpeta o fotos sueltas sobre la ventana.
4. Usá los botones **"Por carpeta"**, **"Por fecha"** o **"Todas"** para
   organizar la vista, y la barra lateral para filtrar por carpeta/mes.
5. Hacé clic en cualquier miniatura para verla a tamaño completo (flechas o
   ←/→ para navegar, Esc para cerrar).

## Qué incluye

- **Cuadrícula de miniaturas** con carga diferida (`lazy loading`).
- **Vista de tamaño completo** (lightbox) con navegación por teclado.
- **Organización por carpeta** (según la estructura real de archivos) y
  **por fecha** (fecha EXIF de la foto cuando está disponible; si no, la
  fecha de modificación del archivo).
- **Búsqueda por nombre** y orden por fecha o nombre.
- Selección por carpeta completa, por archivos sueltos, o arrastrar y soltar.
- 100% local: las fotos nunca salen de tu computadora ni se suben a ningún
  servidor; no requiere conexión a internet para funcionar.
