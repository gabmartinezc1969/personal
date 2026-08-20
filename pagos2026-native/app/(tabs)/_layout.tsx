import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useUI } from '@/src/state/ui';
import { colors } from '@/src/theme/colors';

export default function TabLayout() {
  const { openEditor } = useUI();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <TabGlyph glyph="⌂" color={color} /> }} />
      <Tabs.Screen name="movimientos" options={{ title: 'Movimientos', tabBarIcon: ({ color }) => <TabGlyph glyph="▤" color={color} /> }} />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => <Fab onPress={() => openEditor('E')} />,
          tabBarButton: (props) => <Pressable {...(props as any)} onPress={() => openEditor('E')} />,
        }}
      />
      <Tabs.Screen name="analisis" options={{ title: 'Análisis', tabBarIcon: ({ color }) => <TabGlyph glyph="◔" color={color} /> }} />
      <Tabs.Screen name="mas" options={{ title: 'Más', tabBarIcon: ({ color }) => <TabGlyph glyph="☰" color={color} /> }} />
    </Tabs>
  );
}

function TabGlyph({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 21, color, marginBottom: 2 }}>{glyph}</Text>;
}

function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.fab}>
      <Text style={styles.fabText}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand,
    borderWidth: 5,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: colors.brand,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: { fontSize: 30, color: colors.onBrand, fontWeight: '600', lineHeight: 34 },
});
