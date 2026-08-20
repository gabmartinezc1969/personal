import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetModal } from '@/src/components/BudgetModal';
import { Header } from '@/src/components/Header';
import { RingProgress } from '@/src/components/RingProgress';
import { EmptyState, SectionHead } from '@/src/components/ui';
import { categoryById, totals, transactionsForMonth, useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { Budget } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { currentMonthKey } from '@/src/utils/date';
import { formatMoney } from '@/src/utils/money';

export default function ReportsScreen() {
  const { state, deleteBudget } = useStore();
  const toast = useToast();
  const [budgetModal, setBudgetModal] = useState<{ open: boolean; type: 'global' | 'category' }>({ open: false, type: 'global' });

  const monthList = useMemo(() => transactionsForMonth(state, currentMonthKey()), [state]);
  const spend = totals(monthList).expense;
  const limit = Number(state.globalBudget) || 0;
  const remaining = limit - spend;
  const pct = limit ? Math.max(0, Math.min(100, (remaining / limit) * 100)) : 0;

  const usedByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthList) {
      if (t.type !== 'expense') continue;
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    }
    return map;
  }, [monthList]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Informes" />
      <FlatList
        contentContainerStyle={styles.content}
        data={state.budgets}
        keyExtractor={(b) => b.id}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <Text style={styles.heroTitle}>Presupuesto mensual</Text>
                <Pressable style={styles.adjustPill} onPress={() => setBudgetModal({ open: true, type: 'global' })}>
                  <Text style={styles.adjustPillText}>⚙ Ajustar</Text>
                </Pressable>
              </View>
              <View style={styles.summary}>
                <RingProgress
                  percent={pct}
                  label="Disponible"
                  value={`${Math.round(pct)}%`}
                  trackColor="rgba(255,255,255,0.22)"
                  progressColor={colors.onBrand}
                  labelColor={colors.heroLabel}
                  valueColor={colors.onBrand}
                />
                <View style={styles.stats}>
                  <StatRow label="Balance" value={formatMoney(remaining, state.currency)} />
                  <StatRow label="Presupuesto" value={formatMoney(limit, state.currency)} />
                  <StatRow label="Gastos" value={formatMoney(spend, state.currency)} />
                </View>
              </View>
            </View>

            <SectionHead title="Por categoría" action="+ Añadir" onAction={() => setBudgetModal({ open: true, type: 'category' })} />
            {state.budgets.length === 0 ? <EmptyState title="Sin presupuestos por categoría" subtitle="Añade límites para controlar tus gastos." /> : null}
          </>
        }
        renderItem={({ item }) => (
          <BudgetRow
            budget={item}
            used={usedByCategory.get(item.categoryId) ?? 0}
            currency={state.currency}
            categoryName={categoryById(state, item.categoryId).name}
            categoryIcon={categoryById(state, item.categoryId).icon}
            categoryColor={categoryById(state, item.categoryId).color}
            onDelete={() => {
              deleteBudget(item.id);
              toast('Presupuesto eliminado');
            }}
          />
        )}
        ListFooterComponent={<View style={{ height: 8 }} />}
      />

      <BudgetModal visible={budgetModal.open} initialType={budgetModal.type} onClose={() => setBudgetModal((s) => ({ ...s, open: false }))} />
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function BudgetRow({
  budget,
  used,
  currency,
  categoryName,
  categoryIcon,
  categoryColor,
  onDelete,
}: {
  budget: Budget;
  used: number;
  currency: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  onDelete: () => void;
}) {
  const pct = budget.amount ? Math.min(100, (used / budget.amount) * 100) : 0;
  const over = used > budget.amount;
  const barColor = over ? colors.danger : pct > 80 ? colors.warn : categoryColor;
  return (
    <View style={styles.budgetRow}>
      <View style={styles.budgetTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.budgetName}>
            {categoryIcon} {categoryName}
          </Text>
          <Text style={[styles.budgetSub, over && { color: colors.danger }]}>
            {over ? `Excedido por ${formatMoney(used - budget.amount, currency as any)}` : `Restan ${formatMoney(budget.amount - used, currency as any)}`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.budgetPct}>{budget.amount ? Math.round((used / budget.amount) * 100) : 0}%</Text>
          <Pressable onPress={onDelete} hitSlop={10}>
            <Text style={styles.delete}>×</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  hero: {
    backgroundColor: colors.brand,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.brand,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heroTitle: { fontSize: 17, fontWeight: '800', color: colors.onBrand },
  adjustPill: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  adjustPillText: { color: colors.onBrand, fontWeight: '700', fontSize: 12 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  stats: { flex: 1, gap: 10, minWidth: 0 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statLabel: { color: colors.heroLabel, fontSize: 13 },
  statValue: { fontWeight: '800', color: colors.onBrand, flexShrink: 1, textAlign: 'right' },
  budgetRow: { backgroundColor: colors.card, padding: 14, borderRadius: 18, marginBottom: 8 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  budgetName: { fontWeight: '700', color: colors.ink },
  budgetSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  budgetPct: { fontWeight: '800', color: colors.ink },
  delete: { color: '#c3c6d1', fontSize: 20, paddingHorizontal: 2 },
  progress: { height: 9, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginTop: 9 },
  progressFill: { height: '100%', borderRadius: 12 },
});
