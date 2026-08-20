import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Card } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { colors } from '@/src/theme/colors';

const READY_ITEMS = [
  { icon: '🔔', title: 'Recordatorios de pago', subtitle: 'Pagos presupuestados aún sin registrar', route: '/recordatorios' as const },
  { icon: '📊', title: 'Resumen mensual', subtitle: 'Ingresos y egresos por categoría del mes', route: '/resumen' as const },
  { icon: '🏦', title: 'Créditos y deudas', subtitle: 'Saldo restante y avance de tus créditos', route: '/creditos' as const },
  { icon: '📈', title: 'Inversiones', subtitle: 'Capital aportado y valor actual', route: '/inversiones' as const },
];

const SOON_ITEMS = [
  { icon: '🔁', title: 'Suscripciones' },
  { icon: '🏠', title: 'Patrimonio y score' },
  { icon: '⚠️', title: 'Alertas' },
  { icon: '📅', title: 'Dashboard anual' },
  { icon: '🧮', title: 'Matriz anual' },
  { icon: '🖥️', title: 'Mi dashboard' },
];

export default function MasScreen() {
  const { state } = useStore();
  const pendingCount = state.movements.filter((m) => m.type === 'E' && m.budgeted > 0 && (m.actual === null || m.actual === 0)).length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Más" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Módulos</Text>
        <Card style={{ paddingHorizontal: 6 }}>
          {READY_ITEMS.map((item, i) => (
            <Pressable key={item.title} style={[styles.row, i === READY_ITEMS.length - 1 && { borderBottomWidth: 0 }]} onPress={() => router.push(item.route)}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>
              {item.route === '/recordatorios' && pendingCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              ) : null}
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </Card>

        <Text style={styles.sectionLabel}>Próximamente</Text>
        <Card style={{ paddingHorizontal: 6 }}>
          {SOON_ITEMS.map((item, i) => (
            <Pressable
              key={item.title}
              style={[styles.row, i === SOON_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => router.push({ pathname: '/proximamente', params: { title: item.title } })}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </Card>

        <Text style={styles.sectionLabel}>Ajustes</Text>
        <Card style={{ paddingHorizontal: 6 }}>
          <Pressable style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => router.push('/configuracion')}>
            <Text style={styles.rowIcon}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Configuración</Text>
              <Text style={styles.rowSubtitle}>Moneda, tamaño de letra, respaldo</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowIcon: { fontSize: 22 },
  rowTitle: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  rowSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.muted },
  badge: { backgroundColor: colors.warn, borderRadius: 999, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
});
