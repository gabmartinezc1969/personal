import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { FONTS } from '../theme/fonts';
import { Priority } from '../types/models';

export const PRIORITY_META: Record<Priority, { label: string; colorKey: 'danger' | 'warn' | 'info' | 'textFaint' }> = {
  high: { label: 'Alta', colorKey: 'danger' },
  medium: { label: 'Media', colorKey: 'warn' },
  low: { label: 'Baja', colorKey: 'info' },
  none: { label: 'Sin prioridad', colorKey: 'textFaint' },
};

// Resplandor ambiental púrpura→azul en la esquina superior (dirección "Rumbo
// Dark"). En tema claro los tokens de glow son transparentes, así que esto
// no pinta nada — no hace falta condicionar por esquema.
export function Screen({ children, style, glow = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; glow?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {glow && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={[colors.glowTop, 'transparent']}
            style={{ position: 'absolute', top: -140, left: -80, width: 320, height: 320, borderRadius: 200 }}
          />
          <LinearGradient
            colors={[colors.glowBottom, 'transparent']}
            style={{ position: 'absolute', top: -60, right: -100, width: 280, height: 280, borderRadius: 200 }}
          />
        </View>
      )}
      {children}
    </View>
  );
}

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: colors.textFaint, fontFamily: FONTS.bold }]}>{title.toUpperCase()}</Text>
      {right}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.bgElev2, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Ionicons name={icon} size={28} color={colors.textFaint} />
      </View>
      <Text style={{ color: colors.text, fontFamily: FONTS.extra, fontSize: 16, marginBottom: 4 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textFaint, textAlign: 'center', fontSize: 13, lineHeight: 18 }}>{subtitle}</Text> : null}
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

// Estilo "segmented control" (como los rangos 1D/1W/1M de la referencia):
// seleccionado = superficie violeta suave, no seleccionado = superficie
// plana neutra. Sin bordes gruesos ni relieve.
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
          backgroundColor: selected ? colors.brandDim : colors.bgElev2,
          borderColor: selected ? colors.brand : colors.border,
        },
        style,
      ]}>
      <Text style={{ color: color || (selected ? colors.brandStrong : colors.textDim), fontSize: 12.5, fontFamily: FONTS.bold }}>{label}</Text>
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
      <Text style={{ color: fg, fontSize: 11, fontFamily: FONTS.bold }}>{label}</Text>
    </View>
  );
}

// Chip de variación tipo "+6.99%" de la referencia (superficie verde menta,
// texto verde brillante), o rojo si es negativo.
export function DeltaPill({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const { colors } = useTheme();
  const positive = value >= 0;
  const bg = positive ? colors.okDim : colors.dangerDim;
  const fg = positive ? colors.ok : colors.danger;
  return (
    <View style={[styles.metaPill, { backgroundColor: bg, borderColor: 'transparent' }]}>
      <Ionicons name={positive ? 'arrow-up' : 'arrow-down'} size={11} color={fg} />
      <Text style={{ color: fg, fontSize: 11.5, fontFamily: FONTS.extra }}>
        {Math.abs(value).toFixed(2)}
        {suffix}
      </Text>
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
      <Text style={{ color: colors.onBrand, fontSize: size * 0.42, fontFamily: FONTS.extra }}>{initials}</Text>
    </View>
  );
}

// Tarjeta oscura elevada de borde sutil (sin sombra pesada — en fondos
// oscuros la sombra apenas se nota; el borde es lo que separa la superficie).
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { colors } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.bgElev,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  };
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.8 : 1 }, style]}>
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
  textColor,
}: {
  label: string;
  onPress: () => void;
  kind?: 'default' | 'primary' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}) {
  const { colors } = useTheme();
  const shape = [styles.btn, small && styles.btnSm, { opacity: disabled ? 0.5 : 1 }, style];
  const label_ = (
    <>
      {icon ? <Ionicons name={icon} size={small ? 14 : 17} color={textColor || colors.onBrand} /> : null}
      <Text style={{ color: textColor || colors.onBrand, fontFamily: FONTS.extra, fontSize: small ? 13 : 15, letterSpacing: 0.1 }}>{label}</Text>
    </>
  );

  if (kind === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.88 : 1 }, style]}>
        <LinearGradient colors={[colors.gradientFrom, colors.gradientTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, small && styles.btnSm]}>
          {icon ? <Ionicons name={icon} size={small ? 14 : 17} color="#FFFFFF" /> : null}
          <Text style={{ color: '#FFFFFF', fontFamily: FONTS.extra, fontSize: small ? 13 : 15, letterSpacing: 0.1 }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const bg = kind === 'danger' ? colors.dangerDim : kind === 'ghost' ? 'transparent' : colors.bgElev2;
  const fg = textColor || (kind === 'danger' ? colors.danger : colors.text);
  const border = kind === 'ghost' ? 'transparent' : colors.border;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [...shape, { backgroundColor: bg, borderColor: border, borderWidth: kind === 'ghost' ? 0 : 1, opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }]}>
      {icon ? <Ionicons name={icon} size={small ? 14 : 17} color={fg} /> : null}
      <Text style={{ color: fg, fontFamily: FONTS.extra, fontSize: small ? 13 : 15, letterSpacing: 0.1 }}>{label}</Text>
    </Pressable>
  );
}

export function IconBtn({ icon, onPress, color, size = 20 }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color?: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => ({ padding: 7, borderRadius: 10, backgroundColor: pressed ? colors.bgElev2 : 'transparent' })}>
      <Ionicons name={icon} size={size} color={color || colors.textDim} />
    </Pressable>
  );
}

export function labelStyle(colors: { textDim: string }): TextStyle {
  return { fontSize: 12, fontFamily: FONTS.bold, color: colors.textDim, marginBottom: 6 };
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 9,
    paddingHorizontal: 2,
  },
  sectionHeaderText: { fontSize: 11.5, letterSpacing: 0.8 },
  empty: { alignItems: 'center', paddingVertical: 44, paddingHorizontal: 24 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnSm: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 },
});
