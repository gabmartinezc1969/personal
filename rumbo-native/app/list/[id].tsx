// CORE-01 — tareas de una lista personal.
import React from 'react';
import { ScrollView, Alert, View, Text } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';

import { Screen, SectionHeader, EmptyState, IconBtn } from '@/src/components/ui';
import { TaskRow } from '@/src/components/TaskRow';
import { QuickAdd } from '@/src/components/QuickAdd';
import { useStore, activeTasks } from '@/src/state/store';
import { useTheme } from '@/src/theme/useTheme';
import { todayISO } from '@/src/utils/dates';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useStore();
  const { colors } = useTheme();

  const list = state.lists.find((l) => l.id === id);
  if (!list) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Lista no encontrada" />
      </Screen>
    );
  }

  const tasks = activeTasks(state).filter((t) => t.listId === list.id);
  const open = tasks.filter((t) => t.status === 'open').sort((a, b) => a.position - b.position);
  const done = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  const today = todayISO();
  const inMyDay = (taskId: string) => (state.myDay[today]?.taskIds || []).includes(taskId);

  const confirmArchive = () =>
    Alert.alert('Archivar lista', `¿Archivar "${list.name}"? Sus tareas dejarán de mostrarse.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Archivar', style: 'destructive', onPress: () => { actions.archiveList(list.id); router.back(); } },
    ]);

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: list.name,
          headerRight: () => <IconBtn icon="archive-outline" onPress={confirmArchive} />,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: list.color }} />
          <Text style={{ color: colors.textFaint, fontSize: 12.5, fontWeight: '600' }}>
            {open.length} pendientes · {done.length} completadas
          </Text>
        </View>
        <QuickAdd placeholder="Añadir tarea…" onSubmit={(text) => actions.addQuickTask(list.id, text)} />
        {open.length === 0 ? (
          <EmptyState icon="checkmark-done-outline" title="Todo listo" subtitle="No hay tareas pendientes en esta lista." />
        ) : (
          open.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onPress={() => router.push(`/task/${t.id}`)}
              onToggle={() => actions.toggleTaskStatus(t.id)}
              inMyDay={inMyDay(t.id)}
              onToggleMyDay={() => actions.toggleMyDay(t.id, today)}
            />
          ))
        )}
        {done.length > 0 && (
          <>
            <SectionHeader title={`Completadas (${done.length})`} />
            {done.map((t) => (
              <TaskRow key={t.id} task={t} onPress={() => router.push(`/task/${t.id}`)} onToggle={() => actions.toggleTaskStatus(t.id)} />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
