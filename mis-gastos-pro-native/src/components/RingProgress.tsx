import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme/colors';

export function RingProgress({ percent, label, value, size = 112 }: { percent: number; label: string; value: string; size?: number }) {
  const stroke = 17;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="#eee" strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.yellow}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.center]} pointerEvents="none">
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  label: { fontSize: 12, color: colors.ink },
  value: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 2 },
});
