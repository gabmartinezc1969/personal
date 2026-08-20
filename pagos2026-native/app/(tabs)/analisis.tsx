import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBubble } from '@/src/components/CategoryBubble';
import { DonutChart } from '@/src/components/DonutChart';
import { Header } from '@/src/components/Header';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { Card, EmptyState, SectionHead } from '@/src/components/ui';
import { categoryByName, movementAmount, useStore } from '@/src/state/store';
import { Category, MovementType } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { latestActualMonthKey, monthOptionsFromDates, yearsFromDates } from '@/src/utils/date';
import { formatMoney } from '@/src/utils/money';

type Range = 'month' | 'year';
type Row = { category: Category; value: number };

const KIND_OPTIONS = [
  { value: 'E', label: 'Gastos' },
  { value: 'I', label: 'Ingresos' },
];

export default function AnalisisScreen() {
  const { state } = useStore();
  const [kind, setKind] = useState<MovementType>('E');
  const [kindPickerOpen, setKindPickerOpen] = useState(false);
  const [range, setRange] = useState<Range>('month');

  const dates = useMemo(() => state.movements.map((m) => m.date), [state.movements]);
  const monthOptions = useMemo(() => monthOptionsFromDates(dates), [dates]);
  const yearOptions = useMemo(() => yearsFromDates(dates).map((y) => ({ value: y, label: y })), [dates]);
  const periods = range === 'month' ? monthOptions : yearOptions;
  // Igual que en Inicio/Movimientos: arranca en el último mes con datos
  // reales, no en el mes más reciente disponible (que puede ser un mes
  // futuro sólo con presupuesto planeado y nada ejercido todavía).
  const defaultMonth = useMemo(() => latestActualMonthKey(state.movements), [state.movements]);
  const [period, setPeriod] = useState(defaultMonth);

  useEffect(() => {
    if (range === 'month') {
      setPeriod(monthOptions.some((o) => o.value === defaultMonth) ? defaultMonth : monthOptions[0]?.value ?? '');
    } else {
      setPeriod(yearOptions[0]?.value ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const data = useMemo<Row[]>(() => {
    const arr = state.movements.filter((m) => m.type === kind).filter((m) => (range === 'month' ? m.date.startsWith(period) : m.date.startsWith(period + '-')));
    const map = new Map<string, number>();
    for (const m of arr) map.set(m.category, (map.get(m.category) ?? 0) + movementAmount(m));
    return [...map.entries()].map(([cat, value]) => ({ category: categoryByName(state, cat), value })).sort((a, b) => b.value - a.value);
  }, [state, kind, range, period]);

  const total = data.reduce((a, r) => a + r.value, 0);
  const kindLabel = KIND_OPTIONS.find((k) => k.value === kind)?.label ?? '';

  // El periodo activo puede no ser el primero de la lista (p. ej. hay meses
  // futuros sin ejercer antes del último mes real): desplaza el selector
  // horizontal para que el chip activo quede visible sin scroll manual.
  const periodScrollRef = useRef<ScrollView>(null);
  const periodOffsets = useRef<Record<string, number>>({});
  function onPeriodTabLayout(value: string, x: number) {
    periodOffsets.current[value] = x;
    if (value === period) periodScrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: false });
  }
  useEffect(() => {
    const x = periodOffsets.current[period];
    if (x != null) periodScrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  }, [period]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Análisis" />
      <FlatList
        contentContainerStyle={styles.content}
        data={data}
        keyExtractor={(r) => r.category.id}
        ListHeaderComponent={
          <Card>
            <SectionHead title="Análisis por categoría" action={kindLabel} onAction={() => setKindPickerOpen(true)} />

            <View style={styles.segment}>
              <Pressable style={[styles.segmentBtn, range === 'month' && styles.segmentBtnActive]} onPress={() => setRange('month')}>
                <Text style={[styles.segmentText, range === 'month' && styles.segmentTextActive]}>Mes</Text>
              </Pressable>
              <Pressable style={[styles.segmentBtn, range === 'year' && styles.segmentBtnActive]} onPress={() => setRange('year')}>
                <Text style={[styles.segmentText, range === 'year' && styles.segmentTextActive]}>Año</Text>
              </Pressable>
            </View>

            <ScrollView ref={periodScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.periodTabs} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {periods.map((p) => (
                <Pressable
                  key={p.value}
                  onPress={() => setPeriod(p.value)}
                  onLayout={(e) => onPeriodTabLayout(p.value, e.nativeEvent.layout.x)}
                  style={[styles.periodTab, p.value === period && styles.periodTabActive]}>
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
                  data.slice(0, 8).map((r) => (
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
          </Card>
        }
        renderItem={({ item, index }) => {
          const pct = total ? (item.value / total) * 100 : 0;
          return (
            <>
              {index === 0 ? <Text style={styles.rankingTitle}>Ranking de categorías</Text> : null}
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
            </>
          );
        }}
      />

      <OptionPickerModal visible={kindPickerOpen} title="Tipo de análisis" options={KIND_OPTIONS} selected={kind} onSelect={(v) => setKind(v as MovementType)} onClose={() => setKindPickerOpen(false)} />
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
  periodTab: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  periodTabActive: { borderBottomColor: colors.brand },
  periodTabText: { color: colors.muted, textTransform: 'capitalize' },
  periodTabTextActive: { color: colors.ink, fontWeight: '800' },
  analyticsGrid: { padding: 15, gap: 16, alignItems: 'center' },
  legend: { width: '100%', gap: 9 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13, color: colors.ink },
  legendPct: { fontSize: 13, fontWeight: '700', color: colors.ink },
  rankingTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 8, marginBottom: 10, marginHorizontal: 4 },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 18, backgroundColor: colors.card, marginBottom: 8 },
  rankName: { fontWeight: '700', color: colors.ink },
  rankBar: { height: 7, backgroundColor: '#eee', borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  rankFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 10 },
  rankValue: { fontWeight: '700', color: colors.ink },
});
