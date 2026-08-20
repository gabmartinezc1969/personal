import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { EmptyState } from '@/src/components/ui';
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
  const balance = monthTotals.income - monthTotals.expense;

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
            <View style={styles.hero}>
              <Pressable style={styles.periodPill} onPress={() => setMonthPickerOpen(true)}>
                <Text style={styles.periodPillText}>{monthLabel}</Text>
                <Text style={styles.periodPillChevron}>⌄</Text>
              </Pressable>

              <Text style={styles.balanceLabel}>Balance del mes</Text>
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
                    <Text style={styles.statLabel}>Ingreso</Text>
                    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                      {formatMoney(monthTotals.income, state.currency)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.searchRow}>
              <TextInput style={styles.search} placeholder="Buscar por categoría, nota o cuenta" value={search} onChangeText={setSearch} placeholderTextColor={colors.muted} />
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
            <View style={styles.dayGroup}>
              <View style={styles.dayTitle}>
                <Text style={styles.dayTitleText}>{dayLabel(item.date)}</Text>
                <Text style={styles.dayTitleTotals}>
                  −{formatMoney(dayTotals.expense, state.currency)} · +{formatMoney(dayTotals.income, state.currency)}
                </Text>
              </View>
              <View>
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
  periodPillText: { color: colors.onBrand, fontWeight: '700', fontSize: 13 },
  periodPillChevron: { color: colors.onBrand, fontSize: 13 },
  balanceLabel: { color: colors.heroLabel, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  balanceValue: { color: colors.onBrand, fontSize: 34, fontWeight: '900', marginBottom: 18 },
  statRow: { flexDirection: 'row', gap: 10 },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    padding: 10,
    minWidth: 0,
  },
  statIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statIconExpense: { backgroundColor: 'rgba(224,60,68,0.55)' },
  statIconIncome: { backgroundColor: 'rgba(18,183,106,0.55)' },
  statIcon: { color: colors.onBrand, fontSize: 13, fontWeight: '900' },
  statLabel: { color: colors.heroLabel, fontSize: 11, fontWeight: '600' },
  statValue: { color: colors.onBrand, fontSize: 14, fontWeight: '800' },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  search: { flex: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 14, padding: 12, color: colors.ink },
  iconBtn: { borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 14, minWidth: 46, alignItems: 'center', justifyContent: 'center' },
  dayGroup: { marginTop: 18 },
  dayTitle: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 2, paddingHorizontal: 4, paddingBottom: 8 },
  dayTitleText: { fontSize: 13, color: colors.ink, fontWeight: '800' },
  dayTitleTotals: { fontSize: 12, color: colors.muted, fontWeight: '600' },
});
