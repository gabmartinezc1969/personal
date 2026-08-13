import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';

import { Category, Currency, Transaction } from '../state/types';
import { colors } from '../theme/colors';
import { formatMoney } from '../utils/money';
import { CategoryBubble } from './CategoryBubble';

export function TransactionRow({ tx, category, currency, onDelete }: { tx: Transaction; category: Category; currency: Currency; onDelete: () => void }) {
  return (
    <View style={styles.row}>
      <CategoryBubble icon={category.icon} color={category.color} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {tx.note || tx.account || ''}
        </Text>
      </View>
      <Text style={[styles.amount, tx.type === 'expense' ? styles.expense : styles.income]}>
        {tx.type === 'expense' ? '−' : '+'}
        {formatMoney(tx.amount, currency)}
      </Text>
      <Pressable onPress={onDelete} hitSlop={10}>
        <Text style={styles.delete}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f1f2' },
  info: { flex: 1, minWidth: 0 },
  name: { fontWeight: '700', color: colors.ink },
  sub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  amount: { fontWeight: '800', fontVariant: ['tabular-nums'] },
  expense: { color: colors.expenseText },
  income: { color: colors.incomeText },
  delete: { color: '#aaa', fontSize: 20, paddingHorizontal: 4 },
});
