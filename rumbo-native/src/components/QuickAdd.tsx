import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

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
    <View style={[styles.wrap, { borderColor: colors.borderStrong, backgroundColor: colors.bgElev }]}>
      <Ionicons name="add" size={20} color={colors.brand} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
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
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 14.5, paddingVertical: 10 },
});
