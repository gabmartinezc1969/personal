import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';

import { Category, Currency, Movement } from '../state/types';
import { colors } from '../theme/colors';
import { movementAmount } from '../state/store';
import { formatMoney } from '../utils/money';
import { CategoryBubble } from './CategoryBubble';

export function MovementRow({ movement, category, currency, onDelete }: { movement: Movement; category: Category; currency: Currency; onDelete: () => void }) {
  const pending = movement.actual === null;
  return (
    <View style={styles.row}>
      <CategoryBubble icon={category.icon} color={category.color} size={46} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {movement.concept}
          {pending ? ' · pendiente' : ''}
        </Text>
      </View>
      <Text style={[styles.amount, movement.type === 'E' ? styles.expense : styles.income, pending && styles.pending]}>
        {movement.type === 'E' ? '−' : '+'}
        {formatMoney(movementAmount(movement), currency)}
      </Text>
      <Pressable onPress={onDelete} hitSlop={10}>
        <Text style={styles.delete}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 18, padding: 12, marginBottom: 8 },
  info: { flex: 1, minWidth: 0 },
  name: { fontWeight: '700', color: colors.ink },
  sub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  amount: { fontWeight: '800', fontVariant: ['tabular-nums'] },
  expense: { color: colors.expenseText },
  income: { color: colors.incomeText },
  pending: { opacity: 0.55 },
  delete: { color: '#c3c6d1', fontSize: 20, paddingHorizontal: 4 },
});
