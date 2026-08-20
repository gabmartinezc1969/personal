import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DonutChart } from '@/src/components/DonutChart';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { Card, EmptyState } from '@/src/components/ui';
import { categoryByName, movementsForMonth, strictActual, useStore } from '@/src/state/store';
import { Currency } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { latestActualMonthKey, monthOptionsFromDates, monthYearLabel, prevMonthKey } from '@/src/utils/date';
import { formatMoney } from '@/src/utils/money';

type CategoryRow = { category: string; presupuesto: number; real: number; variacion: number };

function categoryTable(state: ReturnType<typeof useStore>['state'], monthKey: string, type: 'I' | 'E') {
  const monthMovs = movementsForMonth(state, monthKey).filter((m) => m.type === type);
  const cats = new Set<string>(state.categories.filter((c) => c.type === type).map((c) => c.id));
  monthMovs.forEach((m) => cats.add(m.category));
  const rows: CategoryRow[] = [...cats]
    .map((category) => {
      const rs = monthMovs.filter((m) => m.category === category);
      const presupuesto = rs.reduce((a, m) => a + m.budgeted, 0);
      const real = rs.reduce((a, m) => a + strictActual(m), 0);
      return { category, presupuesto, real, variacion: real - presupuesto };
    })
    .filter((r) => r.presupuesto > 0 || r.real > 0)
    .sort((a, b) => b.presupuesto - a.presupuesto || b.real - a.real);
  const totals = {
    presupuesto: rows.reduce((a, r) => a + r.presupuesto, 0),
    real: rows.reduce((a, r) => a + r.real, 0),
  };
  return { rows, totals: { ...totals, variacion: totals.real - totals.presupuesto } };
}

