import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetModal } from '@/src/components/BudgetModal';
import { Header } from '@/src/components/Header';
import { RingProgress } from '@/src/components/RingProgress';
import { Card, EmptyState, SectionHead } from '@/src/components/ui';
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
          <Card>
            <SectionHead title="Presupuesto mensual" action="⚙ Ajustar" onAction={() => setBudgetModal({ open: true, type: 'global' })} />
            <View style={styles.summary}>
              <RingProgress percent={pct} label="Disponible" value={`${Math.round(pct)}%`} />
              <View style={styles.stats}>
                <StatRow label="Balance:" value={formatMoney(remaining, state.currency)} />
                <StatRow label="Presupuesto:" value={formatMoney(limit, state.currency)} />
                <StatRow label="Gastos:" value={formatMoney(spend, state.currency)} />
              </View>
            </View>
            <SectionHead title="Por categoría" action="+ Añadir" onAction={() => setBudgetModal({ open: true, type: 'category' })} />
            {state.budgets.length === 0 ? <EmptyState title="Sin presupuestos por categoría" subtitle="Añade límites para controlar tus gastos." /> : null}
          </Card>
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
      <Text style={styles.statValue}>{value}</Text>
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
  content: { padding: 14, paddingBottom: 24 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  stats: { flex: 1, gap: 7 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: colors.muted, fontSize: 13 },
  statValue: { fontWeight: '800', color: colors.ink },
  budgetRow: { marginHorizontal: 16, marginVertical: 8, backgroundColor: colors.card, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.line },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  budgetName: { fontWeight: '700', color: colors.ink },
  budgetSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  budgetPct: { fontWeight: '800', color: colors.ink },
  delete: { color: '#aaa', fontSize: 20, paddingHorizontal: 2 },
  progress: { height: 9, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginTop: 7 },
  progressFill: { height: '100%', borderRadius: 12 },
});
