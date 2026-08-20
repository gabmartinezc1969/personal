import React from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, TextInputProps, TextProps, TextStyle } from 'react-native';

import { useStore } from '../state/store';

// Escalado de tipografía controlado por el usuario (Yo → Tamaño de letra),
// no por el ajuste de accesibilidad del sistema (ese se desactivó en
// textDefaults.ts porque rompía el diseño de forma impredecible). Este
// multiplicador se aplica sólo a los estilos que ya traen un `fontSize`
// explícito, así que los glyphs/iconos decorativos (que usan <Text> de
// react-native directamente) no se ven afectados.
function scaleStyle(style: TextStyle | undefined, scale: number): TextStyle | undefined {
  if (!style || scale === 1) return style;
  const next: TextStyle = { ...style };
  if (typeof style.fontSize === 'number') next.fontSize = style.fontSize * scale;
  if (typeof style.lineHeight === 'number') next.lineHeight = style.lineHeight * scale;
  return next;
}

export function useFontScale(): number {
  const { state } = useStore();
  return state.fontScale ?? 1;
}

export function AppText({ style, ...rest }: TextProps) {
  const scale = useFontScale();
  const flat = StyleSheet.flatten(style);
  return <RNText {...rest} style={scaleStyle(flat, scale)} />;
}

export function AppTextInput({ style, ...rest }: TextInputProps) {
  const scale = useFontScale();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  return <RNTextInput {...rest} style={scaleStyle(flat, scale)} />;
}
