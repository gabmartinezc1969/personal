import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { Option } from '../utils/date';
import { TextBtn } from './ui';

export function OptionPickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TextBtn label="✕" onPress={onClose} />
          </View>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.row, item.value === selected && styles.rowSelected]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}>
                <Text style={[styles.rowText, item.value === selected && styles.rowTextSelected]}>{item.label}</Text>
                {item.value === selected ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '86%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 22, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  title: { fontWeight: '900', fontSize: 16, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 8, borderRadius: 12 },
  rowSelected: { backgroundColor: colors.categorySelectedBg },
  rowText: { fontSize: 15, color: colors.ink },
  rowTextSelected: { fontWeight: '800' },
  check: { color: colors.categorySelectedBorder, fontWeight: '900' },
});
