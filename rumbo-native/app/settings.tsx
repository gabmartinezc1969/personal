// Ajustes: perfil, tema, notificaciones y datos.
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Switch, Alert, Share } from 'react-native';

import { Screen, SectionHeader, Chip, Btn } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { ensureNotificationPermission } from '@/src/utils/notifications';
import { ThemeMode } from '@/src/types/models';

const THEME_LABELS: { v: ThemeMode; label: string }[] = [
  { v: 'auto', label: 'Automático' },
  { v: 'light', label: 'Claro' },
  { v: 'dark', label: 'Oscuro' },
];

export default function SettingsScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const [name, setName] = useState(state.user.name);

  const exportData = async () => {
    try {
      await Share.share({ message: JSON.stringify(state, null, 2), title: 'Datos de Rumbo (JSON)' });
    } catch {
      // usuario canceló
    }
  };

  const resetData = () =>
    Alert.alert('Reiniciar datos', 'Se borrarán todos los datos locales y se restaurará el contenido de ejemplo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: () => actions.resetData() },
    ]);

  const toggleNotify = async (v: boolean) => {
    if (v) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Activa las notificaciones para Rumbo en los ajustes del sistema.');
        return;
      }
    }
    actions.setNotifyDevice(v);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <SectionHeader title="Perfil" />
        <TextInput
          style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, padding: 11, color: colors.text, backgroundColor: colors.bgElev }}
          value={name}
          onChangeText={setName}
          onEndEditing={() => actions.setUserName(name)}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textFaint}
        />

        <SectionHeader title="Apariencia" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {THEME_LABELS.map((t) => (
            <Chip key={t.v} label={t.label} selected={state.settings.theme === t.v} onPress={() => actions.setThemeMode(t.v)} />
          ))}
        </View>

        <SectionHeader title="Notificaciones" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ flex: 1, color: colors.text, fontSize: 13.5 }}>Recordatorios como notificaciones del sistema</Text>
          <Switch value={state.settings.notifyDevice} onValueChange={toggleNotify} trackColor={{ true: colors.brand }} />
        </View>
        <Text style={{ color: colors.textFaint, fontSize: 11.5, marginTop: 6 }}>
          Las tareas con fecha, hora y recordatorio programan una notificación local del dispositivo.
        </Text>

        <SectionHeader title="Datos" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Btn label="Exportar JSON" icon="share-outline" onPress={exportData} />
          <Btn label="Reiniciar datos" icon="trash-outline" kind="danger" onPress={resetData} />
        </View>
        <Text style={{ color: colors.textFaint, fontSize: 11.5, marginTop: 10 }}>
          Todos los datos se guardan únicamente en este dispositivo (AsyncStorage). Exporta un respaldo antes de desinstalar la app.
        </Text>
      </ScrollView>
    </Screen>
  );
}
