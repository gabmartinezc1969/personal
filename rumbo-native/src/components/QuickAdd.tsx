import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { FONTS } from '../theme/fonts';

export function QuickAdd({ placeholder, onSubmit }: { placeholder: string; onSubmit: (text: string) => void }) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const submit = () => {
    const v = text.trim();
    if (!v) return;
    onSubmit(v);
    setText('');
  };
  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.bgElev2 }]}>
      <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: colors.brandDim, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="add" size={16} color={colors.brand} />
      </View>
      <TextInput
        style={[styles.input, { color: colors.text, fontFamily: FONTS.semi }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        returnKeyType="done"
        blurOnSubmit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 14.5, paddingVertical: 3 },
});
