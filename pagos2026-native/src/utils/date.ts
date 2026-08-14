// Todas las fechas se manejan como cadenas locales `YYYY-MM-DD` / `YYYY-MM`,
// evitando toISOString() (que desplaza a UTC y puede cambiar el día).

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function today(): string {
  return toDateKey(new Date());
}

export function currentMonthKey(): string {
  return toMonthKey(new Date());
}

export type Option<T = string> = { value: T; label: string };

const MONTH_LABELS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function monthLabel(year: number, monthIdx0: number): string {
  return `${MONTH_LABELS[monthIdx0]} ${year}`;
}

// Todos los meses entre la fecha más antigua y la más reciente de `dates`
// (más un colchón de 2 meses hacia adelante para poder capturar movimientos
// futuros), del más reciente al más antiguo.
export function monthOptionsFromDates(dates: string[]): Option[] {
  if (!dates.length) return [{ value: currentMonthKey(), label: monthLabel(new Date().getFullYear(), new Date().getMonth()) }];
  const sorted = [...dates].sort();
  const [minY, minM] = sorted[0].split('-').map(Number);
  const now = new Date();
  const bufferEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const [maxY, maxM] = sorted[sorted.length - 1].split('-').map(Number);
  const dataEnd = new Date(maxY, maxM - 1, 1);
  const end = dataEnd > bufferEnd ? dataEnd : bufferEnd;
  const start = new Date(minY, minM - 1, 1);
  const out: Option[] = [];
  const cursor = new Date(end);
  while (cursor >= start) {
    out.push({ value: toMonthKey(cursor), label: monthLabel(cursor.getFullYear(), cursor.getMonth()) });
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return out;
}

export function yearsFromDates(dates: string[]): string[] {
  const years = new Set(dates.map((d) => d.slice(0, 4)));
  return [...years].sort((a, b) => Number(b) - Number(a));
}

// El mes más reciente con al menos un movimiento con monto real distinto de
// cero (igual que `latestActualMonth()` en la versión web: excluye tanto
// null como 0, porque un monto en $0 normalmente significa "aún no pagado",
// no "ya ocurrió"); si no hay ninguno, el mes calendario actual.
export function latestActualMonthKey(rows: { date: string; actual: number | null }[]): string {
  const withActual = rows.filter((r) => r.actual !== null && r.actual !== 0).map((r) => r.date.slice(0, 7));
  if (!withActual.length) return currentMonthKey();
  return withActual.sort().at(-1)!;
}

export function dayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1, 12);
  const label = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1, 12);
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
