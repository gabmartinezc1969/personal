import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';

import { colors } from '../theme/colors';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.pill} hitSlop={6}>
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={[styles.primary, disabled && { opacity: 0.5 }]}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function TextBtn({ label, onPress, bold }: { label: string; onPress?: () => void; bold?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={[styles.textBtn, bold && { fontWeight: '800' }]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </Card>
  );
}

export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pill label={action} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  pill: {
    backgroundColor: '#F2F3F5',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillText: { fontWeight: '800', color: colors.ink },
  primary: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: colors.yellow,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryText: { fontWeight: '900', color: colors.ink, fontSize: 15 },
  textBtn: { fontWeight: '800', color: colors.ink, fontSize: 15 },
  empty: { padding: 30, paddingHorizontal: 18, alignItems: 'center' },
  emptyTitle: { fontWeight: '800', color: colors.ink, marginBottom: 5, fontSize: 15 },
  emptySubtitle: { color: colors.muted, textAlign: 'center' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
});
