import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useStore } from '../state/store';
import { colors } from '../theme/colors';
import { CategoryBubble } from './CategoryBubble';
import { PrimaryButton, TextBtn } from './ui';

export function BudgetModal({
  visible,
  initialType,
  onClose,
}: {
  visible: boolean;
  initialType: 'global' | 'category';
  onClose: () => void;
}) {
  const { state, setGlobalBudget, upsertCategoryBudget } = useStore();
  const expenseCategories = state.categories.filter((c) => c.type === 'expense');

  const [type, setType] = useState<'global' | 'category'>('global');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? '');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!visible) return;
    setType(initialType);
    setCategoryId(expenseCategories[0]?.id ?? '');
    setAmount(initialType === 'global' ? String(state.globalBudget || '') : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialType]);

  function save() {
    const value = Number(amount);
    if (!(value > 0)) return;
    if (type === 'global') setGlobalBudget(value);
    else if (categoryId) upsertCategoryBudget(categoryId, value);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Configurar presupuesto</Text>
            <TextBtn label="✕" onPress={onClose} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.segment}>
              <Pressable style={[styles.segmentBtn, type === 'global' && styles.segmentBtnActive]} onPress={() => setType('global')}>
                <Text style={[styles.segmentText, type === 'global' && styles.segmentTextActive]}>Global</Text>
              </Pressable>
              <Pressable style={[styles.segmentBtn, type === 'category' && styles.segmentBtnActive]} onPress={() => setType('category')}>
                <Text style={[styles.segmentText, type === 'category' && styles.segmentTextActive]}>Por categoría</Text>
              </Pressable>
            </View>
          </View>

          {type === 'category' ? (
            <View style={styles.field}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.catRow}>
                {expenseCategories.map((c) => (
                  <Pressable key={c.id} onPress={() => setCategoryId(c.id)} style={[styles.catChip, c.id === categoryId && styles.catChipSelected]}>
                    <CategoryBubble icon={c.icon} color={c.color} size={30} />
                    <Text style={styles.catChipText} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Monto límite</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.input} placeholder="0.00" />
          </View>

          <PrimaryButton label="Guardar presupuesto" onPress={save} disabled={!(Number(amount) > 0)} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 12 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 22, padding: 18, maxHeight: '86%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontWeight: '900', fontSize: 16, color: colors.ink },
  field: { gap: 6, marginVertical: 11 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 12, fontSize: 15, color: colors.ink },
  segment: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 13, padding: 3 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { fontWeight: '800', color: colors.ink },
  segmentTextActive: { color: '#fff' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { width: 74, alignItems: 'center', padding: 6, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  catChipSelected: { borderColor: colors.categorySelectedBorder, backgroundColor: colors.categorySelectedBg },
  catChipText: { fontSize: 11, marginTop: 4, textAlign: 'center', color: colors.ink },
});
