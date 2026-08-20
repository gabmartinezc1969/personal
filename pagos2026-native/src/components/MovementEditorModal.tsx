import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from './AppText';

import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { Category, MovementType } from '../state/types';
import { useUI } from '../state/ui';
import { colors } from '../theme/colors';
import { today } from '../utils/date';
import { CategoryBubble } from './CategoryBubble';
import { CategoryModal } from './CategoryModal';
import { DateField } from './DateField';
import { TextBtn } from './ui';

export function MovementEditorModal() {
  const { editorOpen, editorType, closeEditor } = useUI();
  const { state, addMovement, upsertCategory } = useStore();
  const toast = useToast();

  const [type, setType] = useState<MovementType>('E');
  const [categoryId, setCategoryId] = useState('');
  const [concept, setConcept] = useState('');
  const [budgeted, setBudgeted] = useState('');
  const [actual, setActual] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deductible, setDeductible] = useState(false);
  const [date, setDate] = useState(today());
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (!editorOpen) return;
    setType(editorType);
    setConcept('');
    setBudgeted('');
    setActual('');
    setPaymentMethod('');
    setDeductible(false);
    setDate(today());
  }, [editorOpen, editorType]);

  const categories = useMemo(() => state.categories.filter((c) => c.type === type), [state.categories, type]);

  useEffect(() => {
    if (!categories.some((c) => c.id === categoryId)) setCategoryId(categories[0]?.id ?? '');
  }, [categories, categoryId]);

  function save() {
    const budgetedNum = Number(budgeted.replace(',', '.'));
    if (!categoryId) {
      toast('Elige una categoría');
      return;
    }
    if (!(budgetedNum > 0)) {
      toast('Ingresa un monto presupuestado válido');
      return;
    }
    const actualNum = actual.trim() === '' ? null : Number(actual.replace(',', '.'));
    addMovement({
      type,
      category: categoryId,
      concept: concept.trim() || categoryId,
      budgeted: budgetedNum,
      actual: actualNum,
      paymentMethod: paymentMethod.trim(),
      deductible,
      date,
    });
    closeEditor();
    toast('Movimiento guardado');
  }

  return (
    <Modal visible={editorOpen} transparent animationType="slide" onRequestClose={closeEditor}>
      <Pressable style={styles.overlay} onPress={closeEditor}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <TextBtn label="Cancelar" onPress={closeEditor} />
                <Text style={styles.title}>Agregar movimiento</Text>
                <TextBtn label="Guardar" bold onPress={save} />
              </View>
              <View style={styles.segment}>
                <Pressable style={[styles.segmentBtn, type === 'E' && styles.segmentBtnActive]} onPress={() => setType('E')}>
                  <Text style={[styles.segmentText, type === 'E' && styles.segmentTextActive]}>Gasto</Text>
                </Pressable>
                <Pressable style={[styles.segmentBtn, type === 'I' && styles.segmentBtnActive]} onPress={() => setType('I')}>
                  <Text style={[styles.segmentText, type === 'I' && styles.segmentTextActive]}>Ingreso</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.body}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categoryGrid}>
                {categories.map((c) => (
                  <Pressable key={c.id} style={[styles.categoryCell, c.id === categoryId && styles.categoryCellSelected]} onPress={() => setCategoryId(c.id)}>
                    <CategoryBubble icon={c.icon} color={c.color} size={40} />
                    <Text style={styles.categoryLabel} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
                <Pressable style={styles.categoryCell} onPress={() => setCategoryModalOpen(true)}>
                  <View style={styles.newCategoryBubble}>
                    <Text style={styles.newCategoryPlus}>＋</Text>
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    Nueva
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Concepto</Text>
              <TextInput style={styles.input} value={concept} onChangeText={setConcept} placeholder="Ej. BBVA, Renta AU…" />

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Presupuestado</Text>
                  <TextInput style={styles.input} value={budgeted} onChangeText={setBudgeted} placeholder="0.00" keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Monto real (opcional)</Text>
                  <TextInput style={styles.input} value={actual} onChangeText={setActual} placeholder="Aún pendiente" keyboardType="decimal-pad" />
                </View>
              </View>

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Fecha</Text>
                  <DateField value={date} onChange={setDate} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Método de pago</Text>
                  <TextInput style={styles.input} value={paymentMethod} onChangeText={setPaymentMethod} placeholder="Transferencia…" />
                </View>
              </View>

              <Pressable style={styles.deductibleRow} onPress={() => setDeductible((d) => !d)}>
                <Text style={styles.label}>¿Es deducible de impuestos?</Text>
                <View style={[styles.toggle, deductible && styles.toggleOn]}>
                  <View style={[styles.toggleKnob, deductible && styles.toggleKnobOn]} />
                </View>
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      <CategoryModal
        visible={categoryModalOpen}
        defaultType={type}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(category: Category) => {
          upsertCategory(category);
          setType(category.type);
          setCategoryId(category.id);
          setCategoryModalOpen(false);
          toast('Categoría guardada');
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  kav: { maxHeight: '94%' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  header: { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.line, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontWeight: '900', fontSize: 15, color: colors.ink },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: '#222', borderRadius: 8, overflow: 'hidden' },
  segmentBtn: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { fontWeight: '700', color: colors.ink },
  segmentTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 28 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 12, fontSize: 15, color: colors.ink, marginBottom: 14, backgroundColor: '#fff' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  categoryCell: { width: '25%', alignItems: 'center', paddingVertical: 6, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  categoryCellSelected: { borderColor: colors.categorySelectedBorder, backgroundColor: colors.categorySelectedBg },
  categoryLabel: { fontSize: 10, marginTop: 4, textAlign: 'center', color: colors.ink, paddingHorizontal: 2 },
  newCategoryBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F3F5' },
  newCategoryPlus: { fontSize: 18, color: colors.muted, fontWeight: '700' },
  row2: { flexDirection: 'row', gap: 10 },
  deductibleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: '#E4E6EC', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.brand },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleKnobOn: { transform: [{ translateX: 18 }] },
});
