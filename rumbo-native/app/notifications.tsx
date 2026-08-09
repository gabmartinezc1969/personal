// NTF-01 (in-app) — centro de notificaciones.
import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';

import { Screen, EmptyState, Btn } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';

export default function NotificationsScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const items = state.notifications.slice(0, 50);
  const hasUnread = items.some((n) => !n.read);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {hasUnread && <Btn label="Marcar todas como leídas" small kind="ghost" onPress={() => actions.markAllNotifRead()} style={{ alignSelf: 'flex-end', marginBottom: 8 }} />}
        {items.length === 0 ? (
          <EmptyState icon="notifications-outline" title="Sin notificaciones" />
        ) : (
          items.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => actions.markNotifRead(n.id)}
              style={{
                padding: 12,
                borderRadius: 16,
                marginBottom: 6,
                backgroundColor: n.read ? colors.bgElev : colors.brandDim,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }}>{n.title}</Text>
              <Text style={{ color: colors.textDim, fontSize: 12.5, marginTop: 2 }}>{n.body}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 10.5, marginTop: 4 }}>
                {new Date(n.at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          ))
        )}
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: colors.textFaint, fontSize: 11.5, textAlign: 'center' }}>
            Los recordatorios con fecha y hora también se programan como notificaciones locales del sistema.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
