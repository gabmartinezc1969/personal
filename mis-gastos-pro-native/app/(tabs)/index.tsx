import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { Card, EmptyState } from '@/src/components/ui';
import { TransactionRow } from '@/src/components/TransactionRow';
import { categoryById, totals, transactionsForMonth, useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { Transaction } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { toCsv } from '@/src/utils/csv';
import { currentMonthKey, dayLabel, monthOptions } from '@/src/utils/date';
import { shareTextFile } from '@/src/utils/files';
import { formatMoney } from '@/src/utils/money';

type DayGroup = { date: string; items: Transaction[] };

export default function HomeScreen() {
  const { state, deleteTransaction } = useStore();
  const toast = useToast();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const options = useMemo(() => monthOptions(24), []);
  const monthLabel = options.find((o) => o.value === monthKey)?.label ?? monthKey;

  const monthList = useMemo(() => transactionsForMonth(state, monthKey), [state, monthKey]);
  const monthTotals = useMemo(() => totals(monthList), [monthList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthList
      .filter((t) => {
        if (!q) return true;
        const cat = categoryById(state, t.categoryId);
        return [cat.name, t.note, t.account].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [monthList, search, state]);

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const arr = map.get(t.date) ?? [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return [...map.entries()].map(([date, items]) => ({ date, items }));
  }, [filtered]);

  async function exportCsv() {
    const rows: (string | number)[][] = [
      ['Fecha', 'Tipo', 'Categoría', 'Nota', 'Cuenta', 'Monto'],
      ...monthList.map((t) => [t.date, t.type, categoryById(state, t.categoryId).name, t.note || '', t.account || '', t.amount]),
    ];
    try {
      await shareTextFile(`mis-gastos-${monthKey}.csv`, toCsv(rows), 'text/csv');
    } catch {
      toast('No se pudo exportar el CSV');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Mis Gastos" />
      <FlatList
        contentContainerStyle={styles.content}
        data={groups}
        keyExtractor={(g) => g.date}
        ListHeaderComponent={
          <>
            <Card style={styles.hero}>
              <Text style={styles.heroTitle}>Administrador de dinero</Text>
              <View style={styles.periodStrip}>
                <Pressable style={styles.periodBox} onPress={() => setMonthPickerOpen(true)}>
                  <Text style={styles.metricLabel}>Periodo</Text>
                  <Text style={styles.periodValue} numberOfLines={1} adjustsFontSizeToFit>
                    {monthLabel}
                  </Text>
                </Pressable>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Gastos</Text>
                  <Text style={[styles.metricValue, styles.expenseColor]} numberOfLines={1} adjustsFontSizeToFit>
                    −{formatMoney(monthTotals.expense, state.currency)}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Ingreso</Text>
                  <Text style={[styles.metricValue, styles.incomeColor]} numberOfLines={1} adjustsFontSizeToFit>
                    {formatMoney(monthTotals.income, state.currency)}
                  </Text>
                </View>
              </View>
            </Card>

            <View style={styles.searchRow}>
              <TextInput style={styles.search} placeholder="Buscar por categoría, nota o cuenta" value={search} onChangeText={setSearch} />
              <Pressable style={styles.iconBtn} onPress={exportCsv}>
                <Text style={{ fontSize: 16 }}>⇩</Text>
              </Pressable>
            </View>

            {groups.length === 0 ? <EmptyState title="Sin movimientos" subtitle="Toca el botón + para comenzar." /> : null}
          </>
        }
        renderItem={({ item }) => {
          const dayTotals = totals(item.items);
          return (
            <View style={{ marginBottom: 4 }}>
              <View style={styles.dayTitle}>
                <Text style={styles.dayTitleText}>{dayLabel(item.date)}</Text>
                <Text style={styles.dayTitleText}>
                  Gastos: −{formatMoney(dayTotals.expense, state.currency)}  Ingreso: {formatMoney(dayTotals.income, state.currency)}
                </Text>
              </View>
              <View style={styles.txList}>
                {item.items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    tx={t}
                    category={categoryById(state, t.categoryId)}
                    currency={state.currency}
                    onDelete={() => {
                      deleteTransaction(t.id);
                      toast('Movimiento eliminado');
                    }}
                  />
                ))}
              </View>
            </View>
          );
        }}
      />

      <OptionPickerModal visible={monthPickerOpen} title="Periodo" options={options} selected={monthKey} onSelect={setMonthKey} onClose={() => setMonthPickerOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24 },
  hero: { backgroundColor: colors.yellow, padding: 18, borderWidth: 0 },
  heroTitle: { textAlign: 'center', fontWeight: '900', fontSize: 19, marginBottom: 14, color: colors.ink },
  periodStrip: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  periodBox: { width: 118 },
  periodValue: { fontSize: 22, fontWeight: '900', color: colors.ink },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { color: colors.heroLabel, fontSize: 12, marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  expenseColor: { color: '#A91F2C' },
  incomeColor: { color: '#087B40' },
  searchRow: { flexDirection: 'row', gap: 8, marginVertical: 13 },
  search: { flex: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 14, padding: 12, color: colors.ink },
  iconBtn: { borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 14, minWidth: 46, alignItems: 'center', justifyContent: 'center' },
  dayTitle: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 2, paddingHorizontal: 4, paddingTop: 10, paddingBottom: 6 },
  dayTitleText: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  txList: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
});
