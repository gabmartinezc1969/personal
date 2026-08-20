import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from './AppText';

import { colors } from '../theme/colors';
import { Category, MovementType } from '../state/types';
import { PrimaryButton, TextBtn } from './ui';

const PALETTE = [
  '#FFE167',
  '#FF9FB6',
  '#73D3D8',
  '#F4B26E',
  '#D8D8D8',
  '#C9A8F5',
  '#C8D983',
  '#F3C991',
  '#8AD0D3',
  '#DDE5A1',
  '#C8D9EA',
  '#E9D3AA',
  '#F6E58D',
  '#C7E7D3',
  '#F3C2C2',
  '#6DCCCF',
  '#BCE8C8',
  '#C5D8F2',
  '#CAB8F1',
  '#73D08B',
  '#72B5E8',
  '#B995DC',
];

export function CategoryModal({
  visible,
  defaultType,
  onClose,
  onSave,
}: {
  visible: boolean;
  defaultType: MovementType;
  onClose: () => void;
  onSave: (category: Category) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧾');
  const [color, setColor] = useState(PALETTE[0]);
  const [type, setType] = useState<MovementType>(defaultType);

  useEffect(() => {
    if (!visible) return;
    setName('');
    setIcon('🧾');
    setColor(PALETTE[0]);
    setType(defaultType);
  }, [visible, defaultType]);

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ id: trimmed, name: trimmed, icon: icon.trim() || '⚪', color, type });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva categoría</Text>
            <TextBtn label="✕" onPress={onClose} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Ej. Colegiaturas" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Icono o emoji</Text>
            <TextInput value={icon} onChangeText={setIcon} style={styles.input} maxLength={4} placeholder="🧾" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
              {PALETTE.map((c) => (
                <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchSelected]} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.segment}>
              <Pressable style={[styles.segmentBtn, type === 'E' && styles.segmentBtnActive]} onPress={() => setType('E')}>
                <Text style={[styles.segmentText, type === 'E' && styles.segmentTextActive]}>Gasto</Text>
              </Pressable>
              <Pressable style={[styles.segmentBtn, type === 'I' && styles.segmentBtnActive]} onPress={() => setType('I')}>
                <Text style={[styles.segmentText, type === 'I' && styles.segmentTextActive]}>Ingreso</Text>
              </Pressable>
            </View>
          </View>

          <PrimaryButton label="Guardar categoría" onPress={save} disabled={!name.trim()} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 12 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 22, padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontWeight: '900', fontSize: 16, color: colors.ink },
  field: { gap: 6, marginVertical: 11 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 12, fontSize: 15, color: colors.ink },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: colors.ink },
  segment: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 13, padding: 3 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { fontWeight: '800', color: colors.ink },
  segmentTextActive: { color: '#fff' },
});
