import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { colors } from '@/src/theme/colors';
import { monthsRemaining, paidPercent, remainingBalance } from '@/src/utils/finance';
import { formatMoney } from '@/src/utils/money';

export default function CreditosScreen() {
  const { state } = useStore();

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {state.credits.length === 0 ? (
          <EmptyState title="Sin créditos registrados" subtitle="Aquí aparecerán tus créditos y su saldo restante." />
        ) : (
          state.credits.map((c) => {
            const remaining = remainingBalance(c);
            const pct = paidPercent(c);
            const months = monthsRemaining(c);
            return (
              <Card key={c.id} style={styles.card}>
                <View style={styles.top}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{c.name}</Text>
                    <Text style={styles.kind}>
                      {c.kind} · {c.rate}% anual · {c.termMonths} meses
                    </Text>
                  </View>
                  <Text style={styles.remaining}>{formatMoney(remaining, state.currency)}</Text>
                </View>
                <View style={styles.progress}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <View style={styles.footRow}>
                  <Text style={styles.foot}>{pct.toFixed(1)}% liquidado</Text>
                  <Text style={styles.foot}>{months} meses restantes</Text>
                </View>
                <View style={styles.footRow}>
                  <Text style={styles.foot}>Monto original: {formatMoney(c.principal, state.currency)}</Text>
                  <Text style={styles.foot}>Inicio: {c.startDate}</Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  card: { padding: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  name: { fontWeight: '800', fontSize: 16, color: colors.ink },
  kind: { fontSize: 12, color: colors.muted, marginTop: 2 },
  remaining: { fontWeight: '900', fontSize: 16, color: colors.expenseText },
  progress: { height: 9, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 12, backgroundColor: colors.brand },
  footRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  foot: { fontSize: 12, color: colors.muted },
});
