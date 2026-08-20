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

export function monthOptions(count = 24): Option[] {
  const now = new Date();
  const out: Option[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: toMonthKey(d),
      label: new Intl.DateTimeFormat('es-MX', { month: '2-digit', year: 'numeric' }).format(d),
    });
  }
  return out;
}

export function analysisPeriodValues(range: 'month' | 'year'): Option[] {
  const now = new Date();
  const out: Option[] = [];
  if (range === 'month') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({
        value: toMonthKey(d),
        label: i === 0 ? 'Este mes' : i === 1 ? 'El mes pasado' : new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' }).format(d),
      });
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const y = now.getFullYear() - i;
      out.push({ value: String(y), label: String(y) });
    }
  }
  return out;
}

export function dayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1, 12);
  const label = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
