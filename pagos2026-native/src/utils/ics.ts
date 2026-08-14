// Genera un archivo .ics con un evento de todo el día por cada pago
// pendiente, más una alarma un día antes — igual que el botón "Enviar a
// Google Calendar" de la versión web.
export type IcsEvent = { id: string; date: string; title: string; amount: string };

function toIcsDate(dateKey: string): string {
  return dateKey.replaceAll('-', '');
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\,;]/g, (c) => '\\' + c);
}

export function buildIcs(events: IcsEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pagos 2026//ES', 'CALSCALE:GREGORIAN'];
  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}@pagos2026`,
      `DTSTAMP:${toIcsDate(ev.date)}T000000Z`,
      `DTSTART;VALUE=DATE:${toIcsDate(ev.date)}`,
      `SUMMARY:${escapeIcsText(ev.title)} — ${escapeIcsText(ev.amount)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio de pago',
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
