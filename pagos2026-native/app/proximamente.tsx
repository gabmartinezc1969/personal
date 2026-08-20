import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/src/theme/colors';

export default function ProximamenteScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ title: title || 'Próximamente' }} />
      <View style={styles.body}>
        <Text style={styles.icon}>🚧</Text>
        <Text style={styles.title}>{title || 'Este módulo'} está en camino</Text>
        <Text style={styles.subtitle}>Este módulo del centro financiero llega en una próxima entrega, igual que hicimos con Mis Gastos Pro.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: 'center' },
});
