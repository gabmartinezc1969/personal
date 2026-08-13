import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme/colors';

export function RingProgress({
  percent,
  label,
  value,
  size = 112,
  trackColor = '#eee',
  progressColor = colors.brand,
  labelColor = colors.ink,
  valueColor = colors.ink,
}: {
  percent: number;
  label: string;
  value: string;
  size?: number;
  trackColor?: string;
  progressColor?: string;
  labelColor?: string;
  valueColor?: string;
}) {
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
        <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.center]} pointerEvents="none">
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  label: { fontSize: 12 },
  value: { fontSize: 18, fontWeight: '800', marginTop: 2 },
});
