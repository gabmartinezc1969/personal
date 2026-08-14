import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { MovementRow } from '@/src/components/MovementRow';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { Card, EmptyState, SectionHead } from '@/src/components/ui';
import { categoryByName, movementAmount, movementsForMonth, totals, useStore } from '@/src/state/store';
import { colors } from '@/src/theme/colors';
import { latestActualMonthKey, monthOptionsFromDates } from '@/src/utils/date';
import { remainingBalance } from '@/src/utils/finance';
import { formatMoney } from '@/src/utils/money';

export default function InicioScreen() {
  const { state } = useStore();
  const options = useMemo(() => monthOptionsFromDates(state.movements.map((m) => m.date)), [state.movements]);
  const [monthKey, setMonthKey] = useState(() => latestActualMonthKey(state.movements));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const monthLabel = options.find((o) => o.value === monthKey)?.label ?? monthKey;
  const monthList = useMemo(() => movementsForMonth(state, monthKey), [state, monthKey]);
  const monthTotals = useMemo(() => totals(monthList), [monthList]);
  const balance = monthTotals.income - monthTotals.expense;

  const monthBudgetExpense = useMemo(() => monthList.filter((m) => m.type === 'E').reduce((a, m) => a + m.budgeted, 0), [monthList]);
  const exercisedPct = monthBudgetExpense ? Math.min(999, (monthTotals.expense / monthBudgetExpense) * 100) : 0;

  const totalDebt = useMemo(() => state.credits.reduce((a, c) => a + remainingBalance(c), 0), [state.credits]);
  const totalInvestments = useMemo(() => state.investments.reduce((a, i) => a + i.value, 0), [state.investments]);
  const netWorth = totalInvestments - totalDebt;

  // "Con monto" = ya ocurrió (igual que la versión web): excluye pendientes
  // (actual null) para que no aparezcan cargos futuros como "recientes".
  const recent = useMemo(
    () =>
      state.movements
        .filter((m) => m.actual !== null && m.actual !== 0)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8),
    [state.movements]
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Pagos 2026" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Pressable style={styles.periodPill} onPress={() => setMonthPickerOpen(true)}>
            <Text style={styles.periodPillText}>{monthLabel}</Text>
            <Text style={styles.periodPillChevron}>⌄</Text>
          </Pressable>

          <Text style={styles.balanceLabel}>Saldo del mes</Text>
          <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(balance, state.currency)}
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <View style={[styles.statIconWrap, styles.statIconExpense]}>
                <Text style={styles.statIcon}>↙</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>Gastos</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  −{formatMoney(monthTotals.expense, state.currency)}
                </Text>
              </View>
            </View>
            <View style={styles.statPill}>
              <View style={[styles.statIconWrap, styles.statIconIncome]}>
                <Text style={styles.statIcon}>↗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>Ingresos</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoney(monthTotals.income, state.currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KpiCard label="Presupuesto ejercido" value={`${exercisedPct.toFixed(0)}%`} sub={`${formatMoney(monthTotals.expense, state.currency)} de ${formatMoney(monthBudgetExpense, state.currency)}`} />
          <KpiCard label="Patrimonio neto" value={formatMoney(netWorth, state.currency)} sub={`Inversiones ${formatMoney(totalInvestments, state.currency)} − deuda ${formatMoney(totalDebt, state.currency)}`} negative={netWorth < 0} />
        </View>

        <SectionHead title="Movimientos recientes" action="Ver todos" onAction={() => router.push('/movimientos')} />
        {recent.length === 0 ? (
          <EmptyState title="Sin movimientos" subtitle="Toca el botón + para comenzar." />
        ) : (
          <Card style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
            {recent.map((m) => {
              const cat = categoryByName(state, m.category);
              const pending = m.actual === null;
              return (
                <View key={m.id} style={styles.recentRow}>
                  <View style={[styles.dot, { backgroundColor: cat.color }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.recentCat} numberOfLines={1}>
                      {cat.name}
                    </Text>
                    <Text style={styles.recentConcept} numberOfLines={1}>
                      {m.concept} · {m.date}
                    </Text>
                  </View>
                  <Text style={[styles.recentAmount, m.type === 'E' ? styles.expense : styles.income, pending && styles.pending]}>
                    {m.type === 'E' ? '−' : '+'}
                    {formatMoney(movementAmount(m), state.currency)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <OptionPickerModal visible={monthPickerOpen} title="Periodo" options={options} selected={monthKey} onSelect={setMonthKey} onClose={() => setMonthPickerOpen(false)} />
    </SafeAreaView>
  );
}

function KpiCard({ label, value, sub, negative }: { label: string; value: string; sub: string; negative?: boolean }) {
  return (
    <Card style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, negative && { color: colors.expenseText }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.kpiSub} numberOfLines={2}>
        {sub}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  hero: {
    backgroundColor: colors.brand,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: colors.brand,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  periodPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  periodPillText: { color: colors.onBrand, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  periodPillChevron: { color: colors.onBrand, fontSize: 13 },
  balanceLabel: { color: colors.heroLabel, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  balanceValue: { color: colors.onBrand, fontSize: 32, fontWeight: '900', marginBottom: 18 },
  statRow: { flexDirection: 'row', gap: 10 },
  statPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 16, padding: 10, minWidth: 0 },
  statIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statIconExpense: { backgroundColor: 'rgba(224,60,68,0.55)' },
  statIconIncome: { backgroundColor: 'rgba(18,183,106,0.55)' },
  statIcon: { color: colors.onBrand, fontSize: 13, fontWeight: '900' },
  statLabel: { color: colors.heroLabel, fontSize: 11, fontWeight: '600' },
  statValue: { color: colors.onBrand, fontSize: 14, fontWeight: '800' },
  kpiGrid: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  kpiCard: { flex: 1, padding: 14 },
  kpiLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: colors.ink },
  kpiSub: { fontSize: 10, color: colors.muted, marginTop: 4 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  recentCat: { fontWeight: '700', color: colors.ink, fontSize: 13 },
  recentConcept: { fontSize: 11, color: colors.muted, marginTop: 1 },
  recentAmount: { fontWeight: '800', fontSize: 13, fontVariant: ['tabular-nums'] },
  expense: { color: colors.expenseText },
  income: { color: colors.incomeText },
  pending: { opacity: 0.55 },
});
