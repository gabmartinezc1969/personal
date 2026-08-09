// Panel "Arquitectura": cobertura de esta app frente al catálogo de módulos del RFC.
import React from 'react';
import { ScrollView, View, Text } from 'react-native';

import { Screen } from '@/src/components/ui';
import { useTheme } from '@/src/theme/useTheme';

type Status = 'full' | 'local' | 'stub';

const MODULE_MAP: { code: string; name: string; status: Status; note: string }[] = [
  { code: 'PERS-01', name: 'Personal Lists', status: 'full', note: 'Listas privadas, color y archivado.' },
  { code: 'CORE-01', name: 'Personal Tasks', status: 'full', note: 'Tareas, subtareas, notas, prioridad y etiquetas.' },
  { code: 'PLAN-01', name: 'Scheduling & Recurrence', status: 'full', note: 'Fecha/hora, recurrencia diaria–personalizada, recordatorios.' },
  { code: 'NTF-01', name: 'Notifications', status: 'local', note: 'Centro in-app + notificaciones locales del sistema (expo-notifications). Sin push/correo remotos.' },
  { code: 'PLAN-02', name: 'My Day', status: 'full', note: 'Selección diaria, fijados y sugerencias por vencimiento.' },
  { code: 'CAL-01', name: 'Calendar', status: 'local', note: 'Vista mensual de tareas propias. Sin cuentas externas.' },
  { code: 'HOME-01', name: 'Smart Grocery', status: 'full', note: 'Lista de compra con categorización automática por pasillo.' },
  { code: 'COL-01', name: 'Spaces & Membership', status: 'local', note: 'Espacios y miembros simulados localmente, sin invitaciones ni auth real.' },
  { code: 'COL-02', name: 'Boards & Views', status: 'full', note: 'Tableros con secciones tipo Kanban, checklist y etiquetas.' },
  { code: 'COL-03', name: 'Activity & Discussion', status: 'full', note: 'Comentarios y feed de actividad por tarjeta (local).' },
  { code: 'DOC-01', name: 'Files', status: 'stub', note: 'Fuera de alcance móvil local: requiere object storage y antivirus.' },
  { code: 'SRCH-01', name: 'Search', status: 'full', note: 'Búsqueda global instantánea sobre datos locales.' },
  { code: 'AUTO-01', name: 'Automations', status: 'local', note: 'Reglas "al mover a sección → acción" por tablero.' },
  { code: 'TIME-01', name: 'Time Tracking', status: 'full', note: 'Un temporizador activo, registros y resumen.' },
  { code: 'FORM-01', name: 'Forms & Intake', status: 'stub', note: 'Fuera de alcance: requiere backend anti-abuso.' },
  { code: 'RPT-01', name: 'Reporting', status: 'full', note: 'Panel de completadas, atrasos y tiempo (datos locales).' },
  { code: 'INT-01', name: 'Integrations Hub', status: 'stub', note: 'Fuera de alcance: OAuth, webhooks y workers de servidor.' },
  { code: 'AI-01', name: 'AI Assistance', status: 'local', note: 'Sugerencias heurísticas con aceptación explícita; sin proveedor externo.' },
  { code: 'PLT-01', name: 'Identity & Tenancy', status: 'stub', note: 'Fuera de alcance: login real, MFA, multi-tenant.' },
  { code: 'PLT-02', name: 'Entitlements & Billing', status: 'stub', note: 'Fuera de alcance: planes, cuotas y cobro.' },
  { code: 'SYNC-01', name: 'Offline Sync', status: 'stub', note: 'La app es local-first, pero no sincroniza entre dispositivos.' },
  { code: 'GOV-01', name: 'Audit, Admin & Privacy', status: 'stub', note: 'Fuera de alcance: auditoría y borrado verificable server-side.' },
];

export default function AboutScreen() {
  const { colors } = useTheme();
  const statusMeta: Record<Status, { label: string; bg: string; fg: string }> = {
    full: { label: 'Completo local', bg: colors.okDim, fg: colors.ok },
    local: { label: 'Simplificado', bg: colors.warnDim, fg: colors.warn },
    stub: { label: 'Fuera de alcance', bg: colors.border, fg: colors.textFaint },
  };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.textDim, fontSize: 13, marginBottom: 14 }}>
          Mapeo de esta app móvil (implementación clean-room) frente al catálogo de módulos de la especificación técnica
          "plataforma tipo Any.do" (RFC v1.0). "Completo local" funciona sin servidor; "Simplificado" es una versión
          reducida; "Fuera de alcance" requiere backend real.
        </Text>
        {MODULE_MAP.map((m) => (
          <View
            key={m.code}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.bgElev,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              marginBottom: 7,
            }}>
            <View style={{ backgroundColor: colors.brandDim, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, width: 68, alignItems: 'center' }}>
              <Text style={{ color: colors.brandStrong, fontWeight: '800', fontSize: 10 }}>{m.code}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: colors.text }}>{m.name}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 11.5 }}>{m.note}</Text>
            </View>
            <View style={{ backgroundColor: statusMeta[m.status].bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
              <Text style={{ color: statusMeta[m.status].fg, fontWeight: '700', fontSize: 10 }}>{statusMeta[m.status].label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
