import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';

import { colors } from '../theme/colors';
import { toDateKey } from '../utils/date';
import { TextBtn } from './ui';

function parseDateKey(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1, 12);
}

export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const dateObj = parseDateKey(value);
  const label = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj);

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (selected && event.type === 'set') onChange(toDateKey(selected));
  }

  function openPicker() {
    if (Platform.OS === 'android') {
      // En Android usamos la API imperativa: renderizar <DateTimePicker>
      // declarativamente dentro del <Modal> del sheet "Agregar" hace que el
      // diálogo nativo del calendario quede detrás de la ventana del Modal
      // (bug conocido de @react-native-community/datetimepicker con Modals
      // anidados) — al tocar la fecha parecía no pasar nada. La API
      // imperativa abre el diálogo nativo directamente sobre la Activity,
      // sin ese problema de apilamiento de ventanas.
      DateTimePickerAndroid.open({ value: dateObj, mode: 'date', onChange: handleChange });
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={styles.text}>{label}</Text>
      </Pressable>

      {Platform.OS !== 'android' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <TextBtn label="Listo" bold onPress={() => setOpen(false)} />
              </View>
              <DateTimePicker value={dateObj} mode="date" display="spinner" onChange={handleChange} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, justifyContent: 'center' },
  text: { color: colors.ink, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  sheetHeader: { alignItems: 'flex-end', padding: 12 },
});
