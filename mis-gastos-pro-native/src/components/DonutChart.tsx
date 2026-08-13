import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import Svg, { Path } from 'react-native-svg';

type Slice = { value: number; color: string };

function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function slicePath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number): string {
  const so = polar(cx, cy, rOuter, start);
  const eo = polar(cx, cy, rOuter, end);
  const ei = polar(cx, cy, rInner, end);
  const si = polar(cx, cy, rInner, start);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${so.x} ${so.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${eo.x} ${eo.y} L ${ei.x} ${ei.y} A ${rInner} ${rInner} 0 ${large} 0 ${si.x} ${si.y} Z`;
}

export function DonutChart({ data, size = 220, centerLabel }: { data: Slice[]; size?: number; centerLabel: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.39;
  const rInner = size * 0.24;
  const total = data.reduce((a, s) => a + s.value, 0);

  // SVG no puede dibujar un arco cuyo punto de inicio coincide con el de fin
  // (caso típico: una sola categoría = 100%): el navegador lo trata como un
  // arco degenerado y no pinta nada. Se recorta el barrido dibujado a un
  // pelo menos de la vuelta completa (imperceptible) para evitarlo.
  const FULL_CIRCLE_EPSILON = 0.001;

  let angle = -Math.PI / 2;
  const paths = total
    ? data
        .filter((s) => s.value > 0)
        .map((s, idx) => {
          const sweep = (s.value / total) * Math.PI * 2;
          const drawnSweep = Math.min(sweep, Math.PI * 2 - FULL_CIRCLE_EPSILON);
          const d = slicePath(cx, cy, rOuter, rInner, angle, angle + drawnSweep);
          angle += sweep;
          return <Path key={idx} d={d} fill={s.color} />;
        })
    : [<Path key="empty" d={slicePath(cx, cy, rOuter, rInner, 0, Math.PI * 2 - FULL_CIRCLE_EPSILON)} fill="#eee" />];

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {paths}
      </Svg>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText} numberOfLines={1} adjustsFontSizeToFit>
            {centerLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  centerText: { fontWeight: '800', fontSize: 16, color: '#171717' },
});
