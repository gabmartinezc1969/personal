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

# Galería de Fotos Local y Remota (`galeria-fotos.html`)

Galería de fotos en un solo archivo HTML, sin backend propio ni dependencias
externas. Muestra en cuadrícula las fotos de una carpeta, con vista a
pantalla completa y organización por carpeta o por fecha. Tiene dos modos de
uso:

- **Local** — elegís una carpeta de tu computadora (o una unidad de red ya
  mapeada) y el propio navegador lee las fotos directamente. Solo funciona
  en el dispositivo donde abrís el archivo.
- **Servidor remoto (HTTP)** — te conectás a una carpeta servida por HTTP
  (por ejemplo, tu NAS) y podés ver tus fotos **desde cualquier lugar**,
  siempre que tu dispositivo tenga una forma segura de llegar a esa
  dirección (recomendado: una VPN personal como Tailscale).

**Nota:** este entorno de ejecución en la nube no tiene acceso a direcciones
IP privadas (como `192.168.68.108`), por lo que no fue posible conectarse
directamente a esa unidad para inspeccionar dónde guarda las fotos. Por eso
la app está diseñada para que sea tu propio navegador el que hable
directamente con tu NAS, ya sea en tu red local o a través de una VPN.

## Modo 1: carpeta local

1. Descarga `galeria-fotos.html` y ábrelo con doble clic en Chrome o Edge
   (recomendado por su soporte completo de selección de carpetas).
2. Si tus fotos están en el NAS de `192.168.68.108`, primero mapealo como
   unidad o carpeta local:
   - **Windows:** Explorador de archivos → "Conectar a unidad de red" →
     `\\192.168.68.108\<carpeta_compartida>`.
   - **macOS:** Finder → Ir → Conectarse al servidor → `smb://192.168.68.108`.
   - **Linux:** montá el recurso compartido (SMB/NFS/WebDAV) con tu gestor de
     archivos o `mount`.
3. En la app, hacé clic en **"Elegir carpeta…"** y seleccioná la carpeta de
   fotos (local o la unidad de red ya montada). También podés arrastrar y
   soltar una carpeta o fotos sueltas sobre la ventana.

Este modo solo funciona en el dispositivo/red desde donde se accede a la
carpeta — no sirve para verlas desde fuera de casa a menos que mapees la
unidad a través de una VPN (ver Modo 2, que es más práctico para eso,
especialmente en celular).

## Modo 2: servidor remoto — ver tus fotos desde cualquier lugar

Esto te permite abrir la galería en tu celular o laptop **fuera de tu red
local** y seguir viendo las fotos que están en tu NAS, sin subirlas a ningún
servicio de terceros. Requiere dos cosas: (A) una forma segura de llegar a tu
NAS desde afuera, y (B) que el NAS sirva la carpeta de fotos por HTTP con un
listado de directorio.

### A. Conectividad remota segura con Tailscale (recomendado)

[Tailscale](https://tailscale.com) crea una red privada (VPN mesh, basada en
WireGuard) entre tus dispositivos, gratis para uso personal. Con esto, tu NAS
es alcanzable por su IP/nombre de Tailscale desde cualquier lugar del mundo,
sin abrir puertos en tu router ni exponer nada a internet público.

1. Creá una cuenta en https://tailscale.com y instalá Tailscale en el NAS:
   - Si es **TrueNAS SCALE**: instalalo como app desde el catálogo de Apps, o
     como contenedor Docker/Incus con acceso a la red del host.
   - Si es **Synology**: hay un paquete de Tailscale disponible para DSM
     (Package Center → buscar "Tailscale", o instalación manual del `.spk`).
   - Si es Linux genérico: `curl -fsSL https://tailscale.com/install.sh | sh`
     y luego `sudo tailscale up`.
2. Instalá la app de Tailscale en tu celular/laptop (iOS, Android, Windows,
   macOS, Linux) e iniciá sesión con la misma cuenta.
3. Anotá el nombre o la IP de Tailscale que le asignó al NAS (algo como
   `mi-nas.tailXXXX.ts.net` o `100.x.x.x`) — se ve en la app de Tailscale o en
   https://login.tailscale.com/admin/machines.
4. Con Tailscale activo en ambos dispositivos, el NAS es alcanzable como si
   estuvieras en casa, estés donde estés.

### B. Servir la carpeta de fotos por HTTP

La app necesita una URL que devuelva un **listado de carpeta** (autoindex).
Elegí la opción que tenga tu NAS:

- **Synology (DSM):** Panel de Control → Servicios de archivos → habilitar
  WebDAV, o usar "Web Station" apuntando a una carpeta compartida con
  "Listado de directorio" habilitado.
- **TrueNAS SCALE:** instalá una app simple desde el catálogo (por ejemplo
  un contenedor `nginx` o `httpd` con la carpeta de fotos montada como
  volumen de solo lectura y `autoindex on;`), o corré un contenedor mínimo
  con `python3 -m http.server` apuntando a la carpeta.
- **Cualquier Linux/NAS con acceso SSH:** desde la carpeta de fotos, corré:
  ```bash
  python3 -m http.server 8080
  ```
  (dejalo corriendo como servicio/`systemd` si querés que sea permanente).
- **Opción más completa:** si tu NAS soporta contenedores, `nginx` con
  `autoindex on;` sirviendo la carpeta como solo-lectura es una alternativa
  liviana y estable a largo plazo.

Por seguridad, protegé ese servidor con usuario/contraseña (Basic Auth) y
asegurate de que **solo sea alcanzable a través de la VPN de Tailscale**, no
expuesto directamente a internet (no hagas port-forwarding de ese puerto en
tu router).

Opcionalmente, copiá `galeria-fotos.html` dentro de esa misma carpeta
servida — así podés abrir la galería directamente en
`http://<nombre-tailscale>:8080/galeria-fotos.html` desde cualquier
dispositivo conectado a la VPN, sin tener que distribuir el archivo aparte.

### C. Conectar la app

1. Abrí `galeria-fotos.html` (localmente o vía la URL del paso anterior).
2. Hacé clic en **"Servidor remoto (HTTP)…"**.
3. Pegá la URL de la carpeta, por ejemplo:
   `http://mi-nas.tailXXXX.ts.net:8080/Fotos/`
4. Hacé clic en **"Conectar"**. Si el servidor pide usuario/contraseña, el
   navegador te lo va a pedir de forma nativa la primera vez.
5. La app recorre las subcarpetas, arma la cuadrícula y va completando las
   fechas (EXIF o fecha del servidor) en segundo plano.

## Qué incluye

- **Cuadrícula de miniaturas** con carga diferida (`lazy loading`).
- **Vista de tamaño completo** (lightbox) con navegación por teclado.
- **Organización por carpeta** (según la estructura real de archivos) y
  **por fecha** (fecha EXIF de la foto cuando está disponible; si no, la
  fecha de modificación del archivo o la fecha reportada por el servidor).
- **Búsqueda por nombre** y orden por fecha o nombre.
- Carga por carpeta completa, por archivos sueltos, arrastrando y soltando,
  o conectándose a un servidor HTTP remoto (funciona con Apache, nginx,
  Caddy, WebDAV, `python3 -m http.server`, etc. — cualquier servidor que
  devuelva un listado de directorio con enlaces `<a href>`).
- En modo local, las fotos nunca salen de tu computadora ni se suben a
  ningún servidor. En modo remoto, viajan únicamente entre tu navegador y tu
  propio servidor (idealmente a través de tu VPN personal) — nunca pasan por
  servicios de terceros.
