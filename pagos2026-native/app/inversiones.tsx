import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { colors } from '@/src/theme/colors';
import { formatMoney } from '@/src/utils/money';

export default function InversionesScreen() {
  const { state } = useStore();
  const totalCapital = state.investments.reduce((a, i) => a + i.capital, 0);
  const totalValue = state.investments.reduce((a, i) => a + i.value, 0);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {state.investments.length === 0 ? (
          <EmptyState title="Sin inversiones registradas" subtitle="Aquí aparecerán tus inversiones y su rendimiento." />
        ) : (
          <>
            <Card style={styles.summary}>
              <Text style={styles.summaryLabel}>Valor total</Text>
              <Text style={styles.summaryValue}>{formatMoney(totalValue, state.currency)}</Text>
              <Text style={styles.summarySub}>Capital aportado: {formatMoney(totalCapital, state.currency)}</Text>
            </Card>
            {state.investments.map((inv) => {
              const gain = inv.value - inv.capital;
              const gainPct = inv.capital ? (gain / inv.capital) * 100 : 0;
              return (
                <Card key={inv.id} style={styles.card}>
                  <View style={styles.top}>
                    <Text style={styles.name}>{inv.name}</Text>
                    <Text style={[styles.gain, gain < 0 && { color: colors.expenseText }]}>
                      {gain >= 0 ? '+' : ''}
                      {gainPct.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.footRow}>
                    <Text style={styles.foot}>Capital: {formatMoney(inv.capital, state.currency)}</Text>
                    <Text style={styles.foot}>Valor actual: {formatMoney(inv.value, state.currency)}</Text>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  summary: { padding: 18, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  summaryValue: { fontSize: 26, fontWeight: '900', color: colors.ink, marginTop: 4 },
  summarySub: { fontSize: 12, color: colors.muted, marginTop: 6 },
  card: { padding: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontWeight: '800', fontSize: 16, color: colors.ink },
  gain: { fontWeight: '800', color: colors.incomeText },
  footRow: { flexDirection: 'row', justifyContent: 'space-between' },
  foot: { fontSize: 12, color: colors.muted },
});
