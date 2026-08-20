# Pagos 2026 (React Native)

App móvil del **Centro Financiero Profesional** — puerto **clean-room** de
`pagos2026.html` (versión web de un solo archivo, con persistencia SQLite
embebida) a **Expo SDK 54 + React Native 0.81 + expo-router + TypeScript**.

La versión web original tiene 15 módulos (Inicio, Mi Dashboard, Resumen
Mensual, Dashboard Anual, Matriz Anual, Ingresos, Gastos, Suscripciones,
Créditos y Deudas, Patrimonio y Score, Inversiones, Alertas, Recordatorios,
Movimientos, Configuración) — un centro financiero completo, no un simple
registro de gastos. Portar los 15 con la misma fidelidad de una sola vez no
era realista, así que esta primera entrega cubre el **núcleo esencial** y el
resto llega módulo por módulo en entregas posteriores (mismo enfoque que se
usó con `mis-gastos-pro-native`).

## Ejecutar

```bash
cd pagos2026-native
npm install
npm start          # abre el dev server de Expo
# escanea el QR con la app Expo Go (iOS/Android), o:
npm run android    # emulador Android
npm run ios        # simulador iOS (requiere macOS)
npm run web        # versión web (react-native-web)
```

## Qué incluye esta entrega

| Pantalla | Qué hace |
|---|---|
| **Inicio** (tab) | Tarjeta azul con saldo del mes, gastos/ingresos, presupuesto ejercido, patrimonio neto (inversiones − deuda) y movimientos recientes |
| **Movimientos** (tab) | Historial completo importado (1,034 registros, 2020–2026), por periodo, con buscador y borrado |
| **Análisis** (tab) | Desglose de Gastos o Ingresos por categoría (mes o año), dona + ranking |
| **Más** (tab) | Accesos a Recordatorios, Resumen mensual, Créditos y deudas, Inversiones (todos funcionales) y a los módulos aún pendientes (marcados "Próximamente"), más Configuración |
| **Agregar movimiento** (sheet global, botón + central) | Formulario: tipo, categoría, concepto, monto presupuestado/real, fecha, método de pago, deducible |
| **Recordatorios de pago** | Gastos presupuestados sin monto real registrado, agrupados por Vencido/Hoy/Próximos 7 días/Próximos 30 días/Más adelante, con "Marcar pagado" y exportación a calendario (.ics) |
| **Resumen mensual** | KPIs del mes (ingresos, egresos, saldo, tasa de ahorro), comparativo vs. mes anterior, presupuesto por categoría con semáforo 🟢🟡🔴, distribución de egresos, tablas de ingresos/egresos por categoría y Top 10 gastos del mes |
| **Créditos y deudas** | Lista de créditos importados con saldo insoluto calculado por amortización estándar (tasa, plazo, fecha de inicio) — verificado contra el snapshot del HTML original ($808,903 de saldo BBVA) |
| **Inversiones** | Lista de inversiones importadas con capital aportado, valor actual y rendimiento % |
| **Configuración** | Moneda, tamaño de letra, respaldo/restauración en JSON, reinicio a los datos originales |

### Pendiente para siguientes entregas

Mi Dashboard, Dashboard Anual, Matriz Anual, Suscripciones, Patrimonio y
Score (con score financiero y liquidez), Alertas. Estos módulos son
accesibles desde **Más** con una pantalla "Próximamente". Dentro de
**Resumen mensual** también quedaron fuera de esta entrega dos gráficas del
original (Evolución diaria del gasto y "De ingresos a ahorro" tipo
waterfall) — el resto del módulo sí está completo.

## Datos importados

El respaldo `pagos2026-data.json` (exportado desde la versión web) se
convirtió a `src/state/seedData.ts` con un script (`scripts` no se incluye
en el repo — es un one-off de conversión). Se normalizaron dos categorías
que eran el mismo concepto con nombre distinto entre años: `Hipoteca` →
`Hipotecario`, `Creditos Mazda` → `Credito Mazda`. También se corrigió un
choque de id entre dos movimientos distintos del respaldo original (bug de
generación de ids de la versión web): al importar, cualquier id repetido se
desambigua con un sufijo (`_dupN`) para que cada movimiento tenga una key
verdaderamente única — importante porque el id se usa para borrar y marcar
como pagado. Todo lo demás se importó tal cual: 1,034 movimientos, 1 crédito
(BBVA Hipotecario) y 1 inversión (Cetes).

- **Persistencia:** `@react-native-async-storage/async-storage`, con la
  misma forma de estado (`movements`, `credits`, `investments`,
  `categories`, `currency`, `fontScale`) para que los respaldos JSON sean
  intercambiables entre entregas.
- **Amortización de créditos:** fórmula estándar de crédito con tasa fija
  (`src/utils/finance.ts`), verificada numéricamente contra los valores del
  HTML original (deuda $808,903, patrimonio neto $1,291,097 con inversiones
  de $2,100,000 al mes de julio 2026).
- **Diseño:** misma dirección visual azul tipo fintech (inspirada en la
  referencia Monifi) que se aplicó a `mis-gastos-pro-native`: tarjeta hero
  azul redondeada, tarjetas con sombra suave, filas planas sin bordes duros.

## Estructura

```
app/
  (tabs)/              # Inicio, Movimientos, Análisis, Más (+ FAB central)
  creditos.tsx           # Créditos y deudas
  inversiones.tsx         # Inversiones
  configuracion.tsx        # Ajustes
  proximamente.tsx          # Placeholder de módulos pendientes
  _layout.tsx                # StoreProvider + UIProvider + ToastProvider + sheet global
src/
  state/
    store.tsx             # StoreProvider (Context + AsyncStorage), acciones sobre el estado
    seed.ts                 # catálogo de categorías + estado por defecto
    seedData.ts              # datos importados del respaldo (generado, no editar a mano)
    types.ts                   # modelo de dominio tipado
  components/               # MovementEditorModal, CategoryModal, DonutChart, RingProgress…
  theme/colors.ts             # paleta azul compartida
  utils/                       # fechas, dinero, amortización de créditos, archivos
```
