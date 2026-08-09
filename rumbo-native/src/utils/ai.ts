// Asistencia de IA heurística local (AI-01 simplificado). Ninguna subtarea se
// añade automáticamente: la pantalla que use esto siempre exige aceptar/rechazar.

const AI_BREAKDOWNS: { kw: string[]; subs: string[] }[] = [
  { kw: ['viaje', 'vacaciones', 'trip'], subs: ['Definir destino y fechas', 'Reservar transporte', 'Reservar alojamiento', 'Preparar itinerario', 'Hacer maleta'] },
  { kw: ['boda', 'wedding'], subs: ['Definir lista de invitados', 'Reservar salón', 'Contratar catering', 'Elegir vestuario', 'Enviar invitaciones'] },
  { kw: ['mudanza', 'mudarse'], subs: ['Cotizar empresa de mudanza', 'Empacar por habitación', 'Actualizar dirección', 'Contratar servicios en nuevo domicilio'] },
  { kw: ['presentacion', 'presentación', 'propuesta'], subs: ['Definir estructura', 'Reunir datos y evidencia', 'Diseñar diapositivas', 'Ensayar exposición'] },
  { kw: ['evento', 'fiesta'], subs: ['Definir invitados', 'Reservar lugar', 'Planear comida y bebida', 'Enviar invitaciones'] },
  { kw: ['lanzamiento', 'producto'], subs: ['Definir alcance', 'Coordinar con equipo', 'Preparar comunicación', 'Revisar checklist final'] },
];

export function aiSuggestSubtasks(title: string): string[] {
  const t = title.toLowerCase();
  for (const b of AI_BREAKDOWNS) {
    if (b.kw.some((k) => t.includes(k))) return b.subs;
  }
  return ['Planificar', 'Preparar lo necesario', 'Ejecutar', 'Revisar y cerrar'];
}
