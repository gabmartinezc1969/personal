# Guía para el formulario "Seguridad de los datos" (Play Console)

Basado en el código actual de la app: solo usa `@react-native-async-storage/
async-storage` (almacenamiento local) para persistir el estado. No hay
llamadas de red para datos de usuario, ni SDKs de analítica, publicidad,
crash reporting ni backend propio. `expo-updates` solo descarga código de
la app (OTA), no datos del usuario.

Respuestas sugeridas al asistente de Play Console (**App content →
Data safety**):

### 1. "¿Tu app recopila o comparte alguno de los tipos de datos de usuario requeridos?"
→ **No** (la app no recopila datos de usuario)

Si Play Console fuerza a declarar algo por incluir `expo-updates`/EAS
(algunos SDKs de infraestructura pueden marcar "app info and performance"
por diagnósticos técnicos anónimos del propio Expo, no de tus datos
financieros) revisa la documentación de Expo/EAS Update vigente al momento
de publicar por si aplica declarar "Diagnostics" como dato recopilado por
el SDK, no por tu app. Con la configuración actual (sin `Sentry`, sin
`expo-application`'s analytics, sin `Segment`) no debería requerirse.

### 2. "¿Los datos se cifran en tránsito?"
→ No aplica (no hay transmisión de datos de usuario)

### 3. "¿Los usuarios pueden solicitar que se eliminen sus datos?"
→ **Sí** — el usuario controla y elimina sus propios datos en cualquier
momento desde la app misma (Yo → Zona de peligro → Reiniciar aplicación),
o desinstalando la app.

### 4. Categorías de datos a marcar como "No recopilados"
- Ubicación
- Información personal (nombre, correo, ID, etc.)
- Información financiera (aunque el usuario *ingresa* montos y categorías
  de gasto, estos nunca salen del dispositivo — no se "recopilan" en el
  sentido de Play Console, que se refiere a datos transmitidos fuera del
  dispositivo)
- Mensajes
- Fotos y videos
- Audio
- Archivos y documentos (el respaldo JSON lo genera y controla el propio
  usuario; la app no lo sube a ningún servidor)
- Actividad en la app / datos de uso
- Identificadores del dispositivo o de otro tipo

### 5. Prácticas de seguridad
- Marca que los datos NO se comparten con terceros.
- Marca que no hay proceso de solicitud de eliminación de cuenta (no hay
  cuentas).

---

**Importante:** este formulario lo debe llenar el titular de la cuenta de
Play Console directamente (requiere confirmar bajo su responsabilidad legal
que la declaración es exacta). Este documento es una guía de referencia,
no un envío automático.
