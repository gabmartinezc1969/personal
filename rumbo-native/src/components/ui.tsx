import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { Priority } from '../types/models';

export const PRIORITY_META: Record<Priority, { label: string; colorKey: 'danger' | 'warn' | 'info' | 'textFaint' }> = {
  high: { label: 'Alta', colorKey: 'danger' },
  medium: { label: 'Media', colorKey: 'warn' },
  low: { label: 'Baja', colorKey: 'info' },
  none: { label: 'Sin prioridad', colorKey: 'textFaint' },
};

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</View>;
}

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: colors.textFaint }]}>{title.toUpperCase()}</Text>
      {right}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.textFaint} style={{ opacity: 0.55, marginBottom: 10 }} />
      <Text style={{ color: colors.textDim, fontWeight: '700', fontSize: 15, marginBottom: 3 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textFaint, textAlign: 'center', fontSize: 13 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function CheckCircle({ checked, priority, onPress, size = 24 }: { checked: boolean; priority?: Priority; onPress: () => void; size?: number }) {
  const { colors } = useTheme();
  const priColor = priority && priority !== 'none' ? colors[PRIORITY_META[priority].colorKey] : colors.borderStrong;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: checked ? colors.brand : priColor,
        backgroundColor: checked ? colors.brand : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {checked ? <Ionicons name="checkmark" size={size * 0.62} color={colors.onBrand} /> : null}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  color,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.brandDim : colors.border,
          borderColor: selected ? colors.brand : 'transparent',
        },
        style,
      ]}>
      <Text style={{ color: color || (selected ? colors.brandStrong : colors.textDim), fontSize: 12.5, fontWeight: '600' }}>{label}</Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

export function MetaPill({ icon, label, tone }: { icon?: keyof typeof Ionicons.glyphMap; label: string; tone?: 'overdue' | 'today' | 'default' }) {
  const { colors } = useTheme();
  const bg = tone === 'overdue' ? colors.dangerDim : tone === 'today' ? colors.brandDim : colors.bgElev2;
  const fg = tone === 'overdue' ? colors.danger : tone === 'today' ? colors.brandStrong : colors.textFaint;
  return (
    <View style={[styles.metaPill, { backgroundColor: bg, borderColor: tone ? 'transparent' : colors.border }]}>
      {icon ? <Ionicons name={icon} size={11} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.onBrand, fontSize: size * 0.42, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { colors } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.bgElev,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  };
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}>
        {children}
      </Pressable>
    );
  return <View style={[base, style]}>{children}</View>;
}

export function Btn({
  label,
  onPress,
  kind = 'default',
  icon,
  small,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'default' | 'primary' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const bg = kind === 'primary' ? colors.brand : kind === 'danger' ? colors.danger : kind === 'ghost' ? 'transparent' : colors.bgElev;
  const fg = kind === 'primary' || kind === 'danger' ? '#ffffff' : colors.text;
  const border = kind === 'primary' ? colors.brand : kind === 'danger' ? colors.danger : kind === 'ghost' ? 'transparent' : colors.borderStrong;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSm,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={small ? 14 : 16} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '700', fontSize: small ? 12.5 : 13.5 }}>{label}</Text>
    </Pressable>
  );
}

export function IconBtn({ icon, onPress, color, size = 20 }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color?: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" style={({ pressed }) => ({ padding: 6, borderRadius: 8, opacity: pressed ? 0.6 : 1 })}>
      <Ionicons name={icon} size={size} color={color || colors.textDim} />
    </Pressable>
  );
}

export function labelStyle(colors: { textDim: string }): TextStyle {
  return { fontSize: 12, fontWeight: '700', color: colors.textDim, marginBottom: 6 };
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionHeaderText: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.7 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
  },
  btnSm: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
});
