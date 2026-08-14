import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { MovementRow } from '@/src/components/MovementRow';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { EmptyState } from '@/src/components/ui';
import { categoryByName, movementsForMonth, totals, useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { Movement } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { dayLabel, latestActualMonthKey, monthOptionsFromDates } from '@/src/utils/date';
import { formatMoney } from '@/src/utils/money';

type DayGroup = { date: string; items: Movement[] };

export default function MovimientosScreen() {
  const { state, deleteMovement } = useStore();
  const toast = useToast();
  const options = useMemo(() => monthOptionsFromDates(state.movements.map((m) => m.date)), [state.movements]);
  const [monthKey, setMonthKey] = useState(() => latestActualMonthKey(state.movements));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const monthLabel = options.find((o) => o.value === monthKey)?.label ?? monthKey;
  const monthList = useMemo(() => movementsForMonth(state, monthKey), [state, monthKey]);
  const monthTotals = useMemo(() => totals(monthList), [monthList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthList
      .filter((m) => {
        if (!q) return true;
        const cat = categoryByName(state, m.category);
        return [cat.name, m.concept, m.paymentMethod].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [monthList, search, state]);

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, Movement[]>();
    for (const m of filtered) {
      const arr = map.get(m.date) ?? [];
      arr.push(m);
      map.set(m.date, arr);
    }
    return [...map.entries()].map(([date, items]) => ({ date, items }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Movimientos" />
      <FlatList
        contentContainerStyle={styles.content}
        data={groups}
        keyExtractor={(g) => g.date}
        ListHeaderComponent={
          <>
            <Pressable style={styles.periodRow} onPress={() => setMonthPickerOpen(true)}>
              <View>
                <Text style={styles.periodLabel}>Periodo</Text>
                <Text style={styles.periodValue}>{monthLabel}</Text>
              </View>
              <View style={styles.periodTotals}>
                <Text style={[styles.periodTotalText, styles.expense]}>−{formatMoney(monthTotals.expense, state.currency)}</Text>
                <Text style={[styles.periodTotalText, styles.income]}>+{formatMoney(monthTotals.income, state.currency)}</Text>
              </View>
            </Pressable>

            <View style={styles.searchRow}>
              <TextInput style={styles.search} placeholder="Buscar por categoría, concepto o método" value={search} onChangeText={setSearch} placeholderTextColor={colors.muted} />
            </View>

            {groups.length === 0 ? <EmptyState title="Sin movimientos" subtitle="No hay registros en este periodo." /> : null}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.dayGroup}>
            <Text style={styles.dayTitle}>{dayLabel(item.date)}</Text>
            <View>
              {item.items.map((m) => (
                <MovementRow
                  key={m.id}
                  movement={m}
                  category={categoryByName(state, m.category)}
                  currency={state.currency}
                  onDelete={() => {
                    deleteMovement(m.id);
                    toast('Movimiento eliminado');
                  }}
                />
              ))}
            </View>
          </View>
        )}
      />

      <OptionPickerModal visible={monthPickerOpen} title="Periodo" options={options} selected={monthKey} onSelect={setMonthKey} onClose={() => setMonthPickerOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  periodLabel: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  periodValue: { fontSize: 20, fontWeight: '900', color: colors.ink, textTransform: 'capitalize' },
  periodTotals: { alignItems: 'flex-end' },
  periodTotalText: { fontWeight: '800', fontSize: 13 },
  expense: { color: colors.expenseText },
  income: { color: colors.incomeText },
  searchRow: { marginBottom: 12 },
  search: { borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 14, padding: 12, color: colors.ink },
  dayGroup: { marginBottom: 14 },
  dayTitle: { fontSize: 13, color: colors.ink, fontWeight: '800', paddingHorizontal: 4, paddingBottom: 8, textTransform: 'capitalize' },
});
