import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';

import { useUI } from '../state/ui';
import { colors } from '../theme/colors';

export function Header({ title }: { title: string }) {
  const { openEditor } = useUI();
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>{title}</Text>
      <Pressable style={styles.action} onPress={() => openEditor('E')}>
        <Text style={styles.actionText}>+ Agregar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.bg,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 24, fontWeight: '900', color: colors.ink },
  action: { backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16 },
  actionText: { fontWeight: '800', color: colors.onBrand },
});
