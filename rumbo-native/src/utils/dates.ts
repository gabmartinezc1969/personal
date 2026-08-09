import { Recurrence, RecFreq } from '../types/models';

export const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return isoDate(new Date());
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function fmtDateHuman(s: string | null): string {
  if (!s) return '';
  const d = parseISODate(s);
  const t = parseISODate(todayISO());
  const diffDays = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  if (diffDays > 1 && diffDays < 7) {
    const wd = d.toLocaleDateString('es-ES', { weekday: 'short' });
    return wd.replace('.', '');
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function fmtDateLong(s: string): string {
  const d = parseISODate(s);
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function fmtTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'p. m.' : 'a. m.';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
}

export function fmtDuration(sec: number): string {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export function isOverdue(dueDate: string | null, dueTime: string | null, status: string): boolean {
  if (!dueDate || status !== 'open') return false;
  const today = todayISO();
  if (dueDate < today) return true;
  if (dueDate === today && dueTime) {
    const now = new Date();
    const [h, m] = dueTime.split(':').map(Number);
    return h * 60 + m < now.getHours() * 60 + now.getMinutes();
  }
  return false;
}

export function isDueToday(dueDate: string | null): boolean {
  return dueDate === todayISO();
}

export function dueInstant(dueDate: string, dueTime: string | null): Date {
  return new Date(dueDate + 'T' + (dueTime || '23:59') + ':00');
}

/* ---------- Recurrencia (subconjunto simplificado de RRULE) ---------- */
export function nextOccurrenceDate(dateStr: string, rec: Recurrence): string | null {
  if (!dateStr || !rec || rec.freq === 'none') return null;
  let d = parseISODate(dateStr);
  const interval = Math.max(1, rec.interval || 1);
  switch (rec.freq) {
    case 'daily':
      d.setDate(d.getDate() + interval);
      break;
    case 'weekdays': {
      do {
        d.setDate(d.getDate() + 1);
      } while (d.getDay() === 0 || d.getDay() === 6);
      break;
    }
    case 'weekly':
      d.setDate(d.getDate() + 7 * interval);
      break;
    case 'custom': {
      const days = rec.byweekday && rec.byweekday.length ? [...rec.byweekday].sort((a, b) => a - b) : [d.getDay()];
      let found: Date | null = null;
      for (let i = 1; i <= 21; i++) {
        const cand = new Date(d);
        cand.setDate(d.getDate() + i);
        if (days.includes(cand.getDay())) {
          found = cand;
          break;
        }
      }
      d = found || d;
      break;
    }
    case 'monthly': {
      const day = d.getDate();
      const total = d.getMonth() + interval;
      const y = d.getFullYear() + Math.floor(total / 12);
      const m = ((total % 12) + 12) % 12;
      const lastDay = new Date(y, m + 1, 0).getDate();
      d = new Date(y, m, Math.min(day, lastDay));
      break;
    }
    case 'yearly': {
      const y = d.getFullYear() + interval;
      const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
      d = new Date(y, d.getMonth(), Math.min(d.getDate(), lastDay));
      break;
    }
    default:
      return null;
  }
  const next = isoDate(d);
  if (rec.until && next > rec.until) return null;
  return next;
}

export const FREQ_LABELS: Record<RecFreq, string> = {
  none: 'No se repite',
  daily: 'Cada día',
  weekdays: 'Días laborables',
  weekly: 'Cada semana',
  monthly: 'Cada mes',
  yearly: 'Cada año',
  custom: 'Días personalizados',
};

export function recurrenceLabel(rec: Recurrence): string | null {
  if (!rec || rec.freq === 'none') return null;
  let base = FREQ_LABELS[rec.freq];
  if (rec.freq === 'custom' && rec.byweekday && rec.byweekday.length) {
    base = 'Cada ' + [...rec.byweekday].sort().map((d) => WEEKDAYS[d]).join(', ');
  } else if ((rec.freq === 'daily' || rec.freq === 'weekly') && rec.interval > 1) {
    base = rec.freq === 'daily' ? `Cada ${rec.interval} días` : `Cada ${rec.interval} semanas`;
  }
  return base;
}
