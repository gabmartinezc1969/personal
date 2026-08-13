import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/src/components/Header';
import { Card } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useToast } from '@/src/state/toast';
import { AppState, Currency, FontScale } from '@/src/state/types';
import { colors } from '@/src/theme/colors';
import { shareTextFile, pickJsonFile } from '@/src/utils/files';

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'MXN', label: 'MXN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const FONT_SCALES: { value: FontScale; label: string; preview: number }[] = [
  { value: 0.9, label: 'Pequeña', preview: 13 },
  { value: 1, label: 'Mediana', preview: 15 },
  { value: 1.15, label: 'Grande', preview: 17 },
  { value: 1.3, label: 'Muy grande', preview: 19 },
];

export default function ProfileScreen() {
  const { state, setCurrency, setFontScale, restoreState, resetState } = useStore();
  const toast = useToast();

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
        <View style={styles.profileHead}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Mi cuenta</Text>
            <Text style={styles.profileSub}>Todo se guarda solo en este dispositivo</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Preferencias</Text>
        <Card style={{ paddingHorizontal: 16 }}>
          <Row>
            <RowText title="Moneda" />
          </Row>
          <View style={styles.segmentGroup}>
            {CURRENCIES.map((c) => {
              const selected = state.currency === c.value;
              return (
                <Pressable key={c.value} style={[styles.segmentBtn, selected && styles.segmentBtnSelected]} onPress={() => setCurrency(c.value)}>
                  <Text style={[styles.segmentBtnText, selected && styles.segmentBtnTextSelected]}>{c.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Row last>
            <RowText title="Tamaño de letra" subtitle="Ajusta el texto de toda la app a tu gusto" />
          </Row>
          <View style={styles.fontScaleRow}>
            {FONT_SCALES.map((opt) => {
              const selected = state.fontScale === opt.value;
              return (
                <Pressable key={opt.value} style={[styles.fontScaleBtn, selected && styles.fontScaleBtnSelected]} onPress={() => setFontScale(opt.value)}>
                  <Text style={[styles.fontScaleLetter, { fontSize: opt.preview }, selected && styles.fontScaleLetterSelected]}>A</Text>
                  <Text style={[styles.fontScaleCaption, selected && styles.fontScaleCaptionSelected]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Tus datos</Text>
        <Card style={{ paddingHorizontal: 16 }}>
          <Row>
            <RowText title="Plantilla de categorías" subtitle="Personaliza nombres, iconos y colores" />
            <PillBtn label="Editar" onPress={() => router.push('/categories')} />
          </Row>
          <Row>
            <RowText title="Respaldo JSON" subtitle="Guarda todos tus movimientos" />
            <PillBtn label="Descargar" onPress={backup} />
          </Row>
          <Row last>
            <RowText title="Restaurar respaldo" subtitle="Importa un archivo previamente generado" />
            <PillBtn label="Importar" onPress={restore} />
          </Row>
        </Card>

        <Text style={styles.sectionLabel}>Zona de peligro</Text>
        <Card style={{ paddingHorizontal: 16 }}>
          <Row last>
            <RowText title="Reiniciar aplicación" subtitle="Elimina los datos almacenados" />
            <PillBtn label="Borrar" danger onPress={reset} />
          </Row>
        </Card>
      </ScrollView>
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
  content: { padding: 16, paddingBottom: 24 },
  profileHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4, marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26 },
  profileName: { fontSize: 18, fontWeight: '800', color: colors.ink },
  profileSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowTitle: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  rowSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  pill: { backgroundColor: '#F2F3F5', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  pillDanger: { backgroundColor: '#FCEBEB' },
  pillText: { fontWeight: '800', color: colors.ink },
  pillTextDanger: { color: colors.danger },
  segmentGroup: { flexDirection: 'row', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 13, backgroundColor: '#F2F3F5' },
  segmentBtnSelected: { backgroundColor: colors.brand },
  segmentBtnText: { fontWeight: '800', color: colors.ink },
  segmentBtnTextSelected: { color: colors.onBrand },
  fontScaleRow: { flexDirection: 'row', gap: 8, paddingVertical: 12 },
  fontScaleBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 13, backgroundColor: '#F2F3F5', borderWidth: 2, borderColor: 'transparent' },
  fontScaleBtnSelected: { backgroundColor: colors.categorySelectedBg, borderColor: colors.categorySelectedBorder },
  fontScaleLetter: { fontWeight: '800', color: colors.ink },
  fontScaleLetterSelected: { color: colors.ink },
  fontScaleCaption: { fontSize: 10, color: colors.muted, marginTop: 4 },
  fontScaleCaptionSelected: { color: colors.ink, fontWeight: '700' },
});
