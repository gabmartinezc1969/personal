import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from './AppText';

import { Movement } from '../state/types';
import { colors } from '../theme/colors';
import { PrimaryButton, TextBtn } from './ui';

export function MarkPaidModal({ movement, onClose, onConfirm }: { movement: Movement | null; onClose: () => void; onConfirm: (amount: number) => void }) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (movement) setAmount(String(movement.budgeted));
  }, [movement]);

  function confirm() {
    const num = Number(amount.replace(',', '.'));
    if (!(num >= 0)) return;
    onConfirm(num);
  }

  return (
    <Modal visible={!!movement} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Marcar pagado</Text>
            <TextBtn label="✕" onPress={onClose} />
          </View>
          {movement ? (
            <Text style={styles.subtitle}>
              {movement.category} · {movement.concept}
            </Text>
          ) : null}
          <View style={styles.field}>
            <Text style={styles.label}>Monto pagado</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.input} placeholder="0.00" autoFocus />
          </View>
          <PrimaryButton label="Registrar pago" onPress={confirm} disabled={!(Number(amount.replace(',', '.')) >= 0)} />
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
  subtitle: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  field: { gap: 6, marginVertical: 11 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 12, fontSize: 15, color: colors.ink },
});
