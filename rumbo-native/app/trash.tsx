// Papelera — restaurar o eliminar definitivamente.
import React from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';

import { Screen, SectionHeader, EmptyState, Btn, IconBtn } from '@/src/components/ui';
import { useStore } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';

export default function TrashScreen() {
  const { state, actions } = useStore();
  const { colors } = useTheme();
  const tasks = state.tasks.filter((t) => t.deletedAt);
  const cards = state.boardTasks.filter((t) => t.deletedAt);

  const purge = (label: string, fn: () => void) =>
    Alert.alert('Eliminar definitivamente', `"${label}" — esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: fn },
    ]);

  if (!tasks.length && !cards.length) {
    return (
      <Screen>
        <EmptyState icon="trash-outline" title="La papelera está vacía" subtitle="Las tareas eliminadas aparecerán aquí y podrás restaurarlas." />
      </Screen>
    );
  }

  const Row = ({ title, deletedAt, onRestore, onPurge }: { title: string; deletedAt: string; onRestore: () => void; onPurge: () => void }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.bgElev,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 11,
        marginBottom: 7,
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textFaint, textDecorationLine: 'line-through', fontWeight: '600' }}>{title}</Text>
        <Text style={{ color: colors.textFaint, fontSize: 11 }}>Eliminada {deletedAt.slice(0, 10)}</Text>
      </View>
      <Btn label="Restaurar" small onPress={onRestore} />
      <IconBtn icon="close" size={16} onPress={onPurge} />
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {tasks.length > 0 && (
          <>
            <SectionHeader title="Tareas personales" />
            {tasks.map((t) => (
              <Row key={t.id} title={t.title} deletedAt={t.deletedAt!} onRestore={() => actions.restoreTask(t.id)} onPurge={() => purge(t.title, () => actions.purgeTask(t.id))} />
            ))}
          </>
        )}
        {cards.length > 0 && (
          <>
            <SectionHeader title="Tarjetas de tablero" />
            {cards.map((t) => (
              <Row key={t.id} title={t.title} deletedAt={t.deletedAt!} onRestore={() => actions.restoreBoardTask(t.id)} onPurge={() => purge(t.title, () => actions.purgeBoardTask(t.id))} />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
