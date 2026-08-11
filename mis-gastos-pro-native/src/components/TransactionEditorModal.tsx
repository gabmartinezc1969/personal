import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { Category, TxType } from '../state/types';
import { useUI } from '../state/ui';
import { colors } from '../theme/colors';
import { safeEvaluate } from '../utils/calc';
import { today } from '../utils/date';
import { CategoryBubble } from './CategoryBubble';
import { CategoryModal } from './CategoryModal';
import { DateField } from './DateField';
import { OptionPickerModal } from './OptionPickerModal';
import { TextBtn } from './ui';

const KEYS = ['7', '8', '9', 'Hoy', '4', '5', '6', '+', '1', '2', '3', '−', '.', '0', '⌫', '='];
const ACCOUNTS = ['Efectivo', 'Débito', 'Crédito', 'Ahorros'];

export function TransactionEditorModal() {
  const { txEditorOpen, txEditorType, closeTxEditor } = useUI();
  const { state, addTransaction, upsertCategory } = useStore();
  const toast = useToast();

  const [type, setType] = useState<TxType>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expression, setExpression] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(today());
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });

  useEffect(() => {
    if (!txEditorOpen) return;
    setType(txEditorType);
    setExpression('');
    setMemo('');
    setDate(today());
    setAccount(ACCOUNTS[0]);
  }, [txEditorOpen, txEditorType]);

  const categories = useMemo(() => state.categories.filter((c) => c.type === type), [state.categories, type]);

  useEffect(() => {
    if (!categories.some((c) => c.id === selectedCategory)) setSelectedCategory(categories[0]?.id ?? '');
  }, [categories, selectedCategory]);

  function keyPress(key: string) {
    if (key === '⌫') setExpression((e) => e.slice(0, -1));
    else if (key === 'C') setExpression('');
    else if (key === '=') {
      const value = safeEvaluate(expression);
      if (value === null) {
        toast('Operación no válida');
        return;
      }
      setExpression(String(value));
    } else if (key === 'Hoy') setDate(today());
    else setExpression((e) => e + (key === '−' ? '-' : key));
  }

  function save() {
    const amount = safeEvaluate(expression || '0');
    if (!amount || amount <= 0) {
      toast('Ingresa un monto válido');
      return;
    }
    addTransaction({ type, categoryId: selectedCategory, amount, date, note: memo.trim(), account });
    closeTxEditor();
    toast('Transacción guardada');
  }

  function goToTemplateManager() {
    closeTxEditor();
    router.push('/categories');
  }

  return (
    <Modal visible={txEditorOpen} transparent animationType="slide" onRequestClose={closeTxEditor}>
      <Pressable style={styles.overlay} onPress={closeTxEditor}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <TextBtn label="Cancelar" onPress={closeTxEditor} />
                <Text style={styles.title}>Agregar</Text>
                <TextBtn label="Guardar" bold onPress={save} />
              </View>
              <View style={styles.segment}>
                <Pressable style={[styles.segmentBtn, type === 'expense' && styles.segmentBtnActive]} onPress={() => setType('expense')}>
                  <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Gastos</Text>
                </Pressable>
                <Pressable style={[styles.segmentBtn, type === 'income' && styles.segmentBtnActive]} onPress={() => setType('income')}>
                  <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Ingreso</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
              <View style={styles.categoryGrid}>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    style={[styles.categoryCell, c.id === selectedCategory && styles.categoryCellSelected]}
                    onPress={() => setSelectedCategory(c.id)}
                    onLongPress={() => setCategoryModal({ open: true, editing: c })}>
                    <CategoryBubble icon={c.icon} color={c.color} />
                    <Text style={styles.categoryLabel} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.templateTools}>
                <Pressable style={styles.toolBtn} onPress={() => setCategoryModal({ open: true, editing: null })}>
                  <Text style={styles.toolBtnText}>＋ Nueva categoría</Text>
                </Pressable>
                <Pressable style={styles.toolBtn} onPress={goToTemplateManager}>
                  <Text style={styles.toolBtnText}>✎ Personalizar plantilla</Text>
                </Pressable>
              </View>

              <View style={styles.calculator}>
                <Text style={styles.calcDisplay} numberOfLines={1} adjustsFontSizeToFit>
                  {expression || '0'}
                </Text>
                <TextInput style={styles.memo} value={memo} onChangeText={setMemo} placeholder="Memorándum: Introduce una nota…" />
                <View style={styles.keypad}>
                  {KEYS.map((k) => (
                    <Pressable key={k} style={[styles.key, k === '=' && styles.keyEqual, k === 'Hoy' && styles.keyAction]} onPress={() => keyPress(k)}>
                      <Text style={[styles.keyText, k === '=' && styles.keyEqualText]}>{k}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.dateAccount}>
                  <DateField value={date} onChange={setDate} />
                  <Pressable style={styles.field} onPress={() => setAccountPickerOpen(true)}>
                    <Text style={styles.text}>{account}</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      <CategoryModal
        visible={categoryModal.open}
        editing={categoryModal.editing}
        defaultType={type}
        onClose={() => setCategoryModal({ open: false, editing: null })}
        onSave={(category) => {
          upsertCategory(category);
          setType(category.type);
          setSelectedCategory(category.id);
          setCategoryModal({ open: false, editing: null });
          toast('Categoría guardada');
        }}
      />

      <OptionPickerModal
        visible={accountPickerOpen}
        title="Cuenta"
        options={ACCOUNTS.map((a) => ({ value: a, label: a }))}
        selected={account}
        onSelect={setAccount}
        onClose={() => setAccountPickerOpen(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  kav: { maxHeight: '94%' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  header: { backgroundColor: colors.yellow, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontWeight: '900', fontSize: 16, color: colors.ink },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: '#222', borderRadius: 8, overflow: 'hidden' },
  segmentBtn: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { fontWeight: '700', color: colors.ink },
  segmentTextActive: { color: '#fff' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 11, paddingVertical: 12 },
  categoryCell: { width: '25%', alignItems: 'center', paddingVertical: 6, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  categoryCellSelected: { borderColor: colors.categorySelectedBorder, backgroundColor: colors.categorySelectedBg },
  categoryLabel: { fontSize: 11, marginTop: 4, textAlign: 'center', color: colors.ink, paddingHorizontal: 2 },
  templateTools: { flexDirection: 'row', gap: 8, paddingHorizontal: 15, marginBottom: 12 },
  toolBtn: { flex: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  toolBtnText: { fontWeight: '700', color: colors.ink, fontSize: 12 },
  calculator: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingTop: 12, paddingBottom: 16 },
  calcDisplay: { fontSize: 34, textAlign: 'right', paddingVertical: 8, minHeight: 57, color: colors.ink, fontWeight: '600' },
  memo: { backgroundColor: '#fff', borderRadius: 8, padding: 13, marginBottom: 10, color: colors.ink },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  key: { width: '23.2%', backgroundColor: '#fff', borderRadius: 7, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  keyAction: { backgroundColor: '#fff7ce' },
  keyEqual: { backgroundColor: colors.yellow },
  keyText: { fontSize: 20, color: colors.ink },
  keyEqualText: { fontWeight: '900' },
  dateAccount: { flexDirection: 'row', gap: 8, marginTop: 9 },
  field: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, justifyContent: 'center' },
  text: { color: colors.ink, fontWeight: '600' },
});