export default function ResumenScreen() {
  const { state } = useStore();
  const options = useMemo(() => monthOptionsFromDates(state.movements.map((m) => m.date)), [state.movements]);
  const [monthKey, setMonthKey] = useState(() => latestActualMonthKey(state.movements));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const monthLabel = options.find((o) => o.value === monthKey)?.label ?? monthYearLabel(monthKey);

  const ing = useMemo(() => categoryTable(state, monthKey, 'I'), [state, monthKey]);
  const egr = useMemo(() => categoryTable(state, monthKey, 'E'), [state, monthKey]);
  const ingresos = ing.totals.real;
  const egresos = egr.totals.real;
  const saldo = ingresos - egresos;
  const tasa = ingresos > 0 ? saldo / ingresos : egresos > 0 ? -1 : 0;

  const prevKey = prevMonthKey(monthKey);
  const prevMovs = useMemo(() => movementsForMonth(state, prevKey), [state, prevKey]);
  const hasPrev = prevMovs.length > 0;
  const egresosPrev = useMemo(() => prevMovs.filter((m) => m.type === 'E').reduce((a, m) => a + strictActual(m), 0), [prevMovs]);
  const diff = egresos - egresosPrev;
  const pctDiff = egresosPrev > 0 ? diff / egresosPrev : 0;

  const budgetRows = useMemo(() => [...egr.rows].sort((a, b) => b.presupuesto - a.presupuesto), [egr.rows]);

  const top10 = useMemo(
    () =>
      movementsForMonth(state, monthKey)
        .filter((m) => m.type === 'E' && m.actual)
        .sort((a, b) => (b.actual ?? 0) - (a.actual ?? 0))
        .slice(0, 10),
    [state, monthKey]
  );

  const donutRows = egr.rows.filter((r) => r.real > 0);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.periodPill} onPress={() => setMonthPickerOpen(true)}>
          <Text style={styles.periodPillText}>{monthLabel}</Text>
          <Text style={styles.periodPillChevron}>⌄</Text>
        </Pressable>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Ingresos del mes</Text>
              <Text style={[styles.kpiValue, styles.income]} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(ingresos, state.currency)}
              </Text>
            </Card>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Egresos del mes</Text>
              <Text style={[styles.kpiValue, styles.expense]} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(egresos, state.currency)}
              </Text>
            </Card>
          </View>
          <View style={styles.kpiRow}>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Saldo del mes</Text>
              <Text style={[styles.kpiValue, saldo >= 0 ? styles.income : styles.expense]} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(saldo, state.currency)}
              </Text>
              <View style={[styles.stamp, saldo >= 0 ? styles.stampPos : styles.stampNeg]}>
                <Text style={[styles.stampText, saldo >= 0 ? styles.stampTextPos : styles.stampTextNeg]}>{saldo >= 0 ? 'Superávit' : 'Déficit'}</Text>
              </View>
            </Card>
            <Card style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tasa de ahorro</Text>
              <Text style={[styles.kpiValue, tasa >= 0 ? styles.income : styles.expense]} numberOfLines={1} adjustsFontSizeToFit>
                {(tasa * 100).toFixed(1)}%
              </Text>
            </Card>
          </View>
        </View>

        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Comparativo vs. mes anterior</Text>
          {!hasPrev ? (
            <Text style={styles.panelSub}>No hay datos del mes anterior para comparar.</Text>
          ) : (
            <>
              <Text style={styles.panelSub}>
                Egresos de {monthLabel} vs. {monthYearLabel(prevKey)}
              </Text>
              <View style={styles.compareRow}>
                <Text style={styles.compareAmount}>{formatMoney(egresos, state.currency)}</Text>
                <Text style={[styles.compareTrend, diff > 0 ? styles.expense : styles.income]}>
                  {diff > 0 ? '▲' : '▼'} {Math.abs(pctDiff * 100).toFixed(1)}% {diff > 0 ? 'más que' : 'menos que'} el mes anterior ({formatMoney(egresosPrev, state.currency)})
                </Text>
              </View>
            </>
          )}
        </Card>

        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Presupuesto del mes</Text>
          <Text style={styles.panelSub}>🟢 Menos de 80% · 🟡 80–100% · 🔴 Más de 100%</Text>
          {budgetRows.length === 0 ? (
            <Text style={styles.emptyText}>Sin categorías con presupuesto o gasto este mes.</Text>
          ) : (
            budgetRows.map((r) => {
              const cat = categoryByName(state, r.category);
              const hasBudget = r.presupuesto > 0;
              const pct = hasBudget ? r.real / r.presupuesto : 0;
              const barColor = !hasBudget ? colors.line : pct > 1 ? colors.danger : pct >= 0.8 ? colors.warn : colors.success;
              return (
                <View key={r.category} style={styles.budgetRow}>
                  <View style={styles.budgetHead}>
                    <View style={styles.itemCatRow}>
                      <View style={[styles.dot, { backgroundColor: cat.color }]} />
                      <Text style={styles.budgetName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </View>
                    <Text style={styles.budgetPct}>{hasBudget ? `${(pct * 100).toFixed(0)}%` : 'sin presupuesto'}</Text>
                  </View>
                  <View style={styles.progress}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: barColor }]} />
                  </View>
                  <View style={styles.budgetFoot}>
                    <Text style={styles.budgetFootText}>Ejercido: {formatMoney(r.real, state.currency)}</Text>
                    {hasBudget ? <Text style={styles.budgetFootText}>Disponible: {formatMoney(Math.max(0, r.presupuesto - r.real), state.currency)}</Text> : null}
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {donutRows.length > 0 ? (
          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Distribución de egresos</Text>
            <View style={styles.donutRow}>
              <DonutChart data={donutRows.map((r) => ({ value: r.real, color: categoryByName(state, r.category).color }))} centerLabel={formatMoney(egresos, state.currency)} size={180} />
              <View style={styles.legend}>
                {donutRows.slice(0, 6).map((r) => (
                  <View key={r.category} style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: categoryByName(state, r.category).color }]} />
                    <Text style={styles.legendName} numberOfLines={1}>
                      {categoryByName(state, r.category).name}
                    </Text>
                    <Text style={styles.legendPct}>{((r.real / egresos) * 100).toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        ) : null}

        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Ingresos por categoría</Text>
          <CategoryTable rows={ing.rows} totals={ing.totals} currency={state.currency} />
        </Card>

        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Egresos por categoría</Text>
          <CategoryTable rows={egr.rows} totals={egr.totals} currency={state.currency} />
        </Card>

        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Top 10 gastos del mes</Text>
          {top10.length === 0 ? (
            <EmptyState title="Sin gastos registrados" subtitle="No hay gastos con monto real en este mes." />
          ) : (
            top10.map((m, i) => (
              <View key={m.id} style={styles.topRow}>
                <Text style={styles.topRank}>{i + 1}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.topCat} numberOfLines={1}>
                    {categoryByName(state, m.category).name}
                  </Text>
                  <Text style={styles.topConcept} numberOfLines={1}>
                    {m.concept}
                  </Text>
                </View>
                <Text style={styles.topAmount}>{formatMoney(m.actual ?? 0, state.currency)}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <OptionPickerModal visible={monthPickerOpen} title="Periodo" options={options} selected={monthKey} onSelect={setMonthKey} onClose={() => setMonthPickerOpen(false)} />
    </SafeAreaView>
  );
}

function CategoryTable({ rows, totals, currency }: { rows: CategoryRow[]; totals: { presupuesto: number; real: number; variacion: number }; currency: Currency }) {
  const { state } = useStore();
  if (rows.length === 0) return <Text style={styles.emptyText}>Sin movimientos en este periodo.</Text>;
  return (
    <View>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadText, { flex: 1 }]}>Categoría</Text>
        <Text style={[styles.tableHeadText, styles.tableNum]}>Presup.</Text>
        <Text style={[styles.tableHeadText, styles.tableNum]}>Real</Text>
        <Text style={[styles.tableHeadText, styles.tableNum]}>Var.</Text>
      </View>
      {rows.map((r) => (
        <View key={r.category} style={styles.tableRow}>
          <View style={[styles.itemCatRow, { flex: 1 }]}>
            <View style={[styles.dot, { backgroundColor: categoryByName(state, r.category).color }]} />
            <Text style={styles.tableCat} numberOfLines={1}>
              {categoryByName(state, r.category).name}
            </Text>
          </View>
          <Text style={[styles.tableNumText, styles.tableNum]}>{formatMoney(r.presupuesto, currency)}</Text>
          <Text style={[styles.tableNumText, styles.tableNum]}>{formatMoney(r.real, currency)}</Text>
          <Text style={[styles.tableNumText, styles.tableNum, r.variacion >= 0 ? styles.income : styles.expense]}>{formatMoney(r.variacion, currency)}</Text>
        </View>
      ))}
      <View style={[styles.tableRow, styles.tableTotalRow]}>
        <Text style={[styles.tableCat, { flex: 1, fontWeight: '800' }]}>Total</Text>
        <Text style={[styles.tableNumText, styles.tableNum, { fontWeight: '800' }]}>{formatMoney(totals.presupuesto, currency)}</Text>
        <Text style={[styles.tableNumText, styles.tableNum, { fontWeight: '800' }]}>{formatMoney(totals.real, currency)}</Text>
        <Text style={[styles.tableNumText, styles.tableNum, { fontWeight: '800' }, totals.variacion >= 0 ? styles.income : styles.expense]}>{formatMoney(totals.variacion, currency)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  periodPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brandTint, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 14 },
  periodPillText: { color: colors.brand, fontWeight: '800', fontSize: 14, textTransform: 'capitalize' },
  periodPillChevron: { color: colors.brand, fontSize: 13 },
  kpiGrid: { gap: 10, marginBottom: 4 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: { flex: 1, padding: 14 },
  kpiLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: colors.ink },
  income: { color: colors.incomeText },
  expense: { color: colors.expenseText },
  stamp: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8, marginTop: 6 },
  stampPos: { backgroundColor: '#DFF6EE' },
  stampNeg: { backgroundColor: '#FCEBEB' },
  stampText: { fontSize: 10, fontWeight: '800' },
  stampTextPos: { color: colors.incomeText },
  stampTextNeg: { color: colors.expenseText },
  panel: { padding: 16, marginTop: 14 },
  panelTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  panelSub: { fontSize: 12, color: colors.muted, marginBottom: 10 },
  emptyText: { fontSize: 12, color: colors.muted, paddingVertical: 8 },
  compareRow: { gap: 6 },
  compareAmount: { fontSize: 20, fontWeight: '800', color: colors.ink },
  compareTrend: { fontSize: 12, fontWeight: '700' },
  budgetRow: { marginBottom: 14 },
  budgetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemCatRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  budgetName: { fontSize: 13, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  budgetPct: { fontSize: 12, fontWeight: '800', color: colors.ink },
  progress: { height: 8, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 10 },
  budgetFoot: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetFootText: { fontSize: 11, color: colors.muted },
  donutRow: { alignItems: 'center', gap: 16 },
  legend: { width: '100%', gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendName: { flex: 1, fontSize: 13, color: colors.ink },
  legendPct: { fontSize: 13, fontWeight: '700', color: colors.ink },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 6, marginBottom: 4 },
  tableHeadText: { fontSize: 10, color: colors.muted, fontWeight: '800', textTransform: 'uppercase' },
  tableNum: { width: 78, textAlign: 'right' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  tableTotalRow: { borderBottomWidth: 0, paddingTop: 10 },
  tableCat: { fontSize: 12, color: colors.ink, flexShrink: 1 },
  tableNumText: { fontSize: 12, color: colors.ink },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  topRank: { width: 18, fontSize: 12, fontWeight: '800', color: colors.muted },
  topCat: { fontSize: 13, fontWeight: '700', color: colors.ink },
  topConcept: { fontSize: 11, color: colors.muted, marginTop: 1 },
  topAmount: { fontSize: 13, fontWeight: '800', color: colors.expenseText },
});
