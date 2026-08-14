import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MarkPaidModal } from '@/src/components/MarkPaidModal';
import { Card, EmptyState } from '@/src/components/ui';
import { categoryByName, useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { Movement } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { daysUntil, shortDate } from '@/src/utils/date';
import { buildIcs } from '@/src/utils/ics';
import { shareTextFile } from '@/src/utils/files';
import { formatMoney } from '@/src/utils/money';

type PendingItem = Movement & { diffDays: number };

const GROUPS: { key: string; title: string; test: (d: number) => boolean; tone: 'danger' | 'warn' | 'flat' }[] = [
  { key: 'vencido', title: 'Vencido', test: (d) => d < 0, tone: 'danger' },
  { key: 'hoy', title: 'Hoy', test: (d) => d === 0, tone: 'warn' },
  { key: 'semana', title: 'Próximos 7 días', test: (d) => d > 0 && d <= 7, tone: 'warn' },
  { key: 'mes', title: 'Próximos 30 días', test: (d) => d > 7 && d <= 30, tone: 'flat' },
  { key: 'despues', title: 'Más adelante', test: (d) => d > 30, tone: 'flat' },
];

export default function RecordatoriosScreen() {
  const { state, markPaid } = useStore();
  const toast = useToast();
  const [payingMovement, setPayingMovement] = useState<Movement | null>(null);

  // Igual que `pendingItems()` en la versión web: sólo gastos presupuestados
  // que todavía no se registraron como pagados (monto real nulo o en $0).
  const items = useMemo<PendingItem[]>(
    () =>
      state.movements
        .filter((m) => m.type === 'E' && m.budgeted > 0 && (m.actual === null || m.actual === 0))
        .map((m) => ({ ...m, diffDays: daysUntil(m.date) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [state.movements]
  );

  const vencidos = items.filter((i) => i.diffDays < 0);
  const proximos30 = items.filter((i) => i.diffDays >= 0 && i.diffDays <= 30);
  const totalVencido = vencidos.reduce((a, i) => a + i.budgeted, 0);
  const total30 = proximos30.reduce((a, i) => a + i.budgeted, 0);

  async function exportIcs() {
    if (!items.length) {
      toast('No hay pagos pendientes que exportar');
      return;
    }
    const ics = buildIcs(items.map((i) => ({ id: i.id, date: i.date, title: `${i.category} · ${i.concept}`, amount: formatMoney(i.budgeted, state.currency) })));
    try {
      await shareTextFile('pagos2026-recordatorios.ics', ics, 'text/calendar');
    } catch {
      toast('No se pudo generar el archivo de calendario');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pagos pendientes</Text>
            <Text style={styles.kpiValue}>{items.length}</Text>
          </Card>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Vencidos</Text>
            <Text style={[styles.kpiValue, vencidos.length > 0 && { color: colors.expenseText }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(totalVencido, state.currency)}
            </Text>
            <Text style={styles.kpiSub}>{vencidos.length} movimiento(s)</Text>
          </Card>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Próximos 30 días</Text>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
              {formatMoney(total30, state.currency)}
            </Text>
          </Card>
        </View>

        <Pressable style={styles.icsBtn} onPress={exportIcs}>
          <Text style={styles.icsBtnText}>📅 Exportar a calendario (.ics)</Text>
        </Pressable>
        <Text style={styles.icsHint}>Descarga un archivo .ics con todos tus pagos pendientes y un recordatorio un día antes de cada uno. Ábrelo con tu app de calendario para importarlo.</Text>

        {items.length === 0 ? (
          <EmptyState title="Al corriente" subtitle="No hay pagos pendientes registrados." />
        ) : (
          GROUPS.map((g) => {
            const list = items.filter((i) => g.test(i.diffDays));
            if (!list.length) return null;
            const sub = list.reduce((a, i) => a + i.budgeted, 0);
            return (
              <View key={g.key} style={{ marginBottom: 14 }}>
                <View style={styles.groupHead}>
                  <View style={[styles.groupBadge, styles[`tone_${g.tone}` as const]]}>
                    <Text style={[styles.groupBadgeText, g.tone === 'flat' && { color: colors.ink }]}>{g.title}</Text>
                  </View>
                  <Text style={styles.groupSub}>
                    {list.length} · {formatMoney(sub, state.currency)}
                  </Text>
                </View>
                {list.map((i) => {
                  const cat = categoryByName(state, i.category);
                  const dayLabel = i.diffDays < 0 ? `Vencido hace ${Math.abs(i.diffDays)} día(s)` : i.diffDays === 0 ? 'Vence hoy' : `En ${i.diffDays} día(s)`;
                  return (
                    <View key={i.id} style={styles.item}>
                      <View style={{ width: 92 }}>
                        <Text style={styles.itemDate}>{shortDate(i.date)}</Text>
                        <Text style={styles.itemDayLabel}>{dayLabel}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.itemCatRow}>
                          <View style={[styles.dot, { backgroundColor: cat.color }]} />
                          <Text style={styles.itemCat} numberOfLines={1}>
                            {cat.name}
                          </Text>
                        </View>
                        <Text style={styles.itemConcept} numberOfLines={1}>
                          {i.concept}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text style={styles.itemAmount}>{formatMoney(i.budgeted, state.currency)}</Text>
                        <Pressable style={styles.payBtn} onPress={() => setPayingMovement(i)}>
                          <Text style={styles.payBtnText}>Marcar pagado</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>

      <MarkPaidModal
        movement={payingMovement}
        onClose={() => setPayingMovement(null)}
        onConfirm={(amount) => {
          if (payingMovement) markPaid(payingMovement.id, amount);
          setPayingMovement(null);
          toast('Pago registrado');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 24 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kpiCard: { flex: 1, padding: 12 },
  kpiLabel: { fontSize: 10, color: colors.muted, fontWeight: '700', marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '800', color: colors.ink },
  kpiSub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  icsBtn: { backgroundColor: colors.brandTint, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  icsBtnText: { fontWeight: '800', color: colors.brand },
  icsHint: { fontSize: 11, color: colors.muted, marginBottom: 16, lineHeight: 16 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2 },
  groupBadge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  groupBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  tone_danger: { backgroundColor: colors.danger },
  tone_warn: { backgroundColor: colors.warn },
  tone_flat: { backgroundColor: '#E4E6EC' },
  groupSub: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  item: { flexDirection: 'row', gap: 10, backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 8, alignItems: 'flex-start' },
  itemDate: { fontSize: 12, fontWeight: '700', color: colors.ink },
  itemDayLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  itemCatRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  itemCat: { fontSize: 13, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  itemConcept: { fontSize: 12, color: colors.muted, marginTop: 2 },
  itemAmount: { fontSize: 13, fontWeight: '800', color: colors.ink },
  payBtn: { backgroundColor: colors.categorySelectedBg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  payBtnText: { fontSize: 10, fontWeight: '800', color: colors.brand },
});
