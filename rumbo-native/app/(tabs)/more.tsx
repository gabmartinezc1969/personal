import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Card } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';

const ITEMS: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; route: string }[] = [
  { icon: 'people-outline', title: 'Espacios', sub: 'Tableros compartidos y miembros', route: '/spaces' },
  { icon: 'bar-chart-outline', title: 'Informes', sub: 'Completadas, atrasos y tiempo', route: '/reports' },
  { icon: 'trash-outline', title: 'Papelera', sub: 'Restaurar tareas y tarjetas eliminadas', route: '/trash' },
  { icon: 'settings-outline', title: 'Ajustes', sub: 'Tema, notificaciones, perfil y datos', route: '/settings' },
  { icon: 'information-circle-outline', title: 'Arquitectura', sub: 'Cobertura frente a la especificación técnica', route: '/about' },
];

export default function MoreScreen() {
  const { state } = useStore();
  const { colors } = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {ITEMS.map((it) => (
          <Card key={it.route} onPress={() => router.push(it.route as never)} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name={it.icon} size={22} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text }}>{it.title}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 12.5 }}>{it.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </Card>
        ))}
        <Text style={{ color: colors.textFaint, fontSize: 11.5, textAlign: 'center', marginTop: 16 }}>
          Rumbo · datos locales en este dispositivo · hola, {state.user.name}
        </Text>
      </ScrollView>
    </Screen>
  );
}
