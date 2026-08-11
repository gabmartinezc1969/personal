import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { OptionPickerModal } from '@/src/components/OptionPickerModal';
import { Card } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { AppState, Currency } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { shareTextFile, pickJsonFile } from '@/src/utils/files';

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'MXN', label: 'MXN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

export default function ProfileScreen() {
  const { state, setCurrency, restoreState, resetState } = useStore();
  const toast = useToast();
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);

  async function backup() {
    try {
      await shareTextFile('mis-gastos-pro-respaldo.json', JSON.stringify(state, null, 2), 'application/json');
    } catch {
      toast('No se pudo generar el respaldo');
    }
  }

  async function restore() {
    try {
      const content = await pickJsonFile();
      if (!content) return;
      const data = JSON.parse(content) as AppState;
      if (!Array.isArray(data.transactions) || !Array.isArray(data.categories)) throw new Error('invalid');
      restoreState(data);
      toast('Respaldo restaurado');
    } catch {
      toast('Archivo no válido');
    }
  }

  function reset() {
    Alert.alert('Reiniciar aplicación', '¿Eliminar todos los datos de la aplicación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          resetState();
          toast('Datos eliminados');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Yo" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ paddingHorizontal: 16 }}>
          <Row>
            <RowText title="Moneda" />
            <Pressable style={styles.currencyBtn} onPress={() => setCurrencyPickerOpen(true)}>
              <Text style={styles.currencyBtnText}>{state.currency}</Text>
            </Pressable>
          </Row>
          <Row>
            <RowText title="Plantilla de categorías" subtitle="Personaliza nombres, iconos y colores" />
            <PillBtn label="Editar" onPress={() => router.push('/categories')} />
          </Row>
          <Row>
            <RowText title="Respaldo JSON" subtitle="Guarda todos tus movimientos" />
            <PillBtn label="Descargar" onPress={backup} />
          </Row>
          <Row>
            <RowText title="Restaurar respaldo" subtitle="Importa un archivo previamente generado" />
            <PillBtn label="Importar" onPress={restore} />
          </Row>
          <Row last>
            <RowText title="Reiniciar aplicación" subtitle="Elimina los datos almacenados" />
            <PillBtn label="Borrar" danger onPress={reset} />
          </Row>
        </Card>
      </ScrollView>

      <OptionPickerModal
        visible={currencyPickerOpen}
        title="Moneda"
        options={CURRENCIES}
        selected={state.currency}
        onSelect={(v) => setCurrency(v as Currency)}
        onClose={() => setCurrencyPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <View style={[styles.row, last && { borderBottomWidth: 0 }]}>{children}</View>;
}

function RowText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function PillBtn({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={[styles.pill, danger && styles.pillDanger]} onPress={onPress}>
      <Text style={[styles.pillText, danger && styles.pillTextDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowTitle: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  rowSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  currencyBtn: { backgroundColor: '#F2F3F5', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  currencyBtnText: { fontWeight: '800', color: colors.ink },
  pill: { backgroundColor: '#F2F3F5', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  pillDanger: { backgroundColor: '#FCEBEB' },
  pillText: { fontWeight: '800', color: colors.ink },
  pillTextDanger: { color: colors.danger },
});
