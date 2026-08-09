import { todayISO, addDays } from './dates';

// Racha real (no ficticia): días consecutivos con al menos una tarea o
// tarjeta completada, contando hacia atrás desde hoy (o desde ayer si hoy
// todavía no se completó nada, para no romper la racha a mitad del día).
export function computeStreak(completedDates: string[]): number {
  const days = new Set(completedDates.map((d) => d.slice(0, 10)));
  let cursor = todayISO();
  if (!days.has(cursor)) {
    const yesterday = addDays(cursor, -1);
    if (!days.has(yesterday)) return 0;
    cursor = yesterday;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
