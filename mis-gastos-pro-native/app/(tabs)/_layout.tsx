import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useUI } from '@/src/state/ui';
import { colors } from '@/src/theme/colors';

export default function TabLayout() {
  const { openTxEditor } = useUI();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A18200',
        tabBarInactiveTintColor: '#777777',
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Registros', tabBarIcon: ({ color }) => <TabGlyph glyph="▤" color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Cuadro', tabBarIcon: ({ color }) => <TabGlyph glyph="◔" color={color} /> }} />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => <Fab onPress={() => openTxEditor('expense')} />,
          tabBarButton: (props) => <Pressable {...(props as any)} onPress={() => openTxEditor('expense')} />,
        }}
      />
      <Tabs.Screen name="reports" options={{ title: 'Informes', tabBarIcon: ({ color }) => <TabGlyph glyph="▧" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Yo', tabBarIcon: ({ color }) => <TabGlyph glyph="♙" color={color} /> }} />
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
    backgroundColor: colors.yellow2,
    borderWidth: 5,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  fabText: { fontSize: 30, color: colors.ink, fontWeight: '600', lineHeight: 34 },
});
