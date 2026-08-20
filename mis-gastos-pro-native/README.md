# Mis Gastos Pro (React Native)

App móvil de finanzas personales — registro de gastos/ingresos, análisis por
categoría, presupuestos y respaldo de datos. Puerto **clean-room** de la
versión web de un solo archivo (`mis-gastos-pro.html`) a **Expo SDK 54 +
React Native 0.81 + expo-router + TypeScript**, con el mismo modelo de datos,
la misma paleta amarilla y el mismo flujo de uso.

## Ejecutar

```bash
cd mis-gastos-pro-native
npm install
npm start          # abre el dev server de Expo
# escanea el QR con la app Expo Go (iOS/Android), o:
npm run android    # emulador Android
npm run ios        # simulador iOS (requiere macOS)
npm run web        # versión web (react-native-web)
```

## Funcionalidad

| Pantalla | Qué hace |
|---|---|
| **Registros** (tab, `/`) | Selector de periodo (24 meses), totales de gastos/ingresos del mes, buscador por categoría/nota/cuenta, lista agrupada por día con borrado por movimiento, exportar CSV del mes |
| **Cuadro** (tab, `/analytics`) | Análisis de Gastos/Ingresos por Mes o Año, gráfico de dona (SVG), leyenda con porcentajes y ranking de categorías con barra de progreso |
| **Informes** (tab, `/reports`) | Anillo de presupuesto mensual global (disponible/gastado), presupuestos por categoría con barra de progreso (ámbar >80%, rojo si se excede) |
| **Yo** (tab, `/profile`) | Moneda (MXN/USD/EUR), plantilla de categorías, respaldo/restauración en JSON, reinicio de datos |
| **Agregar movimiento** (sheet global) | Se abre desde el botón "+" central de la barra inferior, el header o el resumen; alterna Gasto/Ingreso, cuadrícula de categorías (toque largo para editar), calculadora con memorándum, fecha y cuenta |
| **Plantilla de categorías** (`/categories`, modal) | Lista completa de categorías por tipo, crear/editar nombre, icono, color y tipo |

- **Persistencia:** `@react-native-async-storage/async-storage` (offline-first,
  todo local en el dispositivo). La forma del estado (`currency`, `categories`,
  `transactions`, `globalBudget`, `budgets`) es la misma que la versión web,
  así que un respaldo JSON exportado desde una es legible por la otra.
- **Calculadora:** Hermes (el motor JS de React Native) no soporta
  `eval()`/`new Function()`, así que el evaluador de expresiones de la
  versión web se reescribió como un parser recursivo propio
  (`src/utils/calc.ts`) que soporta `+ − × ÷` y paréntesis.
- **Gráficos:** dona de categorías y anillo de presupuesto dibujados con
  `react-native-svg` (sin `<canvas>`, que no existe en RN).
- **Exportar/Importar:** CSV e JSON se escriben con `expo-file-system` y se
  comparten con la hoja nativa (`expo-sharing`); la restauración usa
  `expo-document-picker`.
- **Tema:** claro fijo, misma paleta amarilla (`#FFD93D`) que la versión web.
  No se implementó modo oscuro porque el original tampoco lo tiene.
- Los presupuestos y el resumen de "Informes" siempre reflejan el **mes
  calendario actual** (en la web dependen del selector de "Registros",
  compartido en la misma página; aquí cada pantalla es independiente).

## Estructura

```
app/                     # rutas (expo-router)
  (tabs)/                # Registros, Cuadro, Informes, Yo (+ FAB central)
  categories.tsx          # plantilla de categorías (modal)
  _layout.tsx              # StoreProvider + UIProvider + ToastProvider + sheet global de "Agregar"
src/
  state/
    store.tsx             # StoreProvider (Context + AsyncStorage), acciones sobre el estado
    ui.tsx                 # abrir/cerrar el sheet global de "Agregar movimiento"
    toast.tsx              # mensajes flotantes no bloqueantes
    seed.ts                 # categorías por defecto (idénticas a la versión web)
    types.ts                 # modelo de dominio tipado
  components/              # CategoryModal, BudgetModal, TransactionEditorModal, DonutChart, RingProgress…
  theme/colors.ts           # paleta amarilla compartida
  utils/                     # fechas, dinero, calculadora, CSV, archivos
```
