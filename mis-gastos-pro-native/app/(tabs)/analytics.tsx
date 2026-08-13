import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DonutChart } from '@/src/components/DonutChart';
import { Header } from '@/src/components/Header';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { Card, EmptyState, SectionHead } from '@/src/components/ui';
import { CategoryBubble } from '@/src/components/CategoryBubble';
import { categoryById, useStore } from '@/src/state/store';
import { Category, TxType } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { analysisPeriodValues } from '@/src/utils/date';
import { formatMoney } from '@/src/utils/money';

type Range = 'month' | 'year';
type Row = { category: Category; value: number };

const KIND_OPTIONS = [
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' },
];

export default function AnalyticsScreen() {
  const { state } = useStore();
  const [kind, setKind] = useState<TxType>('expense');
  const [kindPickerOpen, setKindPickerOpen] = useState(false);
  const [range, setRange] = useState<Range>('month');
  const periods = useMemo(() => analysisPeriodValues(range), [range]);
  const [period, setPeriod] = useState(periods.at(-1)?.value ?? '');

  useEffect(() => {
    const opts = analysisPeriodValues(range);
    setPeriod(opts.at(-1)?.value ?? '');
  }, [range]);

  const data = useMemo<Row[]>(() => {
    const arr = state.transactions.filter((t) => t.type === kind).filter((t) => (range === 'month' ? t.date.startsWith(period) : t.date.startsWith(period + '-')));
    const map = new Map<string, number>();
    for (const t of arr) map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    return [...map.entries()].map(([cid, value]) => ({ category: categoryById(state, cid), value })).sort((a, b) => b.value - a.value);
  }, [state, kind, range, period]);

  const total = data.reduce((a, r) => a + r.value, 0);
  const kindLabel = KIND_OPTIONS.find((k) => k.value === kind)?.label ?? '';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Análisis" />
      <FlatList
        contentContainerStyle={styles.content}
        data={data}
        keyExtractor={(r) => r.category.id}
        ListHeaderComponent={
          <Card>
            <SectionHead title="Análisis personalizados" action={kindLabel} onAction={() => setKindPickerOpen(true)} />

            <View style={styles.segment}>
              <Pressable style={[styles.segmentBtn, range === 'month' && styles.segmentBtnActive]} onPress={() => setRange('month')}>
                <Text style={[styles.segmentText, range === 'month' && styles.segmentTextActive]}>Mes</Text>
              </Pressable>
              <Pressable style={[styles.segmentBtn, range === 'year' && styles.segmentBtnActive]} onPress={() => setRange('year')}>
                <Text style={[styles.segmentText, range === 'year' && styles.segmentTextActive]}>Año</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodTabs} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {periods.map((p) => (
                <Pressable key={p.value} onPress={() => setPeriod(p.value)} style={styles.periodTab}>
                  <Text style={[styles.periodTabText, p.value === period && styles.periodTabTextActive]}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.analyticsGrid}>
              <DonutChart data={data.map((r) => ({ value: r.value, color: r.category.color }))} centerLabel={formatMoney(total, state.currency)} />
              <View style={styles.legend}>
                {data.length === 0 ? (
                  <EmptyState title="Sin datos" subtitle="No hay movimientos en este periodo." />
                ) : (
                  data.slice(0, 7).map((r) => (
                    <View key={r.category.id} style={styles.legendRow}>
                      <View style={[styles.dot, { backgroundColor: r.category.color }]} />
                      <Text style={styles.legendName} numberOfLines={1}>
                        {r.category.name}
                      </Text>
                      <Text style={styles.legendPct}>{total ? ((r.value / total) * 100).toFixed(1) : '0.0'}%</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={styles.rankingHead}>
              <Text style={styles.rankingTitle}>Ranking de categorías</Text>
            </View>
          </Card>
        }
        renderItem={({ item }) => {
          const pct = total ? (item.value / total) * 100 : 0;
          return (
            <View style={styles.rank}>
              <CategoryBubble icon={item.category.icon} color={item.category.color} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>
                  {item.category.name}   {pct.toFixed(1)}%
                </Text>
                <View style={styles.rankBar}>
                  <View style={[styles.rankFill, { width: `${pct}%` }]} />
                </View>
              </View>
              <Text style={styles.rankValue}>{formatMoney(item.value, state.currency)}</Text>
            </View>
          );
        }}
      />

      <OptionPickerModal visible={kindPickerOpen} title="Tipo de análisis" options={KIND_OPTIONS} selected={kind} onSelect={(v) => setKind(v as TxType)} onClose={() => setKindPickerOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24 },
  segment: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 13, padding: 3, marginHorizontal: 16, marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { fontWeight: '800', color: colors.ink },
  segmentTextActive: { color: '#fff' },
  periodTabs: { borderBottomWidth: 1, borderBottomColor: colors.line },
  periodTab: { paddingVertical: 12, paddingHorizontal: 14 },
  periodTabText: { color: colors.muted },
  periodTabTextActive: { color: colors.ink, fontWeight: '800' },
  analyticsGrid: { padding: 15, gap: 16, alignItems: 'center' },
  legend: { width: '100%', gap: 9 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13, color: colors.ink },
  legendPct: { fontSize: 13, fontWeight: '700', color: colors.ink },
  rankingHead: { paddingHorizontal: 15, paddingBottom: 4 },
  rankingTitle: { fontSize: 13, fontWeight: '800', color: colors.muted },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.card },
  rankName: { fontWeight: '700', color: colors.ink },
  rankBar: { height: 7, backgroundColor: '#eee', borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  rankFill: { height: '100%', backgroundColor: colors.yellow, borderRadius: 10 },
  rankValue: { fontWeight: '700', color: colors.ink },
});
