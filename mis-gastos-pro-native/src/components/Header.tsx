import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';

import { useUI } from '../state/ui';
import { colors } from '../theme/colors';

export function Header({ title }: { title: string }) {
  const { openTxEditor } = useUI();
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>{title}</Text>
      <Pressable style={styles.action} onPress={() => openTxEditor('expense')}>
        <Text style={styles.actionText}>+ Agregar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 22, fontWeight: '900', color: colors.ink },
  action: { backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 13, paddingVertical: 9, paddingHorizontal: 12 },
  actionText: { fontWeight: '800', color: colors.ink },
});
