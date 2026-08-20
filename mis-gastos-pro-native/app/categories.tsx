import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBubble } from '@/src/components/CategoryBubble';
import { CategoryModal } from '@/src/components/CategoryModal';
import { useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { Category, TxType } from '@/src/state/types';
import { colors } from '@/src/theme/colors';

export default function CategoriesScreen() {
  const { state, upsertCategory } = useStore();
  const toast = useToast();
  const [type, setType] = useState<TxType>('expense');
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });

  const list = useMemo(() => state.categories.filter((c) => c.type === type), [state.categories, type]);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.segment}>
        <Pressable style={[styles.segmentBtn, type === 'expense' && styles.segmentBtnActive]} onPress={() => setType('expense')}>
          <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Gastos</Text>
        </Pressable>
        <Pressable style={[styles.segmentBtn, type === 'income' && styles.segmentBtnActive]} onPress={() => setType('income')}>
          <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Ingreso</Text>
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable style={styles.cell} onPress={() => setModal({ open: true, editing: item })}>
            <CategoryBubble icon={item.icon} color={item.color} />
            <Text style={styles.cellLabel} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.addBtn} onPress={() => setModal({ open: true, editing: null })}>
        <Text style={styles.addBtnText}>＋ Nueva categoría</Text>
      </Pressable>

      <CategoryModal
        visible={modal.open}
        editing={modal.editing}
        defaultType={type}
        onClose={() => setModal({ open: false, editing: null })}
        onSave={(category) => {
          upsertCategory(category);
          setType(category.type);
          setModal({ open: false, editing: null });
          toast('Categoría guardada');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  segment: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 13, padding: 3, margin: 16, marginBottom: 6 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { fontWeight: '800', color: colors.ink },
  segmentTextActive: { color: '#fff' },
  grid: { padding: 8, paddingBottom: 90 },
  cell: { width: '25%', alignItems: 'center', paddingVertical: 10 },
  cellLabel: { fontSize: 11, marginTop: 4, textAlign: 'center', color: colors.ink, paddingHorizontal: 2 },
  addBtn: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { fontWeight: '900', color: colors.onBrand },
});
